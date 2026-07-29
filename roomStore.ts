import { mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'fs';
import { mkdir, rename, writeFile } from 'fs/promises';
import { randomBytes } from 'crypto';
import path from 'path';
import { GameSettings, GameState, Player, Question } from './src/types.js';

/**
 * Persistance des parties sans base de données.
 *
 * Les parties vivaient uniquement dans une `Map` en mémoire : tout redémarrage
 * du serveur les effaçait, qu'il vienne d'un redéploiement, d'un plantage ou du
 * rechargement automatique de `tsx` en développement.
 *
 * Deux précautions dictent la forme de ce module.
 *
 * 1. `gameState.questionsPool` est une copie complète de la banque de questions
 *    pour chaque salle, soit près de 2 Mo une fois sérialisée. On ne l'écrit
 *    jamais : elle est reconstruite au chargement à partir de la banque et des
 *    paquets personnalisés de la salle. Seul `usedQuestionIds` compte vraiment,
 *    puisque le tirage est aléatoire parmi les questions non utilisées.
 * 2. Sur un hébergement comme Railway, le système de fichiers est éphémère. Le
 *    chemin d'écriture est donc configurable par `DATA_DIR` : monté sur un
 *    volume, l'état survit aux redéploiements ; sans volume, il survit au moins
 *    aux redémarrages du processus. Si le dossier n'est pas accessible en
 *    écriture, le serveur continue de fonctionner en mémoire seule.
 */

/** Structurellement identique au `Room` de server.ts, sans l'importer. */
export interface PersistableRoom {
  code: string;
  hostSocketId: string;
  generationToken: string;
  reconnectTokens: Map<string, string>;
  settings: GameSettings;
  gameState: GameState;
  sockets: Map<string, Player>;
  createdAt: number;
  lastActivityAt: number;
  emptySince: number | null;
  hostDisconnectedAt: number | null;
}

/** Ce qui part réellement sur le disque : tout sauf les sockets et le pool. */
interface StoredRoom {
  code: string;
  hostSocketId: string;
  generationToken?: string;
  reconnectTokens?: Record<string, string>;
  settings: GameSettings;
  createdAt: number;
  lastActivityAt: number;
  emptySince: number | null;
  hostDisconnectedAt: number | null;
  gameState: Omit<GameState, 'questionsPool'>;
}

interface StoredFile {
  version: 1;
  savedAt: number;
  rooms: StoredRoom[];
}

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'rooms.json');
const TEMP_PATH = `${STORE_PATH}.tmp`;

/** Une salle plus vieille que cela n'est pas rechargée : elle serait balayée. */
const MAX_RESTORE_AGE_MS = 12 * 60 * 60 * 1000;

let lastWritten = '';
let disabled = false;
let writing = false;
let pending: Map<string, PersistableRoom> | null = null;

function warnOnce(message: string, error: unknown): void {
  if (disabled) return;
  disabled = true;
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`⚠️  ${message} (${detail})`);
  console.warn('   Les parties resteront en mémoire et seront perdues au redémarrage.');
}

function serialize(rooms: Map<string, PersistableRoom>): string {
  const payload: StoredFile = {
    version: 1,
    savedAt: Date.now(),
    rooms: [...rooms.values()].map((room) => {
      const { questionsPool, ...gameState } = room.gameState;
      return {
        code: room.code,
        hostSocketId: room.hostSocketId,
        generationToken: room.generationToken,
        reconnectTokens: Object.fromEntries(room.reconnectTokens),
        settings: room.settings,
        createdAt: room.createdAt,
        lastActivityAt: room.lastActivityAt,
        emptySince: room.emptySince,
        hostDisconnectedAt: room.hostDisconnectedAt,
        gameState,
      };
    }),
  };
  return JSON.stringify(payload);
}

/**
 * Écrit l'état si quelque chose a changé, sans bloquer le serveur.
 *
 * Les écritures sont asynchrones à dessein : un disque lent — un volume réseau,
 * par exemple — ne doit jamais figer la partie en cours. Deux écritures ne se
 * chevauchent pas ; si l'état change pendant une écriture, une seule reprise est
 * programmée à la fin. Le fichier temporaire suivi d'un `rename` garantit qu'une
 * coupure au mauvais moment ne laisse jamais un JSON tronqué.
 */
export function saveRooms(rooms: Map<string, PersistableRoom>): void {
  if (disabled) return;
  if (writing) {
    pending = rooms;
    return;
  }
  const payload = serialize(rooms);
  if (payload === lastWritten) return;

  writing = true;
  void (async () => {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(TEMP_PATH, payload, 'utf8');
      await rename(TEMP_PATH, STORE_PATH);
      lastWritten = payload;
    } catch (error) {
      warnOnce(`Impossible d'écrire les parties dans ${STORE_PATH}`, error);
    } finally {
      writing = false;
      const next = pending;
      pending = null;
      if (next) saveRooms(next);
    }
  })();
}

/**
 * Écriture bloquante, réservée à l'arrêt du processus.
 *
 * À ce moment précis, il faut que l'écriture soit terminée avant de rendre la
 * main : c'est elle qui sauve la partie en cours lors d'un redéploiement.
 */
function saveRoomsSync(rooms: Map<string, PersistableRoom>): void {
  if (disabled) return;
  try {
    const payload = serialize(rooms);
    if (payload === lastWritten) return;
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(TEMP_PATH, payload, 'utf8');
    renameSync(TEMP_PATH, STORE_PATH);
    lastWritten = payload;
  } catch (error) {
    warnOnce(`Impossible d'écrire les parties dans ${STORE_PATH}`, error);
  }
}

/**
 * Recharge les parties sauvegardées.
 *
 * Les joueurs reviennent marqués déconnectés : leurs sockets n'existent plus.
 * Les délais de grâce de l'hôte et des salles vides repartent de maintenant,
 * pour laisser à la famille le temps de se reconnecter après un redéploiement.
 */
export function loadRooms(
  questionsDatabase: Question[],
  shuffle: <T>(values: T[]) => T[],
): Map<string, PersistableRoom> {
  const rooms = new Map<string, PersistableRoom>();
  let raw: string;
  try {
    raw = readFileSync(STORE_PATH, 'utf8');
  } catch {
    return rooms; // premier démarrage, ou volume vide : cas normal
  }

  let parsed: StoredFile;
  try {
    parsed = JSON.parse(raw) as StoredFile;
    if (parsed.version !== 1 || !Array.isArray(parsed.rooms)) {
      throw new Error('format inattendu');
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Sauvegarde des parties illisible, elle est ignorée (${detail}).`);
    return rooms;
  }

  const now = Date.now();
  let skipped = 0;
  for (const stored of parsed.rooms) {
    if (!stored?.code || !stored.gameState) continue;
    if (now - stored.lastActivityAt > MAX_RESTORE_AGE_MS) {
      skipped += 1;
      continue;
    }

    const customQuestions = (stored.gameState.customPacks ?? []).flatMap((pack) => pack.questions);
    rooms.set(stored.code, {
      code: stored.code,
      hostSocketId: stored.hostSocketId,
      generationToken: stored.generationToken || randomBytes(32).toString('base64url'),
      reconnectTokens: new Map(Object.entries(stored.reconnectTokens ?? {})),
      settings: stored.settings,
      createdAt: stored.createdAt,
      lastActivityAt: stored.lastActivityAt,
      // Les compteurs de grâce repartent à zéro : sans cela une salle rechargée
      // serait balayée aussitôt, personne n'ayant encore eu le temps de revenir.
      emptySince: now,
      hostDisconnectedAt: now,
      sockets: new Map(),
      gameState: {
        ...stored.gameState,
        players: stored.gameState.players.map((player) => ({ ...player, isConnected: false })),
        questionsPool: shuffle([...customQuestions, ...questionsDatabase]),
      },
    });
  }

  if (rooms.size > 0 || skipped > 0) {
    console.log(
      `💾 ${rooms.size} partie(s) rechargée(s) depuis ${STORE_PATH}`
        + (skipped > 0 ? `, ${skipped} trop ancienne(s) ignorée(s)` : ''),
    );
  }
  return rooms;
}

/**
 * Vérifie au démarrage que le dossier de sauvegarde est réellement utilisable.
 *
 * Sans cela, une erreur de configuration — volume monté sur un autre chemin que
 * `DATA_DIR`, dossier en lecture seule — ne se découvrirait qu'en perdant une
 * partie. Le test écrit puis supprime un fichier témoin, et distingue un dossier
 * neuf d'un dossier qui contient déjà une sauvegarde.
 */
export function checkStore(): void {
  const probe = path.join(DATA_DIR, '.write-test');
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(probe, 'ok', 'utf8');
    rmSync(probe, { force: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${DATA_DIR} n'est pas accessible en écriture (${detail}).`);
    console.error('   Les parties ne seront PAS sauvegardées.');
    console.error('   Sur Railway : vérifiez que le volume est monté exactement sur');
    console.error(`   le chemin de DATA_DIR, ici « ${DATA_DIR} ».`);
    return;
  }

  const configured = process.env.DATA_DIR
    ? `DATA_DIR=${process.env.DATA_DIR}`
    : 'DATA_DIR non défini, dossier local par défaut';
  let existing = 'aucune sauvegarde pour le moment';
  try {
    const stats = statSync(STORE_PATH);
    const age = Math.round((Date.now() - stats.mtimeMs) / 1000);
    existing = `sauvegarde existante de ${stats.size} octets, écrite il y a ${age} s`;
  } catch {
    // premier démarrage sur ce volume : cas normal
  }
  console.log(`✅ Sauvegarde des parties opérationnelle (${configured}) — ${existing}.`);
}

/**
 * Sauvegarde périodique, plus une sauvegarde immédiate à l'arrêt.
 *
 * C'est le `SIGTERM` qui compte le plus : Railway l'envoie avant de remplacer
 * le conteneur, ce qui laisse le temps d'écrire la partie en cours.
 */
export function startRoomPersistence(
  rooms: Map<string, PersistableRoom>,
  intervalMs = 3000,
): void {
  const timer = setInterval(() => saveRooms(rooms), intervalMs);
  timer.unref?.();

  let stopping = false;
  const stop = (signal: string) => {
    if (stopping) return;
    stopping = true;
    clearInterval(timer);
    saveRoomsSync(rooms);
    console.log(`💾 Parties sauvegardées avant l'arrêt (${signal}).`);
    process.exit(0);
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
}

export const ROOM_STORE_PATH = STORE_PATH;
