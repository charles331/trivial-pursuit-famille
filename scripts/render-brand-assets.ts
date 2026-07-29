/**
 * Rasterise les visuels de marque : `assets-source/*.svg` -> `public/*.png`.
 *
 * Les messageries et les réseaux sociaux n'affichent pas de SVG dans la carte
 * d'aperçu d'un lien, et iOS attend un PNG pour l'icône d'écran d'accueil. Les
 * PNG sont donc versionnés dans `public/`, mais ils restent dérivés : toute
 * retouche se fait dans le SVG, puis
 *
 *   npm run assets:brand
 *
 * Le rendu passe par Chromium, seul moteur déjà présent sur la machine capable
 * de rasteriser du SVG avec du texte. Chemin surchargeable par CHROMIUM_PATH.
 */

import { deflateSync, inflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

interface Target {
  source: string;
  output: string;
  width: number;
  height: number;
}

const TARGETS: Target[] = [
  { source: 'og-image.svg', output: 'og-image.png', width: 1200, height: 630 },
  { source: 'apple-touch-icon.svg', output: 'apple-touch-icon.png', width: 180, height: 180 },
  { source: 'favicon-32.svg', output: 'favicon-32.png', width: 32, height: 32 },
];

// Chromium refuse d'ouvrir une fenêtre plus petite que cela : on capture donc
// plus large que nécessaire, puis on recadre.
const MIN_WINDOW_WIDTH = 800;
const MIN_WINDOW_HEIGHT = 600;

const CHROMIUM_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter((candidate): candidate is string => Boolean(candidate));

function findChromium(): string {
  const found = CHROMIUM_CANDIDATES.find(candidate => existsSync(candidate));
  if (!found) {
    throw new Error(
      'Chromium introuvable. Indiquez son chemin : CHROMIUM_PATH=/chemin/vers/chrome'
        + ' npm run assets:brand',
    );
  }
  return found;
}

// --- PNG : juste ce qu'il faut pour recadrer une capture ---------------------
// `--screenshot` produit une image de la taille de la fenêtre demandée, alors
// que la page n'est mise en page que sur la hauteur utile de celle-ci. Les
// lignes en trop, en bas, sont vides : il faut les retirer.

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

interface DecodedPng {
  width: number;
  height: number;
  channels: number;
  rows: Buffer[];
}

function decodePng(file: Buffer): DecodedPng {
  let offset = 8;
  let header: { width: number; height: number; channels: number } | null = null;
  const parts: Buffer[] = [];

  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString('ascii', offset + 4, offset + 8);
    const data = file.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      const bitDepth = data[8];
      const colorType = data[9];
      const interlace = data[12];
      const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType as 0 | 2 | 4 | 6];
      if (bitDepth !== 8 || interlace !== 0 || !channels) {
        throw new Error(`Capture PNG inattendue (profondeur ${bitDepth}, type ${colorType}).`);
      }
      header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), channels };
    } else if (type === 'IDAT') {
      parts.push(Buffer.from(data));
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  if (!header) throw new Error('Capture PNG sans en-tête IHDR.');

  const { width, height, channels } = header;
  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * channels;
  const rows: Buffer[] = [];
  let previous = Buffer.alloc(stride);
  let cursor = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor];
    cursor += 1;
    const line = Buffer.from(raw.subarray(cursor, cursor + stride));
    cursor += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? line[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      if (filter === 1) line[x] = (line[x] + left) & 0xff;
      else if (filter === 2) line[x] = (line[x] + up) & 0xff;
      else if (filter === 3) line[x] = (line[x] + ((left + up) >> 1)) & 0xff;
      else if (filter === 4) {
        const predictor = left + up - upLeft;
        const dLeft = Math.abs(predictor - left);
        const dUp = Math.abs(predictor - up);
        const dUpLeft = Math.abs(predictor - upLeft);
        const best = dLeft <= dUp && dLeft <= dUpLeft ? left : dUp <= dUpLeft ? up : upLeft;
        line[x] = (line[x] + best) & 0xff;
      }
    }
    rows.push(line);
    previous = line;
  }

  return { width, height, channels, rows };
}

/**
 * Retire le canal alpha quand il ne sert à rien : la carte d'aperçu est un
 * visuel opaque, et l'octet de transparence par pixel pèse un quart du fichier
 * que les messageries doivent télécharger.
 */
function dropOpaqueAlpha(image: DecodedPng): DecodedPng {
  if (image.channels !== 4 && image.channels !== 2) return image;
  const opaque = image.rows.every((row) => {
    for (let x = image.channels - 1; x < row.length; x += image.channels) {
      if (row[x] !== 0xff) return false;
    }
    return true;
  });
  if (!opaque) return image;

  const channels = image.channels - 1;
  const rows = image.rows.map((row) => {
    const stripped = Buffer.alloc(image.width * channels);
    for (let pixel = 0; pixel < image.width; pixel += 1) {
      row.copy(stripped, pixel * channels, pixel * image.channels, pixel * image.channels + channels);
    }
    return stripped;
  });
  return { ...image, channels, rows };
}

/**
 * Réencode l'image en essayant chaque filtre PNG et en gardant le plus court.
 *
 * L'écart n'est pas anecdotique sur un visuel en dégradé — d'un filtre à
 * l'autre le fichier varie du tiers — et c'est ce fichier que chaque messagerie
 * télécharge pour composer son aperçu.
 */
function filterRows(rows: Buffer[], stride: number, channels: number, type: number): Buffer {
  const scanlines: Buffer[] = [];
  let previous = Buffer.alloc(stride);

  for (const row of rows) {
    const filtered = Buffer.alloc(stride + 1);
    filtered[0] = type;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      let predictor = 0;
      if (type === 1) predictor = left;
      else if (type === 2) predictor = up;
      else if (type === 4) {
        const estimate = left + up - upLeft;
        const dLeft = Math.abs(estimate - left);
        const dUp = Math.abs(estimate - up);
        const dUpLeft = Math.abs(estimate - upLeft);
        predictor = dLeft <= dUp && dLeft <= dUpLeft ? left : dUp <= dUpLeft ? up : upLeft;
      }
      filtered[x + 1] = (row[x] - predictor) & 0xff;
    }
    scanlines.push(filtered);
    previous = row;
  }
  return Buffer.concat(scanlines);
}

function encodePng(width: number, rows: Buffer[], channels: number): Buffer {
  const stride = width * channels;
  const compressed = [0, 1, 2, 4]
    .map(type => deflateSync(filterRows(rows, stride, channels, type), { level: 9 }))
    .reduce((best, candidate) => (candidate.length < best.length ? candidate : best));

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(rows.length, 4);
  ihdr[8] = 8;
  ihdr[9] = channels === 4 ? 6 : channels === 3 ? 2 : channels === 2 ? 4 : 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- Rendu -------------------------------------------------------------------

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, 'assets-source');
const publicDir = path.join(projectRoot, 'public');
const chromium = findChromium();
const workDir = mkdtempSync(path.join(tmpdir(), 'brand-assets-'));

function capture(html: string, width: number, height: number): DecodedPng {
  const pagePath = path.join(workDir, 'page.html');
  const shotPath = path.join(workDir, 'shot.png');
  writeFileSync(pagePath, html);
  execFileSync(chromium, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--default-background-color=00000000',
    `--screenshot=${shotPath}`,
    `--window-size=${width},${height}`,
    `file://${pagePath}`,
  ], { stdio: 'pipe' });
  return decodePng(readFileSync(shotPath));
}

function wrap(body: string, style = ''): string {
  return '<!doctype html><html><head><meta charset="utf-8"><style>'
    + `html,body{margin:0;padding:0;background:transparent;overflow:hidden}${style}`
    + `</style></head><body>${body}</body></html>`;
}

/**
 * Hauteur perdue entre la fenêtre demandée et la zone réellement mise en page.
 * Elle dépend de la version de Chromium, on la mesure donc au lieu de la
 * supposer : un aplat opaque, et l'on compte les lignes peintes.
 */
function measureViewportDeficit(): number {
  const probeHeight = 400;
  const probe = capture(
    wrap('<div id="p"></div>', '#p{width:100%;height:4000px;background:#ff00ff}'),
    MIN_WINDOW_WIDTH,
    probeHeight,
  );
  let painted = 0;
  for (const row of probe.rows) {
    if (row[0] === 0xff && row[1] === 0x00 && row[2] === 0xff) painted += 1;
  }
  if (painted === 0 || painted > probeHeight) {
    throw new Error('Calibrage du rendu impossible : aucune ligne peinte détectée.');
  }
  return probeHeight - painted;
}

/** Découpe le coin haut-gauche : c'est là que la page pose le visuel. */
function cropTopLeft(image: DecodedPng, width: number, height: number): DecodedPng {
  const rows = image.rows.slice(0, height).map(
    row => Buffer.from(row.subarray(0, width * image.channels)),
  );
  return { ...image, width, height, rows };
}

try {
  const deficit = measureViewportDeficit();
  if (deficit > 0) {
    console.log(`Calibrage : ${deficit} px de fenêtre non mis en page, compensés.`);
  }

  for (const target of TARGETS) {
    const sourcePath = path.join(sourceDir, target.source);
    if (!existsSync(sourcePath)) {
      throw new Error(`Source absente : ${path.relative(projectRoot, sourcePath)}`);
    }

    // Le SVG est posé à sa taille exacte dans le coin haut-gauche d'une page
    // sans marge, puis la capture est recadrée. Le dimensionner en unités de vue
    // le déformerait : Chromium refuse d'ouvrir une fenêtre étroite, et une
    // icône de 32 px se retrouvait étirée sur des centaines de pixels.
    const shot = capture(
      wrap(
        readFileSync(sourcePath, 'utf-8'),
        `svg{display:block;width:${target.width}px;height:${target.height}px}`,
      ),
      Math.max(target.width, MIN_WINDOW_WIDTH),
      Math.max(target.height + deficit, MIN_WINDOW_HEIGHT),
    );

    if (shot.width < target.width || shot.rows.length < target.height) {
      throw new Error(
        `Capture de ${target.source} en ${shot.width}×${shot.rows.length},`
          + ` trop petite pour ${target.width}×${target.height}.`,
      );
    }

    const flattened = dropOpaqueAlpha(cropTopLeft(shot, target.width, target.height));
    const cropped = encodePng(target.width, flattened.rows, flattened.channels);
    writeFileSync(path.join(publicDir, target.output), cropped);
    console.log(
      `${target.source} -> public/${target.output}`
        + ` (${target.width}×${target.height}, ${Math.round(cropped.length / 1024)} ko)`,
    );
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`Visuels rasterisés avec ${chromium}.`);
