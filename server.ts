import express from 'express';
import path from 'path';
import { randomBytes, timingSafeEqual } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { QUESTIONS_DATABASE } from './src/data/questions.js';
import { BOARD_PRESETS } from './src/data/boards.js';
import { normalizeCategoryId } from './src/data/categories.js';
import {
  normalize as normalizeText,
} from './src/data/questionRules.js';
import { checkStore, loadRooms, startRoomPersistence, saveRooms, ROOM_STORE_PATH } from './roomStore.js';
import { advanceTurn, calculateMoves, resolveAnswer, togglePauseState } from './src/server/gameEngine.js';
import {
  beginFirstPlayerDraw,
  pendingRollers,
  purgeFirstPlayerRoll,
  recordFirstPlayerRoll,
  settleFirstPlayerDraw,
  skipFirstPlayerDraw,
  transferFirstPlayerRoll,
} from './src/server/firstPlayerDraw.js';
import { createGameStateView } from './src/server/gameStateView.js';
import { isCardReadAloud, resolveOnAirIds, resolveReaderId } from './src/server/turnRoles.js';
import {
  KnownFactIndex,
  answerKeyOf,
  assembleGeneratedPack,
  describeRejections,
} from './src/server/packAssembly.js';
import { activeThemeKeys, pickQuestionForPlayer } from './src/server/questionSelection.js';
import { previewOrigin, withAbsolutePreviewImages } from './src/server/previewMeta.js';
import { createQuestionGenerator } from './src/server/questionGenerator.js';
import { DEFAULT_GENERATED_PACK_COUNT } from './src/config/generatedPack.js';
import { BONUS_ROSTER, awardSurpriseBonus, useBonus } from './src/server/bonuses.js';
import {
  DEFAULT_BONUS_MODE,
  DEFAULT_QUESTION_TIMER_SECONDS,
  DEFAULT_READER_MODE,
} from './src/config/gameSettings.js';
import {
  BonusType,
  GameState,
  Player,
  GameSettings,
  Question,
  CategoryId,
  DifficultyLevel
} from './src/types.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT) || 3000;
const PLAYER_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

app.set('trust proxy', 1);
app.use(express.json({ limit: '256kb' }));

// --- AI DYNAMIC PACK GENERATOR ---

function normalizeDifficulty(raw: unknown): DifficultyLevel {
  const clean = String(raw ?? '').toLowerCase().trim();
  if (clean.includes('enf') || clean.includes('facile') || clean.includes('easy')) return 'enfant';
  if (clean.includes('ado') || clean.includes('moyen') || clean.includes('medium')) return 'ado';
  return 'adulte';
}

/**
 * Ce que la banque rédigée sait déjà, indexé une seule fois : un pack généré ne
 * doit ni recopier une carte officielle, ni reposer le même fait autrement.
 */
let knownFacts: KnownFactIndex | null = null;
function getKnownFacts(): KnownFactIndex {
  if (!knownFacts) {
    const texts = new Set(QUESTIONS_DATABASE.map(q => normalizeText(q.question)));
    const questionsByAnswer = new Map<string, string[]>();
    for (const question of QUESTIONS_DATABASE) {
      const key = answerKeyOf(question);
      const group = questionsByAnswer.get(key);
      if (group) group.push(question.question);
      else questionsByAnswer.set(key, [question.question]);
    }
    knownFacts = {
      hasQuestionText: (normalizedQuestion: string) => texts.has(normalizedQuestion),
      questionsSharingAnswer: (answerKey: string) => questionsByAnswer.get(answerKey) ?? [],
    };
  }
  return knownFacts;
}

/**
 * Les lots partent en parallèle avec le même thème : sans consigne propre,
 * chacun ouvre par les mêmes évidences et les doublons inter-lots partent au
 * rebut (« fait déjà posé sous une autre formulation »). Un angle par lot
 * répartit le terrain d'avance.
 */
const GENERATION_BATCH_ANGLES = [
  'les personnages, créatures et figures emblématiques',
  'les lieux, objets et décors',
  'les dates, les événements et la chronologie',
  'les œuvres, les épisodes et les intrigues',
  'les coulisses, les créateurs et la fabrication',
  'les chiffres, les records et les comparaisons',
];

const GENERATION_BATCH_SIZE = 15;
const GENERATION_MAX_COUNT = 60;
// Les contrôles éditoriaux rejettent une partie des cartes : on en demande
// davantage pour livrer quand même le nombre promis à l'organisateur.
const GENERATION_OVERSHOOT = 1.5;
const GENERATION_ATTEMPT_CAP = 90;
const GENERATION_WINDOW_MS = 60 * 60 * 1000;
const MAX_GENERATIONS_PER_IP = 6;
const generationAttempts = new Map<string, number[]>();
const generationsInProgress = new Set<string>();

function safeTokenEquals(actual: string | undefined, expected: string): boolean {
  if (!actual) return false;
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer);
}

function consumeGenerationQuota(key: string, now = Date.now()): boolean {
  const activeAttempts = (generationAttempts.get(key) ?? [])
    .filter(timestamp => now - timestamp < GENERATION_WINDOW_MS);
  if (activeAttempts.length >= MAX_GENERATIONS_PER_IP) {
    generationAttempts.set(key, activeAttempts);
    return false;
  }
  activeAttempts.push(now);
  generationAttempts.set(key, activeAttempts);
  return true;
}

app.post('/api/generate-pack', async (req, res) => {
  const roomCode = String(req.header('x-room-code') ?? '').toUpperCase().trim();
  const hostToken = req.header('x-host-token');
  const room = rooms.get(roomCode);
  if (!room || !safeTokenEquals(hostToken, room.generationToken)) {
    return res.status(403).json({ error: 'Génération réservée à l’organisateur du salon.' });
  }

  let generator: ReturnType<typeof createQuestionGenerator>;
  try {
    generator = createQuestionGenerator();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Configuration IA invalide.';
    console.error('Configuration du générateur IA invalide:', errorMessage);
    return res.status(503).json({ error: errorMessage });
  }

  const sourceKey = req.ip || req.socket.remoteAddress || 'unknown';
  if (!consumeGenerationQuota(sourceKey)) {
    return res.status(429).json({ error: 'Trop de générations récentes. Réessayez dans une heure.' });
  }
  if (generationsInProgress.has(roomCode)) {
    return res.status(409).json({ error: 'Une génération est déjà en cours pour ce salon.' });
  }

  generationsInProgress.add(roomCode);
  try {
    const { themeName, count = DEFAULT_GENERATED_PACK_COUNT } = req.body;
    if (!themeName || typeof themeName !== 'string' || themeName.trim().length < 2 || themeName.length > 100) {
      return res.status(400).json({ error: 'Nom de thème requis (2 à 100 caractères).' });
    }

    const cleanTheme = themeName.trim();
    const requestedCount = Math.min(
      Math.max(Number(count) || DEFAULT_GENERATED_PACK_COUNT, 5),
      GENERATION_MAX_COUNT,
    );
    const attemptCount = Math.min(
      Math.ceil(requestedCount * GENERATION_OVERSHOOT),
      GENERATION_ATTEMPT_CAP,
    );

    // Split the generation into parallel batches: small batches are far more
    // reliable than a single large one, and one failed batch doesn't sink the pack.
    const batchSizes: number[] = [];
    for (let remaining = attemptCount; remaining > 0; remaining -= GENERATION_BATCH_SIZE) {
      batchSizes.push(Math.min(GENERATION_BATCH_SIZE, remaining));
    }

    const batchResults = await Promise.allSettled(
      batchSizes.map(async (size, index) => {
        const angle = GENERATION_BATCH_ANGLES[index % GENERATION_BATCH_ANGLES.length];
        try {
          return await generator.generateBatch(cleanTheme, size, angle);
        } catch (err) {
          console.warn(
            `[Pack IA/${generator.provider}] Lot en échec, nouvelle tentative:`,
            err instanceof Error ? err.message : err,
          );
          return await generator.generateBatch(cleanTheme, size, angle);
        }
      })
    );

    const rawQuestions = batchResults
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    if (rawQuestions.length === 0) {
      const firstError = batchResults.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined;
      throw new Error(firstError?.reason instanceof Error ? firstError.reason.message : 'La génération a échoué, réessayez.');
    }

    // Mise en forme, puis contrôle éditorial complet : ce sont les règles de
    // l'ADR 0001, celles que `npm run audit:questions` applique à la banque
    // rédigée. Une carte non conforme est écartée, jamais rafistolée.
    const stamp = Date.now();
    const candidates: Question[] = rawQuestions
      .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options))
      .map((q, idx) => ({
        id: `gen_${stamp}_${idx}`,
        categoryId: normalizeCategoryId(q.categoryId),
        question: q.question.trim(),
        options: q.options.map((o: unknown) => String(o ?? '').trim()),
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: typeof q.explanation === 'string' ? q.explanation.trim() : undefined,
        difficulty: normalizeDifficulty(q.difficulty),
        themePack: cleanTheme
      }));

    const pack = assembleGeneratedPack(candidates, requestedCount, getKnownFacts());

    if (pack.questions.length === 0) {
      throw new Error('Aucune question conforme générée, réessayez avec un thème plus précis.');
    }

    console.log(
      `[Pack IA/${generator.provider}:${generator.model}] "${cleanTheme}" : ${pack.questions.length} question(s) retenue(s)`
        + ` sur ${pack.examined} générée(s) — rejets : ${describeRejections(pack.rejections)}`,
    );
    return res.json({
      success: true,
      questions: pack.questions,
      themeName: cleanTheme,
      requested: requestedCount,
      examined: pack.examined,
    });
  } catch (err: unknown) {
    console.error('Erreur génération IA:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du thème';
    return res.status(500).json({ error: errorMessage });
  } finally {
    generationsInProgress.delete(roomCode);
  }
});

// --- MULTIPLAYER ROOMS STORE ---
interface Room {
  code: string;
  hostSocketId: string;
  generationToken: string;
  reconnectTokens: Map<string, string>;
  settings: GameSettings;
  gameState: GameState;
  sockets: Map<string, Player>; // socketId -> Player
  createdAt: number;
  lastActivityAt: number;
  emptySince: number | null;
  hostDisconnectedAt: number | null;
}

/** Mélange de Fisher-Yates, partagé par le démarrage de partie et la reprise. */
function shuffled<T>(values: T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Les parties survivent au redémarrage : sans cela, un redéploiement, un
// plantage ou un simple rechargement de tsx en développement effaçait toutes
// les salles en cours.
const rooms: Map<string, Room> = loadRooms(QUESTIONS_DATABASE, shuffled);
const positiveDuration = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const MAX_ROOMS = 250;
const MAX_PLAYERS_PER_ROOM = 12;
const MAX_CUSTOM_PACKS_PER_ROOM = 3;
const MAX_CUSTOM_QUESTIONS_PER_ROOM = 180;
// Dix minutes : après un redéploiement ou une coupure de réseau, il faut laisser
// à toute la famille le temps de revenir avant de fermer le salon.
const HOST_RECONNECT_GRACE_MS = positiveDuration(process.env.ROOM_HOST_GRACE_MS, 10 * 60 * 1000);
const EMPTY_ROOM_GRACE_MS = positiveDuration(process.env.ROOM_EMPTY_GRACE_MS, 10 * 60 * 1000);
// Partie en pause : le salon est conservé quatre heures, le temps d'un repas ou
// d'une soirée, même si tout le monde a fermé son navigateur.
const PAUSED_ROOM_TTL_MS = positiveDuration(process.env.ROOM_PAUSED_TTL_MS, 4 * 60 * 60 * 1000);
const ROOM_IDLE_TTL_MS = positiveDuration(process.env.ROOM_IDLE_TTL_MS, 4 * 60 * 60 * 1000);
const ROOM_MAX_AGE_MS = positiveDuration(process.env.ROOM_MAX_AGE_MS, 12 * 60 * 60 * 1000);
const ROOM_SWEEP_INTERVAL_MS = positiveDuration(process.env.ROOM_SWEEP_INTERVAL_MS, 30 * 1000);

function getRoom(code: string): Room | undefined {
  const room = rooms.get(code);
  if (room) room.lastActivityAt = Date.now();
  return room;
}

function emitGameState(room: Room): void {
  for (const socketId of room.sockets.keys()) {
    io.to(socketId).emit(
      'game-state-update',
      createGameStateView(room.gameState, socketId, room.hostSocketId),
    );
  }
}

function gameStateFor(room: Room, socketId: string) {
  return createGameStateView(room.gameState, socketId, room.hostSocketId);
}

function closeRoom(code: string, reason: string): boolean {
  const room = rooms.get(code);
  if (!room) return false;

  io.to(code).emit('room-closed', { reason });
  io.in(code).socketsLeave(code);
  room.sockets.clear();
  room.reconnectTokens.clear();
  room.gameState.players.length = 0;
  room.gameState.questionsPool.length = 0;
  room.gameState.usedQuestionIds.length = 0;
  room.gameState.customPacks = [];
  rooms.delete(code);
  // Écriture immédiate : une salle fermée ne doit pas réapparaître si le
  // serveur redémarre dans les secondes qui suivent.
  saveRooms(rooms);
  console.log(`[Room] Salon supprimé: ${code} (${reason}). Salons actifs: ${rooms.size}`);
  return true;
}

function removeSocketFromRoom(room: Room, socketId: string): void {
  room.sockets.delete(socketId);
  room.reconnectTokens.delete(socketId);
  const playerIndex = room.gameState.players.findIndex(player => player.id === socketId);
  if (playerIndex >= 0) {
    room.gameState.players.splice(playerIndex, 1);
    if (room.gameState.activePlayerIndex >= room.gameState.players.length) {
      room.gameState.activePlayerIndex = 0;
    } else if (playerIndex < room.gameState.activePlayerIndex) {
      room.gameState.activePlayerIndex -= 1;
    }
    // Un départ pendant le tirage retire le lancer du partant, et peut suffire à
    // départager ceux qui restent.
    purgeFirstPlayerRoll(room.gameState, socketId);
    settleFirstPlayerDraw(room.gameState);
  }
}

function leaveAllRoomsForSocket(socketId: string, reason: string): void {
  for (const [code, room] of rooms.entries()) {
    if (!room.sockets.has(socketId)) continue;
    if (room.hostSocketId === socketId) {
      closeRoom(code, reason);
    } else {
      removeSocketFromRoom(room, socketId);
      room.emptySince = room.sockets.size === 0 ? Date.now() : null;
      emitGameState(room);
    }
  }
}

const roomSweep = setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    // Une partie en pause échappe aux délais courts : ni l'absence de
    // l'organisateur ni un salon vide ne la ferment. Seule la fenêtre de pause
    // la limite, afin qu'un salon oublié ne reste pas indéfiniment ouvert.
    if (room.gameState.isPaused) {
      const pausedSince = room.gameState.pausedAt ?? now;
      if (now - pausedSince >= PAUSED_ROOM_TTL_MS) {
        closeRoom(code, 'La partie est restée en pause trop longtemps.');
      }
      continue;
    }

    if (now - room.createdAt >= ROOM_MAX_AGE_MS) {
      closeRoom(code, 'Durée maximale du salon atteinte.');
    } else if (now - room.lastActivityAt >= ROOM_IDLE_TTL_MS) {
      closeRoom(code, 'Le salon a expiré après une longue période d’inactivité.');
    } else if (room.hostDisconnectedAt && now - room.hostDisconnectedAt >= HOST_RECONNECT_GRACE_MS) {
      closeRoom(code, 'L’organisateur a quitté le salon.');
    } else if (room.emptySince && now - room.emptySince >= EMPTY_ROOM_GRACE_MS) {
      closeRoom(code, 'Le salon est vide.');
    }
  }
}, ROOM_SWEEP_INTERVAL_MS);
roomSweep.unref();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const candidate = `FAM-${code}`;
    if (!rooms.has(candidate)) return candidate;
  }
  throw new Error('Impossible de générer un code de salon unique.');
}

// Socket.IO Connection Handler
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Connexion: ${socket.id}`);

  // Create Private Room
  socket.on('create-room', (data: { player: Partial<Player>; settings: Partial<GameSettings> }) => {
    leaveAllRoomsForSocket(socket.id, 'L’organisateur a créé un nouveau salon.');
    if (rooms.size >= MAX_ROOMS) {
      return socket.emit('error-msg', 'Trop de salons sont actifs. Réessayez dans quelques minutes.');
    }

    const roomCode = generateRoomCode();
    const isLocal = data.settings?.isLocalMode || false;

    const hostPlayer: Player = {
      id: socket.id,
      name: data.player.name || 'Hôte Famille',
      avatarId: data.player.avatarId || 'lion',
      color: data.player.color || '#EF4444',
      difficulty: data.player.difficulty || 'adulte',
      wedges: [],
      currentTileId: 0,
      isHost: true,
      isReady: isLocal,
      score: 0,
      correctAnswersCount: 0,
      totalAnswersCount: 0,
      isConnected: true,
      bonuses: {},
    };

    const initialSettings: GameSettings = {
      roomCode,
      boardType: data.settings.boardType || 'wheel',
      selectedCategories: data.settings.selectedCategories || ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports'],
      timerSeconds: data.settings.timerSeconds ?? DEFAULT_QUESTION_TIMER_SECONDS,
      wedgesToWin: data.settings.wedgesToWin || 6,
      isLocalMode: isLocal,
      isReaderMode: data.settings?.isReaderMode ?? DEFAULT_READER_MODE,
      enableLiveCamera: data.settings?.enableLiveCamera ?? false,
      enableBonuses: data.settings?.enableBonuses ?? DEFAULT_BONUS_MODE,
    };

    const initialGameState: GameState = {
      roomCode,
      phase: 'lobby',
      settings: initialSettings,
      players: [hostPlayer],
      activePlayerIndex: 0,
      diceValue: null,
      possibleMoves: [],
      selectedTileId: null,
      currentQuestion: null,
      questionStartTime: null,
      lastAnswerResult: null,
      winnerId: null,
      questionsPool: [...QUESTIONS_DATABASE],
      usedQuestionIds: [],
      bonusAwardedThisTurn: null,
      activeQuestionBonus: null,
    };

    const now = Date.now();
    const room: Room = {
      code: roomCode,
      hostSocketId: socket.id,
      generationToken: randomBytes(32).toString('base64url'),
      reconnectTokens: new Map([[socket.id, randomBytes(32).toString('base64url')]]),
      settings: initialSettings,
      gameState: initialGameState,
      sockets: new Map([[socket.id, hostPlayer]]),
      createdAt: now,
      lastActivityAt: now,
      emptySince: null,
      hostDisconnectedAt: null
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);

    socket.emit('room-created', {
      roomCode,
      player: hostPlayer,
      gameState: gameStateFor(room, socket.id),
      generationToken: room.generationToken,
      sessionToken: room.reconnectTokens.get(socket.id),
    });
    console.log(`[Room] Salon créé: ${roomCode} par ${hostPlayer.name}`);
  });

  // Reconnect Existing Session (on page refresh or disconnect recovery)
  socket.on('reconnect-session', (data: { roomCode: string; playerId: string; sessionToken?: string }) => {
    const code = (data.roomCode || '').toUpperCase().trim();
    const room = getRoom(code);

    if (!room) {
      return socket.emit('reconnect-failed', { message: 'Salon expiré ou introuvable.' });
    }

    const player = room.gameState.players.find(p => p.id === data.playerId);
    const expectedSessionToken = room.reconnectTokens.get(data.playerId);
    if (!player || !expectedSessionToken || !safeTokenEquals(data.sessionToken, expectedSessionToken)) {
      return socket.emit('reconnect-failed', { message: 'Joueur non trouvé dans ce salon.' });
    }

    // Transfer socket mapping to new socket ID
    const oldSocketId = player.id;
    player.id = socket.id;
    player.isConnected = true;
    // Le lancer du tirage suit le joueur : il n'a pas à relancer après un
    // simple rafraîchissement de page.
    transferFirstPlayerRoll(room.gameState, oldSocketId, socket.id);

    room.sockets.delete(oldSocketId);
    room.sockets.set(socket.id, player);
    room.reconnectTokens.delete(oldSocketId);
    room.reconnectTokens.set(socket.id, expectedSessionToken);
    room.emptySince = null;

    if (room.hostSocketId === oldSocketId) {
      room.hostSocketId = socket.id;
      room.hostDisconnectedAt = null;
      player.isHost = true;
    }

    socket.join(code);

    socket.emit('room-joined', {
      roomCode: code,
      player,
      gameState: gameStateFor(room, socket.id),
      generationToken: player.isHost ? room.generationToken : undefined,
      sessionToken: expectedSessionToken,
    });
    emitGameState(room);
    console.log(`[Room] ${player.name} s'est reconnecté avec succès à ${code}`);
  });

  // Join Room
  socket.on('join-room', (data: { roomCode: string; player: Partial<Player> }) => {
    const code = (data.roomCode || '').toUpperCase().trim();
    const room = getRoom(code);

    if (!room) {
      return socket.emit('error-msg', 'Salon introuvable. Vérifiez le code de la salle privée.');
    }

    if (room.gameState.players.length >= MAX_PLAYERS_PER_ROOM) {
      return socket.emit('error-msg', 'Ce salon a atteint sa limite de joueurs.');
    }

    // Create new player in room
    const newPlayer: Player = {
      id: socket.id,
      name: data.player.name || `Joueur ${room.gameState.players.length + 1}`,
      avatarId: data.player.avatarId || 'fox',
      color: data.player.color || '#3B82F6',
      difficulty: data.player.difficulty || 'adulte',
      wedges: [],
      currentTileId: 0,
      isHost: false,
      isReady: false,
      score: 0,
      correctAnswersCount: 0,
      totalAnswersCount: 0,
      isConnected: true,
      bonuses: {},
    };

    room.sockets.set(socket.id, newPlayer);
    const sessionToken = randomBytes(32).toString('base64url');
    room.reconnectTokens.set(socket.id, sessionToken);
    room.gameState.players.push(newPlayer);
    room.emptySince = null;
    socket.join(code);

    socket.emit('room-joined', {
      roomCode: code,
      player: newPlayer,
      gameState: gameStateFor(room, socket.id),
      sessionToken,
    });
    emitGameState(room);
    console.log(`[Room] ${newPlayer.name} a rejoint le salon ${code}`);
  });

  // Local Pass & Play Add Player
  socket.on('add-local-player', (data: { roomCode: string; player: Partial<Player> }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id || !room.settings.isLocalMode) return;
    if (room.gameState.players.length >= MAX_PLAYERS_PER_ROOM) {
      return socket.emit('error-msg', 'Ce salon a atteint sa limite de joueurs.');
    }

    const usedColors = new Set(room.gameState.players.map(player => player.color.toLowerCase()));
    const requestedColor = data.player.color?.toLowerCase();
    const availableColor = PLAYER_COLORS.find(color => !usedColors.has(color.toLowerCase())) || data.player.color || '#10B981';

    const newPlayer: Player = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: data.player.name || `Joueur ${room.gameState.players.length + 1}`,
      avatarId: data.player.avatarId || 'robot',
      color: requestedColor && !usedColors.has(requestedColor) ? data.player.color! : availableColor,
      difficulty: data.player.difficulty || 'enfant',
      wedges: [],
      currentTileId: 0,
      isHost: false,
      isReady: true,
      score: 0,
      correctAnswersCount: 0,
      totalAnswersCount: 0,
      isConnected: true,
      bonuses: {},
    };

    room.gameState.players.push(newPlayer);
    emitGameState(room);
  });

  socket.on('remove-local-player', (data: { roomCode: string; playerId: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id || !room.settings.isLocalMode || room.gameState.phase !== 'lobby') return;
    if (!data.playerId?.startsWith('local_')) return;

    room.gameState.players = room.gameState.players.filter(player => player.id !== data.playerId);
    emitGameState(room);
  });

  socket.on('toggle-ready', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'lobby' || room.settings.isLocalMode) return;

    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = !player.isReady;
    emitGameState(room);
  });

  // Update Settings (Host only)
  socket.on('update-settings', (data: { roomCode: string; settings: Partial<GameSettings> }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    room.settings = { ...room.settings, ...data.settings };
    room.gameState.settings = room.settings;

    emitGameState(room);
  });

  // Update Player Profile (Avatar, Color, Name, Difficulty)
  socket.on('update-player', (data: { roomCode: string; player: Partial<Player> }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const requestedPlayer = room.gameState.players.find(pl => pl.id === data.player.id);
    const canEditRequestedLocalPlayer = room.hostSocketId === socket.id && requestedPlayer?.id.startsWith('local_');
    const p = room.gameState.players.find(pl => pl.id === socket.id) || (canEditRequestedLocalPlayer ? requestedPlayer : undefined);
    if (p) {
      if (data.player.name !== undefined) p.name = data.player.name;
      if (data.player.avatarId) p.avatarId = data.player.avatarId;
      if (data.player.color) p.color = data.player.color;
      if (data.player.difficulty) p.difficulty = data.player.difficulty;

      emitGameState(room);
    }
  });

  // Add Custom AI Theme Pack
  socket.on('add-custom-pack', (data: { roomCode: string; themeName: string; questions: Question[] }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (!Array.isArray(data.questions) || data.questions.length === 0 || data.questions.length > 60) {
      return socket.emit('error-msg', 'Un pack doit contenir entre 1 et 60 questions.');
    }

    if (!room.gameState.customPacks) {
      room.gameState.customPacks = [];
    }

    const existingIndex = room.gameState.customPacks.findIndex(
      p => p.name.toLowerCase().trim() === data.themeName.toLowerCase().trim()
    );

    const currentCustomQuestionCount = room.gameState.customPacks.reduce(
      (total, pack) => total + pack.questions.length,
      0
    );
    if (currentCustomQuestionCount + data.questions.length > MAX_CUSTOM_QUESTIONS_PER_ROOM) {
      return socket.emit('error-msg', 'Ce salon a atteint sa limite de questions personnalisées.');
    }
    if (existingIndex < 0 && room.gameState.customPacks.length >= MAX_CUSTOM_PACKS_PER_ROOM) {
      return socket.emit('error-msg', 'Ce salon a atteint sa limite de thèmes personnalisés.');
    }

    if (existingIndex >= 0) {
      room.gameState.customPacks[existingIndex].questions.push(...data.questions);
    } else {
      room.gameState.customPacks.push({
        name: data.themeName,
        questions: data.questions
      });
    }

    // Le thème fraîchement généré rejoint les thèmes actifs, sans désactiver
    // les autres : la table peut jouer avec ses trois thèmes à la fois.
    if (!activeThemeKeys(room.settings).has(data.themeName.toLowerCase().trim())) {
      const activeNames = [
        ...(room.settings.customThemePackNames ?? []),
        ...(room.settings.customThemePackName ? [room.settings.customThemePackName] : []),
        data.themeName,
      ];
      room.settings.customThemePackNames = activeNames;
      room.settings.customThemePackName = undefined;
      room.gameState.settings.customThemePackNames = activeNames;
      room.gameState.settings.customThemePackName = undefined;
    }

    // Merge into room's active questions pool
    room.gameState.questionsPool = [...data.questions, ...room.gameState.questionsPool];

    emitGameState(room);
    console.log(`[Pack IA] ${data.questions.length} questions ajoutées pour "${data.themeName}" dans le salon ${data.roomCode}`);
  });

  // Start Game
  socket.on('start-game', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    if (room.gameState.players.length < 1) {
      return socket.emit('error-msg', 'Il faut au moins 1 joueur pour commencer.');
    }

    if (!room.settings.isLocalMode) {
      const connectedPlayers = room.gameState.players.filter(player => player.isConnected);
      if (connectedPlayers.some(player => !player.isReady)) {
        return socket.emit('error-msg', 'Tous les joueurs connectés doivent être prêts avant de commencer.');
      }
    }

    // Ensure all players have a non-empty name when game starts
    room.gameState.players.forEach((player, idx) => {
      if (!player.name || !player.name.trim()) {
        player.name = `Joueur ${idx + 1}`;
      }
    });

    // Collect all custom questions from custom packs added to the room
    const customQuestions: Question[] = [];
    if (room.gameState.customPacks) {
      room.gameState.customPacks.forEach((pack) => {
        customQuestions.push(...pack.questions);
      });
    }

    // Shuffle questions pool on game start (custom pack questions included first)
    room.gameState.questionsPool = shuffled([...customQuestions, ...QUESTIONS_DATABASE]);
    room.gameState.usedQuestionIds = [];
    room.gameState.bonusAwardedThisTurn = null;
    room.gameState.activeQuestionBonus = null;

    // Le premier joueur n'est plus l'organisateur d'office : tout le monde
    // lance le dé une fois et le meilleur lancer ouvre la partie. Une partie
    // solo n'a évidemment rien à départager.
    if (room.gameState.players.length === 1) {
      skipFirstPlayerDraw(room.gameState);
    } else {
      beginFirstPlayerDraw(room.gameState, Date.now());
    }

    emitGameState(room);
    saveRooms(rooms);
  });

  /**
   * Qui lance, et pour qui.
   *
   * En ligne, chacun lance pour lui-même. En pass & play, l'appareil est unique :
   * l'organisateur lance pour chaque joueur à son tour, dans l'ordre de la table.
   */
  function resolveFirstPlayerRoller(room: Room, socketId: string, requestedId?: string): Player | null {
    const pending = pendingRollers(room.gameState);
    if (pending.length === 0) return null;

    const roller = room.settings.isLocalMode
      ? room.hostSocketId === socketId ? pending[0] : null
      : pending.find(player => player.id === socketId) ?? null;

    // Le client annonce pour qui il croit lancer. S'il se trompe — parce que la
    // partie a avancé entre-temps, ou parce qu'il vise quelqu'un d'autre — mieux
    // vaut refuser que d'attribuer le lancer au voisin.
    if (!roller || (requestedId && requestedId !== roller.id)) return null;
    return roller;
  }

  // Tirage du premier joueur : un seul lancer par joueur.
  socket.on('roll-first-player', (data: { roomCode: string; playerId?: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'first_player_roll') return;
    if (isPaused(room)) return;

    const roller = resolveFirstPlayerRoller(room, socket.id, data.playerId);
    if (!roller) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    if (!recordFirstPlayerRoll(room.gameState, roller.id, dice, Date.now())) return;

    settleFirstPlayerDraw(room.gameState);
    emitGameState(room);
    saveRooms(rooms);
  });

  /**
   * Départage sans attendre les joueurs manquants. Réservée à l'organisateur,
   * cette sortie de secours évite qu'un joueur parti chercher un verre bloque
   * indéfiniment le lancement de la partie.
   */
  socket.on('end-first-player-roll', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.gameState.phase !== 'first_player_roll') return;

    if (!settleFirstPlayerDraw(room.gameState, { force: true })) {
      return socket.emit('error-msg', 'Il faut au moins un lancer pour désigner le premier joueur.');
    }

    emitGameState(room);
    saveRooms(rooms);
  });

  // Helper to check if a socket is authorized to take action for the active player
  function isPlayerAllowedToAct(room: any, socketId: string): boolean {
    const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
    if (!activePlayer) return false;

    // Direct online player turn
    if (activePlayer.id === socketId) return true;

    // Local pass-and-play player, room host, or single-player room host
    if (room.hostSocketId === socketId) {
      if (room.settings.isLocalMode || activePlayer.id.startsWith('local_') || room.gameState.players.length === 1) {
        return true;
      }
    }

    return false;
  }

  function isPlayerAllowedToAnswer(room: Room, socketId: string): boolean {
    if (isPlayerAllowedToAct(room, socketId)) return true;
    if (!isCardReadAloud(room.settings)) return false;

    return resolveReaderId(room.gameState.players, room.gameState.activePlayerIndex) === socketId;
  }

  /**
   * Bascule la pause. Réservée à l'organisateur.
   *
   * À la reprise, `questionStartTime` est décalé de la durée de la pause : le
   * minuteur repart là où il s'était arrêté au lieu d'avoir expiré entre-temps.
   */
  socket.on('toggle-pause', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.gameState.phase === 'lobby' || room.gameState.phase === 'game_over') return;

    const wasPaused = room.gameState.isPaused === true;
    togglePauseState(room.gameState, Date.now());
    console.log(`[Room] Partie ${wasPaused ? 'reprise' : 'mise en pause'}: ${room.code}`);

    emitGameState(room);
    saveRooms(rooms);
  });

  /** Pendant la pause, aucune action de jeu n'est acceptée. */
  function isPaused(room: Room): boolean {
    return room.gameState.isPaused === true;
  }

  // Roll Dice
  socket.on('roll-dice', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'rolling') return;
    if (isPaused(room)) return;

    if (!isPlayerAllowedToAct(room, socket.id)) {
      console.warn(`[Roll Rejected] Socket ${socket.id} is not active player ${room.gameState.players[room.gameState.activePlayerIndex]?.id}`);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    room.gameState.diceValue = dice;
    room.gameState.phase = 'moving';
    room.gameState.lastTurnEventMessage = null;
    room.gameState.bonusAwardedThisTurn = null;
    room.gameState.activeQuestionBonus = null;

    const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
    const board = BOARD_PRESETS[room.settings.boardType];

    // Calculate possible movement destination tile IDs
    const currentTile = board.tiles.find(t => t.id === activePlayer.currentTileId) || board.tiles[0];
    const possibleMoves = calculateMoves(currentTile.id, dice, board);

    // Compute possible destination tiles; movement will be executed via 'move-player'
    room.gameState.possibleMoves = possibleMoves;

    emitGameState(room);
  });

  // Move Token to Tile
  socket.on('move-player', (data: { roomCode: string; destinationTileId: number }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'moving') return;
    if (isPaused(room)) return;

    if (!isPlayerAllowedToAct(room, socket.id)) {
      console.warn(`[Move Rejected] Socket ${socket.id} not allowed to move for player`);
      return;
    }

    // Guardrail: Destination tile must be one of the calculated possible moves
    if (room.gameState.possibleMoves.length > 0 && !room.gameState.possibleMoves.includes(data.destinationTileId)) {
      console.warn(`[Move Safety] Tile ${data.destinationTileId} not in possibleMoves, redirecting to:`, room.gameState.possibleMoves[0]);
      data.destinationTileId = room.gameState.possibleMoves[0];
    }

    const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
    activePlayer.currentTileId = data.destinationTileId;
    room.gameState.selectedTileId = data.destinationTileId;

    const board = BOARD_PRESETS[room.settings.boardType];
    const tile = board.tiles.find(t => t.id === data.destinationTileId);

    if (!tile) return;

    if (tile.type === 'reroll') {
      // Re-roll tile: player gets another roll!
      room.gameState.phase = 'rolling';
      room.gameState.diceValue = null;
      room.gameState.possibleMoves = [];
      room.gameState.lastTurnEventMessage = `🎲 ${activePlayer.name} a atterri sur une case Relancer le dé ! Rejouez tout de suite.`;
      emitGameState(room);
      return;
    }

    const surpriseBonus = tile.type === 'surprise' ? awardSurpriseBonus(room.gameState) : null;
    if (surpriseBonus) {
      const label = surpriseBonus === 'camembert_joker'
        ? 'un Joker camembert (une bonne réponse rapporte un camembert !)'
        : 'un 50/50';
      room.gameState.lastTurnEventMessage = `🎁 Boîte surprise : ${activePlayer.name} gagne ${label}`;
    }

    // Pick question according to tile category or player's difficulty
    const validCategories = room.settings.selectedCategories && room.settings.selectedCategories.length > 0 
      ? room.settings.selectedCategories 
      : ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports', 'popculture', 'gastronomie'];

    const categoryId = tile.categoryId || validCategories[Math.floor(Math.random() * validCategories.length)];
    const question = pickQuestionForPlayer(room.gameState, categoryId as CategoryId, activePlayer.difficulty);

    room.gameState.currentQuestion = question;
    room.gameState.phase = 'question';
    room.gameState.questionStartTime = Date.now();

    emitGameState(room);
    saveRooms(rooms);
  });

  // Use a stored question bonus. The server chooses the eliminated answers so
  // the correct answer never needs to be sent to the answering player's client.
  socket.on('use-bonus', (data: { roomCode: string; bonusType: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || isPaused(room)) return;
    if (!BONUS_ROSTER.includes(data.bonusType as BonusType)) return;
    if (!isPlayerAllowedToAnswer(room, socket.id)) return;
    if (!useBonus(room.gameState, data.bonusType as BonusType)) return;

    emitGameState(room);
    saveRooms(rooms);
  });

  // Submit Question Answer
  socket.on('submit-answer', (data: { roomCode: string; optionIndex: number }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'question' || !room.gameState.currentQuestion) return;
    if (isPaused(room)) return;
    if (!isPlayerAllowedToAnswer(room, socket.id)) return;
    if (!Number.isInteger(data.optionIndex) || data.optionIndex < -1 || data.optionIndex > 3) return;
    if (room.gameState.activeQuestionBonus?.hiddenOptionIndexes.includes(data.optionIndex)) return;

    const board = BOARD_PRESETS[room.settings.boardType];
    resolveAnswer(room.gameState, room.settings, board, data.optionIndex);
    emitGameState(room);
  });

  // Next Turn or Extra Turn
  socket.on('next-turn', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase === 'game_over') return;
    if (isPaused(room)) return;

    // Guardrail: next-turn CAN ONLY BE EXECUTED when phase is evaluating or question
    if (room.gameState.phase !== 'evaluating' && room.gameState.phase !== 'question') {
      console.warn(`[NextTurn Rejected] Cannot trigger next-turn from phase "${room.gameState.phase}"`);
      return;
    }
    if (!isPlayerAllowedToAnswer(room, socket.id)) return;

    advanceTurn(room.gameState);
    emitGameState(room);
  });

  // Send Emoji Reaction
  socket.on('send-emoji', (data: { roomCode: string; emoji: string }) => {
    const room = getRoom(data.roomCode);
    if (!room) return;

    const player = room.gameState.players.find(p => p.id === socket.id);
    io.to(data.roomCode).emit('emoji-received', {
      id: `${Date.now()}_${Math.random()}`,
      playerId: socket.id,
      playerName: player?.name || 'Joueur',
      emoji: data.emoji,
      timestamp: Date.now()
    });
  });

  // WebRTC Signaling for the live reader/answerer duo.
  //
  // Two players are on air during a question: the answerer and their reader.
  // Each of them publishes to every other room member, so the duo see and hear
  // each other and the remaining players follow along. Only a publisher may
  // offer, which keeps the handshake free of glare: a connection is therefore
  // fully identified by its publisher, carried in `publisherId`.
  const isOnAir = (room: Room, socketId: string) =>
    room.settings.enableLiveCamera === true
    && room.gameState.phase === 'question'
    && resolveOnAirIds(room.gameState.players, room.gameState.activePlayerIndex).includes(socketId);

  socket.on('webrtc-broadcaster-ready', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || !isOnAir(room, socket.id)) return;

    socket.to(data.roomCode).emit('webrtc-broadcaster-ready', {
      senderPlayerId: socket.id
    });
  });

  socket.on('webrtc-viewer-ready', (data: { roomCode: string; targetPlayerId: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;
    if (!isOnAir(room, data.targetPlayerId)) return;
    // A publisher never subscribes to itself, and asking for one's own stream
    // would make it open a peer connection to its own socket.
    if (data.targetPlayerId === socket.id) return;

    io.to(data.targetPlayerId).emit('webrtc-viewer-ready', {
      senderPlayerId: socket.id
    });
  });

  socket.on('webrtc-offer', (data: { roomCode: string; targetPlayerId: string; offer: any }) => {
    const room = getRoom(data.roomCode);
    if (!room || !isOnAir(room, socket.id)) return;
    if (!room.sockets.has(data.targetPlayerId)) return;

    io.to(data.targetPlayerId).emit('webrtc-offer', {
      senderPlayerId: socket.id,
      offer: data.offer
    });
  });

  socket.on('webrtc-answer', (data: { roomCode: string; targetPlayerId: string; answer: any }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;
    if (!isOnAir(room, data.targetPlayerId)) return;

    io.to(data.targetPlayerId).emit('webrtc-answer', {
      senderPlayerId: socket.id,
      answer: data.answer
    });
  });

  socket.on('webrtc-candidate', (data: {
    roomCode: string;
    targetPlayerId: string;
    publisherId: string;
    candidate: any;
  }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;
    if (!room.sockets.has(data.targetPlayerId)) return;
    // The candidate must belong to a live connection, and both ends must be part
    // of it: without this, any room member could inject candidates into a
    // stranger's session.
    if (!isOnAir(room, data.publisherId)) return;
    if (data.publisherId !== socket.id && data.publisherId !== data.targetPlayerId) return;

    io.to(data.targetPlayerId).emit('webrtc-candidate', {
      senderPlayerId: socket.id,
      publisherId: data.publisherId,
      candidate: data.candidate
    });
  });

  socket.on('webrtc-stop', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    // Any room member may announce that their own stream stopped: a sender can
    // only ever speak about itself here. Requiring the broadcaster role would
    // reject the notice sent at the end of a turn, since the phase has already
    // left `question` by then — which left every viewer holding a dead peer
    // connection until ICE eventually timed out.
    if (!room || !room.sockets.has(socket.id)) return;

    socket.to(data.roomCode).emit('webrtc-stopped', {
      senderPlayerId: socket.id
    });
  });

  socket.on('leave-room', (data: { roomCode: string }) => {
    const code = (data.roomCode || '').toUpperCase().trim();
    const room = getRoom(code);
    if (!room || !room.sockets.has(socket.id)) return;

    if (room.hostSocketId === socket.id) {
      closeRoom(code, 'L’organisateur a fermé le salon.');
      return;
    }

    removeSocketFromRoom(room, socket.id);
    socket.leave(code);
    socket.emit('room-left');
    room.emptySince = room.sockets.size === 0 ? Date.now() : null;
    emitGameState(room);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Déconnexion: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      if (room.sockets.has(socket.id)) {
        room.sockets.delete(socket.id);
        const p = room.gameState.players.find(pl => pl.id === socket.id);
        if (p) {
          p.isConnected = false;
          // On n'attend plus le lancer d'un absent : si les présents ont tous
          // lancé, le tirage se tranche tout de suite.
          settleFirstPlayerDraw(room.gameState);
        }

        if (room.hostSocketId === socket.id) {
          room.hostDisconnectedAt = Date.now();
        }
        room.emptySince = room.sockets.size === 0 ? Date.now() : null;

        emitGameState(room);
      }
    }
  });
});

// Vite & Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');
    const contentTypes: Record<string, string> = {
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
    };

    // Vite filenames are content-hashed. Serve the precompressed variant and
    // cache it for a year; a future deployment gets a new filename.
    app.get('/assets/*', (req, res, next) => {
      const relativeAsset = req.path.slice('/assets/'.length);
      const originalPath = path.resolve(assetsPath, relativeAsset);
      if (!originalPath.startsWith(`${assetsPath}${path.sep}`)) return next();

      const accepted = req.header('accept-encoding') ?? '';
      const encoding = accepted.includes('br') ? 'br' : accepted.includes('gzip') ? 'gzip' : null;
      const compressedPath = encoding === 'br'
        ? `${originalPath}.br`
        : encoding === 'gzip'
          ? `${originalPath}.gz`
          : originalPath;

      if (!existsSync(compressedPath)) return next();
      const contentType = contentTypes[path.extname(originalPath)];
      if (contentType) res.setHeader('Content-Type', contentType);
      if (encoding) {
        res.setHeader('Content-Encoding', encoding);
        res.setHeader('Vary', 'Accept-Encoding');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(compressedPath);
    });

    app.use(express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        const isHashedAsset = filePath.startsWith(`${assetsPath}${path.sep}`);
        res.setHeader(
          'Cache-Control',
          isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
        );
      },
    }));
    const indexTemplate = readFileSync(path.join(distPath, 'index.html'), 'utf-8');
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.type('html').send(withAbsolutePreviewImages(indexTemplate, previewOrigin(req)));
    });
  }

  checkStore();
  startRoomPersistence(rooms);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Serveur Trivial Pursuit Famille en ligne sur http://0.0.0.0:${PORT}`);
    console.log(`💾 Parties sauvegardées dans ${ROOM_STORE_PATH}`);
  });
}

startServer();
