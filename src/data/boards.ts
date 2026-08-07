import { BoardConfig, BoardTile, CategoryId, BoardType } from '../types';
import { CATEGORIES } from './categories';

// Helper to generate coordinates on a circle
function circlePoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: Math.round(cx + r * Math.cos(rad)),
    y: Math.round(cy + r * Math.sin(rad))
  };
}

/**
 * Les six catégories d'un plateau, dans l'ordre où elles se posent sur ses cases
 * et dans le porte-camemberts des pions.
 *
 * Six, et exactement six : la roue a six branches et le camembert six parts.
 * C'est aussi le nombre de cases camembert et de places dans la légende des
 * couleurs — décision du propriétaire du projet, ADR 0007.
 */
export const BOARD_CATEGORY_COUNT = 6;

/** La sélection par défaut, celle des salons qui n'en ont pas choisi. */
export const DEFAULT_BOARD_CATEGORIES: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports'
];

/**
 * Ramène une sélection quelconque à six catégories utilisables.
 *
 * Le plateau se construit à partir d'elle sur le serveur **et** sur chaque écran :
 * une sélection incomplète — salon repris du disque, réglage d'une version
 * antérieure, client malveillant — ne doit pas produire deux plateaux différents,
 * ni un plateau à trous. On complète donc dans l'ordre par défaut, et on tronque.
 */
export function resolveBoardCategories(
  selection: readonly CategoryId[] | undefined | null,
): CategoryId[] {
  const retenues: CategoryId[] = [];
  for (const categoryId of selection ?? []) {
    // Une catégorie inconnue est écartée, et pas seulement par principe : le
    // réglage arrive du client sans validation, et une case dont la catégorie
    // n'existe pas dans `CATEGORIES` fait planter le rendu du plateau — mesuré,
    // « Cannot read properties of undefined (reading 'color') ». Un salon repris
    // du disque après le retrait d'une catégorie suffirait à l'obtenir.
    if (!(categoryId in CATEGORIES)) continue;
    if (!retenues.includes(categoryId)) retenues.push(categoryId);
  }
  for (const secours of DEFAULT_BOARD_CATEGORIES) {
    if (retenues.length >= BOARD_CATEGORY_COUNT) break;
    if (!retenues.includes(secours)) retenues.push(secours);
  }
  return retenues.slice(0, BOARD_CATEGORY_COUNT);
}

function generateWheelBoard(
  CATEGORIES_LIST: CategoryId[],
  additionalSpokeTile = true,
): BoardTile[] {
  const tiles: BoardTile[] = [];
  const cx = 500;
  const cy = 500;
  const outerR = 380;
  const spokeStepR = outerR / 4; // regular 95-unit spacing on the classic wheel

  // Hub / Center tile (ID 0)
  tiles.push({
    id: 0,
    type: 'hub',
    label: 'CENTRE',
    x: cx,
    y: cy,
    nextTileIds: [] // leads into spokes
  });

  let currentId = 1;
  const spokeOuterTileIds: number[] = [];
  const spokeTileIds: number[][] = [];

  // Create 6 spokes (Angles: 0, 60, 120, 180, 240, 300)
  for (let i = 0; i < 6; i++) {
    const angle = i * 60;
    const hqCatId = CATEGORIES_LIST[i % CATEGORIES_LIST.length];

    const currentSpokeTileIds: number[] = [];
    // 3 spoke tiles going outwards
    for (let s = 1; s <= 3; s++) {
      const pt = circlePoint(cx, cy, s * spokeStepR, angle);
      const isLastSpoke = (s === 3);
      const tileId = currentId++;
      currentSpokeTileIds.push(tileId);

      // Distribute categories along spoke leading to HQ
      const spokeCatId = isLastSpoke 
        ? hqCatId 
        : CATEGORIES_LIST[(i + s * 2) % CATEGORIES_LIST.length];

      tiles.push({
        id: tileId,
        type: isLastSpoke ? 'camembert' : 'category',
        categoryId: spokeCatId,
        label: isLastSpoke ? `Q.G. ${hqCatId.toUpperCase()}` : spokeCatId.toUpperCase(),
        x: pt.x,
        y: pt.y,
        nextTileIds: [], // linked later
        isCamembert: isLastSpoke
      });

      if (isLastSpoke) {
        spokeOuterTileIds.push(tileId);
      }
    }

    spokeTileIds.push(currentSpokeTileIds);
  }

  // Create outer circle connecting the 6 outer spoke tiles
  // Between each pair of outer spoke tiles, place 3 outer track tiles
  const outerNodesCount = 6 * 4; // 24 total tiles on outer ring

  for (let idx = 0; idx < outerNodesCount; idx++) {
    const angle = idx * (360 / outerNodesCount);
    const pt = circlePoint(cx, cy, outerR, angle);
    const isSpokeAngle = (idx % 4 === 0);

    if (isSpokeAngle) {
      // This corresponds to one of the outer spoke tiles created earlier
      const spokeIndex = idx / 4;
      const spokeCamembertId = spokeOuterTileIds[spokeIndex];
      // Update its coordinate precisely to match ring
      const t = tiles.find(tile => tile.id === spokeCamembertId);
      if (t) {
        t.x = pt.x;
        t.y = pt.y;
      }
    } else {
      // Normal outer track tile pattern: Category -> Special (Re-lance / Surprise) -> Category
      const positionInSector = idx % 4; // 1, 2, or 3
      const sectorIndex = Math.floor(idx / 4);

      let tileType: 'category' | 'reroll' | 'surprise' = 'category';
      let catId: CategoryId = CATEGORIES_LIST[(sectorIndex + positionInSector) % CATEGORIES_LIST.length];
      let label = catId.toUpperCase();

      if (positionInSector === 2) {
        // Middle of sector is either Re-lance or Surprise
        if (sectorIndex % 2 === 0) {
          tileType = 'reroll';
          label = 'RE-LANCE';
        } else {
          tileType = 'surprise';
          label = 'SURPRISE';
        }
      }

      const tileId = currentId++;
      tiles.push({
        id: tileId,
        type: tileType,
        categoryId: catId,
        label,
        x: pt.x,
        y: pt.y,
        nextTileIds: []
      });
    }
  }

  // The classic wheel has one extra category tile in the large gap between
  // each spoke's second tile and its camembert. Add these after every legacy
  // tile has been created so all existing IDs remain stable for saved games.
  if (additionalSpokeTile) {
    for (let i = 0; i < 6; i++) {
      const angle = i * 60;
      const pt = circlePoint(cx, cy, 3 * spokeStepR, angle);
      const categoryId = CATEGORIES_LIST[(i + 3) % CATEGORIES_LIST.length];
      const tileId = currentId++;

      tiles.push({
        id: tileId,
        type: 'category',
        categoryId,
        label: categoryId.toUpperCase(),
        x: pt.x,
        y: pt.y,
        nextTileIds: []
      });

      // Insert the new tile immediately before the existing camembert.
      const currentSpokeTileIds = spokeTileIds[i];
      currentSpokeTileIds.splice(currentSpokeTileIds.length - 1, 0, tileId);
    }
  }

  // Now create bidirectional graph connectivity for all adjacent ring & spoke tiles
  // Re-map ring nodes in angular order
  const ringTileMap: number[] = [];
  for (let idx = 0; idx < outerNodesCount; idx++) {
    if (idx % 4 === 0) {
      ringTileMap.push(spokeOuterTileIds[idx / 4]);
    } else {
      // Find corresponding outer tile
      const angle = idx * (360 / outerNodesCount);
      const pt = circlePoint(cx, cy, outerR, angle);
      const t = tiles.find(tile => Math.abs(tile.x - pt.x) < 5 && Math.abs(tile.y - pt.y) < 5);
      if (t) ringTileMap.push(t.id);
    }
  }

  // Connect adjacent ring items
  for (let i = 0; i < ringTileMap.length; i++) {
    const currentTile = tiles.find(t => t.id === ringTileMap[i]);
    const nextRingId = ringTileMap[(i + 1) % ringTileMap.length];
    const prevRingId = ringTileMap[(i - 1 + ringTileMap.length) % ringTileMap.length];
    if (currentTile) {
      currentTile.nextTileIds = Array.from(new Set([...currentTile.nextTileIds, nextRingId, prevRingId]));
    }
  }

  // Connect spokes outwards & inwards towards hub
  for (let i = 0; i < 6; i++) {
    const path = [0, ...spokeTileIds[i]];
    for (let position = 0; position < path.length - 1; position++) {
      const from = tiles.find(tile => tile.id === path[position]);
      const to = tiles.find(tile => tile.id === path[position + 1]);
      if (from) from.nextTileIds.push(path[position + 1]);
      if (to) to.nextTileIds.push(path[position]);
    }
  }

  // Deduplicate all nextTileIds and remove self-references
  tiles.forEach(t => {
    t.nextTileIds = Array.from(new Set(t.nextTileIds.filter(id => id !== t.id)));
  });

  return tiles;
}

function generateSnakeBoard(CATEGORIES_LIST: CategoryId[]): BoardTile[] {
  const tiles: BoardTile[] = [];
  const rows = 5;
  const cols = 6;
  let id = 0;
  const lastId = rows * cols - 1;

  /**
   * Une case camembert par catégorie, ni plus ni moins.
   *
   * L'ancienne règle en posait une toutes les cinq cases, soit cinq en tout pour
   * six catégories : il en manquait toujours une, et une partie en six camemberts
   * était donc **ingagnable** sur ce plateau — à moins de décrocher un joker sur la
   * bonne case. Le défaut ne se voyait pas, la catégorie orpheline étant la
   * première de la liste, celle qu'on gagne d'ordinaire ailleurs.
   *
   * On répartit donc exactement six cases sur le trajet, en évitant le départ et
   * la case centrale, et chacune reçoit la catégorie de son rang.
   */
  const camembertIds = Array.from(
    { length: CATEGORIES_LIST.length },
    (_, rank) => Math.round(((rank + 1) * (lastId - 1)) / CATEGORIES_LIST.length),
  );

  for (let r = 0; r < rows; r++) {
    const isEven = (r % 2 === 0);
    for (let c = 0; c < cols; c++) {
      const colIndex = isEven ? c : (cols - 1 - c);
      // Vertically centred inside the 1000×1000 board box, with enough head
      // room above the first row for the 3D pawns standing on their tile.
      const x = Math.round(150 + colIndex * 140);
      const y = Math.round(215 + r * 145);
      const camembertRank = camembertIds.indexOf(id);
      const isHub = (id === lastId);
      const isCamembert = camembertRank >= 0 && !isHub;
      // Une case camembert porte la catégorie de son rang : c'est ce qui garantit
      // que les six soient toutes gagnables. Les autres suivent le défilé habituel.
      const catId = isCamembert
        ? CATEGORIES_LIST[camembertRank % CATEGORIES_LIST.length]
        : CATEGORIES_LIST[id % CATEGORIES_LIST.length];

      tiles.push({
        id: id,
        type: isHub ? 'hub' : isCamembert ? 'camembert' : 'category',
        categoryId: catId,
        label: isHub ? 'VICTOIRE' : isCamembert ? 'CAMEMBERT' : catId.toUpperCase(),
        x,
        y,
        nextTileIds: id < lastId ? [id + 1] : [0],
        isCamembert
      });
      id++;
    }
  }

  // Also add backward connections
  for (let i = 0; i < tiles.length; i++) {
    if (i > 0) {
      tiles[i].nextTileIds.push(i - 1);
    }
  }

  // Deduplicate all nextTileIds and remove self-references
  tiles.forEach(t => {
    t.nextTileIds = Array.from(new Set(t.nextTileIds.filter(id => id !== t.id)));
  });

  return tiles;
}

export const BOARD_PRESETS: Record<BoardType, BoardConfig> = {
  wheel: {
    id: 'wheel',
    name: 'Roue Classique 6 Branches',
    description: 'Le plateau de jeu emblématique avec un centre, 6 branches et 6 cases camemberts.',
    suggestedDuration: '45-60 min',
    layout: 'radial',
    tiles: generateWheelBoard(DEFAULT_BOARD_CATEGORIES)
  },
  snake: {
    id: 'snake',
    name: 'Circuit Familial Express',
    description: 'Un serpentin dynamique idéal pour les parties rapides sur tablette ou mobile.',
    suggestedDuration: '25-35 min',
    layout: 'grid',
    tiles: generateSnakeBoard(DEFAULT_BOARD_CATEGORIES)
  },
  star: {
    id: 'star',
    name: 'Étoile des Champions',
    description: 'Un plateau à 4 branches courtes concentré sur la rapidité et la stratégie.',
    suggestedDuration: '20-30 min',
    layout: 'radial',
    tiles: generateWheelBoard(DEFAULT_BOARD_CATEGORIES, false) // keep the shorter four-position branches
  }
};

/**
 * Le plateau d'un salon : sa forme vient du type choisi, ses catégories de la
 * sélection de l'hôte.
 *
 * `BOARD_PRESETS` reste la forme par défaut — celle que l'aperçu du salon montre,
 * et celle des tests de topologie —, mais une partie ne s'y réfère plus : le
 * plateau doit dépendre du salon, et il ne pouvait pas le faire tant qu'il était un
 * objet statique construit au chargement du module. Signalé en partie : « je peux
 * sélectionner ce que je veux, les catégories de base restent sur le plateau ».
 *
 * La fonction est **pure** : le serveur et tous les écrans en dérivent le même
 * plateau à partir de la même liste, comme le parcours du dé se dérive de sa
 * poussée. Rien n'est tiré au sort ici, sans quoi les plateaux divergeraient.
 */
export function buildBoard(
  boardType: BoardType,
  selection: readonly CategoryId[] | undefined | null,
): BoardConfig {
  const preset = BOARD_PRESETS[boardType] ?? BOARD_PRESETS.wheel;
  const categories = resolveBoardCategories(selection);
  const tiles = preset.id === 'snake'
    ? generateSnakeBoard(categories)
    : generateWheelBoard(categories, preset.id !== 'star');
  return { ...preset, tiles };
}

/**
 * Reconstructs the tiles a pawn walks through to go from `fromId` to `toId`.
 *
 * The server only broadcasts the destination, but the board animation needs the
 * intermediate tiles to hop across. When the dice value is known we enumerate
 * the exact same no-backtracking walks the server used to compute
 * `possibleMoves` (see `calculateMoves` in server.ts) and keep the walk that
 * ends on the chosen tile. Otherwise (re-roll tiles, reconnections, teleports)
 * we fall back to the shortest path in the tile graph.
 *
 * Returns the full path including both endpoints, e.g. `[from, …, to]`.
 */
export function findTilePath(
  tiles: BoardTile[],
  fromId: number,
  toId: number,
  steps?: number | null
): number[] {
  if (fromId === toId) return [fromId];

  const byId = new Map<number, BoardTile>();
  tiles.forEach(tile => byId.set(tile.id, tile));
  if (!byId.has(fromId) || !byId.has(toId)) return [toId];

  // 1. Exact walk of `steps` tiles, mirroring the server's move calculation.
  if (steps && steps > 0 && steps <= 8) {
    let walks: number[][] = [[fromId]];

    for (let step = 0; step < steps; step++) {
      const next: number[][] = [];
      for (const walk of walks) {
        const current = byId.get(walk[walk.length - 1]);
        if (!current) continue;
        for (const nextId of current.nextTileIds) {
          // Never immediately reverse direction, exactly like the server does.
          if (walk.length > 1 && nextId === walk[walk.length - 2]) continue;
          next.push([...walk, nextId]);
        }
      }
      walks = next;
      if (walks.length === 0 || walks.length > 5000) break;
    }

    const exact = walks.find(walk => walk[walk.length - 1] === toId);
    if (exact) return exact;
  }

  // 2. Fallback: breadth-first shortest path through the tile graph.
  const cameFrom = new Map<number, number>();
  const queue: number[] = [fromId];
  const visited = new Set<number>([fromId]);

  while (queue.length > 0) {
    const currentId = queue.shift() as number;
    if (currentId === toId) break;
    const current = byId.get(currentId);
    if (!current) continue;

    for (const nextId of current.nextTileIds) {
      if (visited.has(nextId)) continue;
      visited.add(nextId);
      cameFrom.set(nextId, currentId);
      queue.push(nextId);
    }
  }

  if (!cameFrom.has(toId)) return [fromId, toId];

  const path: number[] = [toId];
  let cursor = toId;
  while (cursor !== fromId) {
    const parent = cameFrom.get(cursor);
    if (parent === undefined) break;
    path.unshift(parent);
    cursor = parent;
  }

  return path;
}

/** Same as `findTilePath` but resolved to tile objects, ready to animate. */
export function resolveTilePath(
  tiles: BoardTile[],
  fromId: number,
  toId: number,
  steps?: number | null
): BoardTile[] {
  return findTilePath(tiles, fromId, toId, steps)
    .map(id => tiles.find(tile => tile.id === id))
    .filter((tile): tile is BoardTile => Boolean(tile));
}
