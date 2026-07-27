import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { QUESTIONS_DATABASE } from './src/data/questions.js';
import { BOARD_PRESETS } from './src/data/boards.js';
import { 
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

app.use(express.json());

// Category Normalizer to prevent accent or formatting mismatches
function normalizeCategoryId(rawCat: string): CategoryId {
  if (!rawCat) return 'popculture';
  const clean = String(rawCat).toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (clean.includes('hist')) return 'histoire';
  if (clean.includes('geo')) return 'geographie';
  if (clean.includes('cin') || clean.includes('film') || clean.includes('serie')) return 'cinema';
  if (clean.includes('scien') || clean.includes('nat')) return 'sciences';
  if (clean.includes('art') || clean.includes('lit')) return 'art';
  if (clean.includes('sport')) return 'sports';
  if (clean.includes('pop') || clean.includes('cult')) return 'popculture';
  if (clean.includes('gastro') || clean.includes('cuis') || clean.includes('manger')) return 'gastronomie';

  const validCategories: CategoryId[] = ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports', 'popculture', 'gastronomie'];
  return validCategories.includes(clean as CategoryId) ? (clean as CategoryId) : 'popculture';
}

// --- GEMINI API DYNAMIC PACK GENERATOR ---

function normalizeDifficulty(raw: unknown): DifficultyLevel {
  const clean = String(raw ?? '').toLowerCase().trim();
  if (clean.includes('enf') || clean.includes('facile') || clean.includes('easy')) return 'enfant';
  if (clean.includes('ado') || clean.includes('moyen') || clean.includes('medium')) return 'ado';
  return 'adulte';
}

// Normalized question text, used to detect near-duplicates (accents/punctuation ignored)
function normalizeQuestionText(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

let baseQuestionTexts: Set<string> | null = null;
function getBaseQuestionTexts(): Set<string> {
  if (!baseQuestionTexts) {
    baseQuestionTexts = new Set(QUESTIONS_DATABASE.map(q => normalizeQuestionText(q.question)));
  }
  return baseQuestionTexts;
}

const GENERATED_PACK_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      categoryId: {
        type: Type.STRING,
        enum: ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports', 'popculture', 'gastronomie']
      },
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctAnswerIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: ['enfant', 'ado', 'adulte'] }
    },
    required: ['categoryId', 'question', 'options', 'correctAnswerIndex', 'explanation', 'difficulty']
  }
};

const GENERATION_BATCH_SIZE = 15;
const GENERATION_MAX_COUNT = 60;

async function generateQuestionBatch(
  ai: GoogleGenAI,
  themeName: string,
  count: number
): Promise<any[]> {
  const perLevel = Math.max(1, Math.floor(count / 3));
  const prompt = `Génère exactement ${count} questions de quiz captivantes, amusantes et FACTUELLEMENT EXACTES en français sur le thème "${themeName}", pour un jeu familial de type Trivial Pursuit.

Règles impératives :
- Répartis les questions entre les catégories du jeu (histoire, geographie, cinema, sciences, art, sports, popculture, gastronomie) en choisissant celles qui collent le mieux au thème.
- Répartis les difficultés : environ ${perLevel} questions "enfant" (6-10 ans, très simples), ${perLevel} "ado" (11-16 ans) et le reste "adulte".
- Exactement 4 options par question, une seule correcte (correctAnswerIndex entre 0 et 3), distracteurs plausibles.
- "explanation" : une anecdote courte et intéressante ("Le saviez-vous ?").
- Contenu adapté à un public familial, aucune question polémique ou choquante.
- Aucune question en double ni reformulation d'une autre question du lot.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: GENERATED_PACK_SCHEMA
    }
  });

  const parsed = JSON.parse(response.text || '[]');
  if (!Array.isArray(parsed)) {
    throw new Error('Réponse JSON invalide de Gemini');
  }
  return parsed;
}

app.post('/api/generate-pack', async (req, res) => {
  try {
    const { themeName, count = 30 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY non configurée.' });
    }

    if (!themeName || typeof themeName !== 'string' || themeName.trim().length < 2 || themeName.length > 100) {
      return res.status(400).json({ error: 'Nom de thème requis (2 à 100 caractères).' });
    }

    const cleanTheme = themeName.trim();
    const requestedCount = Math.min(Math.max(Number(count) || 30, 5), GENERATION_MAX_COUNT);

    const ai = new GoogleGenAI({ apiKey });

    // Split the generation into parallel batches: small batches are far more
    // reliable than a single large one, and one failed batch doesn't sink the pack.
    const batchSizes: number[] = [];
    for (let remaining = requestedCount; remaining > 0; remaining -= GENERATION_BATCH_SIZE) {
      batchSizes.push(Math.min(GENERATION_BATCH_SIZE, remaining));
    }

    const batchResults = await Promise.allSettled(
      batchSizes.map(async (size) => {
        try {
          return await generateQuestionBatch(ai, cleanTheme, size);
        } catch (err) {
          console.warn(`[Pack IA] Lot en échec, nouvelle tentative:`, err instanceof Error ? err.message : err);
          return await generateQuestionBatch(ai, cleanTheme, size);
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

    // Validate, normalize and deduplicate (within the pack and against the base database)
    const seenTexts = new Set<string>();
    const baseTexts = getBaseQuestionTexts();
    const stamp = Date.now();

    const generatedQuestions: Question[] = rawQuestions
      .filter((q) => {
        if (!q || typeof q.question !== 'string' || q.question.trim().length < 10) return false;
        if (!Array.isArray(q.options) || q.options.length !== 4) return false;
        if (q.options.some((o: unknown) => typeof o !== 'string' || !String(o).trim())) return false;
        if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) return false;

        const normalized = normalizeQuestionText(q.question);
        if (seenTexts.has(normalized) || baseTexts.has(normalized)) return false;
        seenTexts.add(normalized);
        return true;
      })
      .map((q, idx) => ({
        id: `gen_${stamp}_${idx}`,
        categoryId: normalizeCategoryId(q.categoryId),
        question: q.question.trim(),
        options: q.options.map((o: string) => String(o).trim()),
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: (typeof q.explanation === 'string' && q.explanation.trim()) || `Question tirée du thème ${cleanTheme}`,
        difficulty: normalizeDifficulty(q.difficulty),
        themePack: cleanTheme
      }));

    if (generatedQuestions.length === 0) {
      throw new Error('Aucune question valide générée, réessayez avec un thème plus précis.');
    }

    console.log(`[Pack IA] ${generatedQuestions.length}/${rawQuestions.length} questions valides générées pour "${cleanTheme}"`);
    return res.json({ success: true, questions: generatedQuestions, themeName: cleanTheme });
  } catch (err: unknown) {
    console.error('Erreur génération Gemini:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du thème';
    return res.status(500).json({ error: errorMessage });
  }
});

// --- MULTIPLAYER ROOMS STORE ---
interface Room {
  code: string;
  hostSocketId: string;
  settings: GameSettings;
  gameState: GameState;
  sockets: Map<string, Player>; // socketId -> Player
  createdAt: number;
  lastActivityAt: number;
  emptySince: number | null;
  hostDisconnectedAt: number | null;
}

const rooms = new Map<string, Room>();
const positiveDuration = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const MAX_ROOMS = 250;
const MAX_PLAYERS_PER_ROOM = 12;
const MAX_CUSTOM_PACKS_PER_ROOM = 3;
const MAX_CUSTOM_QUESTIONS_PER_ROOM = 180;
const HOST_RECONNECT_GRACE_MS = positiveDuration(process.env.ROOM_HOST_GRACE_MS, 2 * 60 * 1000);
const EMPTY_ROOM_GRACE_MS = positiveDuration(process.env.ROOM_EMPTY_GRACE_MS, 2 * 60 * 1000);
const ROOM_IDLE_TTL_MS = positiveDuration(process.env.ROOM_IDLE_TTL_MS, 4 * 60 * 60 * 1000);
const ROOM_MAX_AGE_MS = positiveDuration(process.env.ROOM_MAX_AGE_MS, 12 * 60 * 60 * 1000);
const ROOM_SWEEP_INTERVAL_MS = positiveDuration(process.env.ROOM_SWEEP_INTERVAL_MS, 30 * 1000);

function getRoom(code: string): Room | undefined {
  const room = rooms.get(code);
  if (room) room.lastActivityAt = Date.now();
  return room;
}

function closeRoom(code: string, reason: string): boolean {
  const room = rooms.get(code);
  if (!room) return false;

  io.to(code).emit('room-closed', { reason });
  io.in(code).socketsLeave(code);
  room.sockets.clear();
  room.gameState.players.length = 0;
  room.gameState.questionsPool.length = 0;
  room.gameState.usedQuestionIds.length = 0;
  room.gameState.customPacks = [];
  rooms.delete(code);
  console.log(`[Room] Salon supprimé: ${code} (${reason}). Salons actifs: ${rooms.size}`);
  return true;
}

function removeSocketFromRoom(room: Room, socketId: string): void {
  room.sockets.delete(socketId);
  const playerIndex = room.gameState.players.findIndex(player => player.id === socketId);
  if (playerIndex >= 0) {
    room.gameState.players.splice(playerIndex, 1);
    if (room.gameState.activePlayerIndex >= room.gameState.players.length) {
      room.gameState.activePlayerIndex = 0;
    } else if (playerIndex < room.gameState.activePlayerIndex) {
      room.gameState.activePlayerIndex -= 1;
    }
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
      io.to(code).emit('game-state-update', room.gameState);
    }
  }
}

const roomSweep = setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
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
      isConnected: true
    };

    const initialSettings: GameSettings = {
      roomCode,
      boardType: data.settings.boardType || 'wheel',
      selectedCategories: data.settings.selectedCategories || ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports'],
      timerSeconds: data.settings.timerSeconds ?? 30,
      wedgesToWin: data.settings.wedgesToWin || 6,
      isLocalMode: isLocal,
      isReaderMode: data.settings?.isReaderMode ?? false,
      enableLiveCamera: data.settings?.enableLiveCamera ?? false
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
      usedQuestionIds: []
    };

    const now = Date.now();
    const room: Room = {
      code: roomCode,
      hostSocketId: socket.id,
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

    socket.emit('room-created', { roomCode, player: hostPlayer, gameState: initialGameState });
    console.log(`[Room] Salon créé: ${roomCode} par ${hostPlayer.name}`);
  });

  // Reconnect Existing Session (on page refresh or disconnect recovery)
  socket.on('reconnect-session', (data: { roomCode: string; playerId: string }) => {
    const code = (data.roomCode || '').toUpperCase().trim();
    const room = getRoom(code);

    if (!room) {
      return socket.emit('reconnect-failed', { message: 'Salon expiré ou introuvable.' });
    }

    const player = room.gameState.players.find(p => p.id === data.playerId);
    if (!player) {
      return socket.emit('reconnect-failed', { message: 'Joueur non trouvé dans ce salon.' });
    }

    // Transfer socket mapping to new socket ID
    const oldSocketId = player.id;
    player.id = socket.id;
    player.isConnected = true;

    room.sockets.delete(oldSocketId);
    room.sockets.set(socket.id, player);
    room.emptySince = null;

    if (room.hostSocketId === oldSocketId) {
      room.hostSocketId = socket.id;
      room.hostDisconnectedAt = null;
      player.isHost = true;
    }

    socket.join(code);

    socket.emit('room-joined', { roomCode: code, player, gameState: room.gameState });
    io.to(code).emit('game-state-update', room.gameState);
    console.log(`[Room] ${player.name} s'est reconnecté avec succès à ${code}`);
  });

  // Join Room
  socket.on('join-room', (data: { roomCode: string; player: Partial<Player>; playerId?: string }) => {
    const code = (data.roomCode || '').toUpperCase().trim();
    const room = getRoom(code);

    if (!room) {
      return socket.emit('error-msg', 'Salon introuvable. Vérifiez le code de la salle privée.');
    }

    // Check if player is rejoining an existing player profile
    let existingPlayer = data.playerId 
      ? room.gameState.players.find(p => p.id === data.playerId)
      : undefined;

    if (!existingPlayer && data.player.name) {
      existingPlayer = room.gameState.players.find(
        p => p.name.trim().toLowerCase() === data.player.name?.trim().toLowerCase() && !p.isConnected
      );
    }

    if (existingPlayer) {
      const oldId = existingPlayer.id;
      existingPlayer.id = socket.id;
      existingPlayer.isConnected = true;
      if (data.player.avatarId) existingPlayer.avatarId = data.player.avatarId;
      if (data.player.color) existingPlayer.color = data.player.color;
      if (data.player.difficulty) existingPlayer.difficulty = data.player.difficulty;

      room.sockets.delete(oldId);
      room.sockets.set(socket.id, existingPlayer);
      room.emptySince = null;

      if (room.hostSocketId === oldId) {
        room.hostSocketId = socket.id;
        room.hostDisconnectedAt = null;
        existingPlayer.isHost = true;
      }

      socket.join(code);
      socket.emit('room-joined', { roomCode: code, player: existingPlayer, gameState: room.gameState });
      io.to(code).emit('game-state-update', room.gameState);
      console.log(`[Room] ${existingPlayer.name} a réintégré le salon ${code}`);
      return;
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
      isConnected: true
    };

    room.sockets.set(socket.id, newPlayer);
    room.gameState.players.push(newPlayer);
    room.emptySince = null;
    socket.join(code);

    socket.emit('room-joined', { roomCode: code, player: newPlayer, gameState: room.gameState });
    io.to(code).emit('game-state-update', room.gameState);
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
      isConnected: true
    };

    room.gameState.players.push(newPlayer);
    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  socket.on('remove-local-player', (data: { roomCode: string; playerId: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id || !room.settings.isLocalMode || room.gameState.phase !== 'lobby') return;
    if (!data.playerId?.startsWith('local_')) return;

    room.gameState.players = room.gameState.players.filter(player => player.id !== data.playerId);
    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  socket.on('toggle-ready', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'lobby' || room.settings.isLocalMode) return;

    const player = room.gameState.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = !player.isReady;
    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  // Update Settings (Host only)
  socket.on('update-settings', (data: { roomCode: string; settings: Partial<GameSettings> }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    room.settings = { ...room.settings, ...data.settings };
    room.gameState.settings = room.settings;

    io.to(data.roomCode).emit('game-state-update', room.gameState);
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

      io.to(data.roomCode).emit('game-state-update', room.gameState);
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

    // Set active custom theme pack name in settings
    room.settings.customThemePackName = data.themeName;
    room.gameState.settings.customThemePackName = data.themeName;

    // Merge into room's active questions pool
    room.gameState.questionsPool = [...data.questions, ...room.gameState.questionsPool];

    io.to(data.roomCode).emit('game-state-update', room.gameState);
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
    const combinedPool = [...customQuestions, ...QUESTIONS_DATABASE];
    const shuffledPool = [...combinedPool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }
    room.gameState.questionsPool = shuffledPool;
    room.gameState.usedQuestionIds = [];

    room.gameState.phase = 'rolling';
    room.gameState.activePlayerIndex = 0;
    room.gameState.diceValue = null;
    room.gameState.possibleMoves = [];
    room.gameState.lastTurnEventMessage = null;

    io.to(data.roomCode).emit('game-state-update', room.gameState);
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
    if (!room.settings.isReaderMode) return false;

    const players = room.gameState.players;
    const readerIndex = (room.gameState.activePlayerIndex + 1) % players.length;
    return players[readerIndex]?.id === socketId;
  }

  // Roll Dice
  socket.on('roll-dice', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'rolling') return;

    if (!isPlayerAllowedToAct(room, socket.id)) {
      console.warn(`[Roll Rejected] Socket ${socket.id} is not active player ${room.gameState.players[room.gameState.activePlayerIndex]?.id}`);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    room.gameState.diceValue = dice;
    room.gameState.phase = 'moving';
    room.gameState.lastTurnEventMessage = null;

    const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
    const board = BOARD_PRESETS[room.settings.boardType];

    // Calculate possible movement destination tile IDs
    const currentTile = board.tiles.find(t => t.id === activePlayer.currentTileId) || board.tiles[0];
    const possibleMoves = calculateMoves(currentTile.id, dice, board.tiles);

    // Compute possible destination tiles; movement will be executed via 'move-player'
    room.gameState.possibleMoves = possibleMoves;

    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  // Move Token to Tile
  socket.on('move-player', (data: { roomCode: string; destinationTileId: number }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'moving') return;

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
      io.to(data.roomCode).emit('game-state-update', room.gameState);
      return;
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

    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  // Submit Question Answer
  socket.on('submit-answer', (data: { roomCode: string; optionIndex: number }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase !== 'question' || !room.gameState.currentQuestion) return;
    if (!isPlayerAllowedToAnswer(room, socket.id)) return;
    if (!Number.isInteger(data.optionIndex) || data.optionIndex < -1 || data.optionIndex > 3) return;

    const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
    const q = room.gameState.currentQuestion;
    const isCorrect = (data.optionIndex === q.correctAnswerIndex);

    activePlayer.totalAnswersCount++;
    if (isCorrect) {
      activePlayer.correctAnswersCount++;
      activePlayer.score += 100;
    }

    // Check if player landed on a Camembert / Wedge tile or Hub tile
    const board = BOARD_PRESETS[room.settings.boardType];
    const tile = board.tiles.find(t => t.id === activePlayer.currentTileId);
    let earnedWedge: CategoryId | null = null;

    if (isCorrect && (tile?.type === 'camembert' || tile?.isCamembert)) {
      const cat = tile.categoryId || q.categoryId;
      if (!activePlayer.wedges.includes(cat)) {
        activePlayer.wedges.push(cat);
        earnedWedge = cat;
      }
    }

    // Check center hub victory condition
    let isWinner = false;
    if (isCorrect && tile?.type === 'hub') {
      if (activePlayer.wedges.length >= room.settings.wedgesToWin) {
        isWinner = true;
        room.gameState.winnerId = activePlayer.id;
        room.gameState.phase = 'game_over';
      }
    }

    room.gameState.lastAnswerResult = {
      playerId: activePlayer.id,
      isCorrect,
      selectedOption: data.optionIndex,
      earnedWedge
    };

    if (!isWinner) {
      room.gameState.phase = 'evaluating';
    }

    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  // Next Turn or Extra Turn
  socket.on('next-turn', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || room.gameState.phase === 'game_over') return;

    // Guardrail: next-turn CAN ONLY BE EXECUTED when phase is evaluating or question
    if (room.gameState.phase !== 'evaluating' && room.gameState.phase !== 'question') {
      console.warn(`[NextTurn Rejected] Cannot trigger next-turn from phase "${room.gameState.phase}"`);
      return;
    }
    if (!isPlayerAllowedToAnswer(room, socket.id)) return;

    const lastResult = room.gameState.lastAnswerResult;
    // If answer was correct, player gets to roll again! If wrong, next player's turn.
    if (!lastResult?.isCorrect) {
      room.gameState.activePlayerIndex = (room.gameState.activePlayerIndex + 1) % room.gameState.players.length;
      room.gameState.lastTurnEventMessage = null;
    } else {
      const activePlayer = room.gameState.players[room.gameState.activePlayerIndex];
      room.gameState.lastTurnEventMessage = `✨ Bonne réponse ! ${activePlayer?.name || 'Vous'} rejoue(z) !`;
    }

    room.gameState.phase = 'rolling';
    room.gameState.diceValue = null;
    room.gameState.possibleMoves = [];
    room.gameState.currentQuestion = null;
    room.gameState.lastAnswerResult = null;

    io.to(data.roomCode).emit('game-state-update', room.gameState);
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

  // WebRTC Signaling for Live Camera Spotlight
  socket.on('webrtc-offer', (data: { roomCode: string; targetPlayerId: string; offer: any }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;
    if (!room.sockets.has(data.targetPlayerId)) return;

    io.to(data.targetPlayerId).emit('webrtc-offer', {
      senderPlayerId: socket.id,
      offer: data.offer
    });
  });

  socket.on('webrtc-answer', (data: { roomCode: string; targetPlayerId: string; answer: any }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;
    if (!room.sockets.has(data.targetPlayerId)) return;

    io.to(data.targetPlayerId).emit('webrtc-answer', {
      senderPlayerId: socket.id,
      answer: data.answer
    });
  });

  socket.on('webrtc-candidate', (data: { roomCode: string; targetPlayerId: string; candidate: any }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;
    if (!room.sockets.has(data.targetPlayerId)) return;

    io.to(data.targetPlayerId).emit('webrtc-candidate', {
      senderPlayerId: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('webrtc-stop', (data: { roomCode: string }) => {
    const room = getRoom(data.roomCode);
    if (!room || !room.sockets.has(socket.id)) return;

    io.to(data.roomCode).emit('webrtc-stopped', {
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
    io.to(code).emit('game-state-update', room.gameState);
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
        }

        if (room.hostSocketId === socket.id) {
          room.hostDisconnectedAt = Date.now();
        }
        room.emptySince = room.sockets.size === 0 ? Date.now() : null;

        io.to(code).emit('game-state-update', room.gameState);
      }
    }
  });
});

// Calculate tile destinations given dice roll step count (no immediate backtracking)
function calculateMoves(startTileId: number, steps: number, tiles: any[]): number[] {
  let paths: number[][] = [[startTileId]];

  for (let s = 0; s < steps; s++) {
    const nextPaths: number[][] = [];
    for (const p of paths) {
      const currentId = p[p.length - 1];
      const tile = tiles.find(t => t.id === currentId);
      if (tile && tile.nextTileIds) {
        for (const nid of tile.nextTileIds) {
          // Do not immediately reverse direction (backtrack to previous step tile)
          if (p.length > 1 && nid === p[p.length - 2]) continue;
          nextPaths.push([...p, nid]);
        }
      }
    }
    paths = nextPaths;
  }

  const destinationIds = Array.from(new Set(paths.map(p => p[p.length - 1])));
  return destinationIds.length > 0 ? destinationIds : [startTileId];
}

// Randomly shuffle question options so correct answer index is randomized
function shuffleQuestionOptions(q: Question): Question {
  const originalCorrectOption = q.options[q.correctAnswerIndex];
  const shuffledOptions = [...q.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
  return {
    ...q,
    options: shuffledOptions,
    correctAnswerIndex: newCorrectIndex
  };
}

// Pick question from pool or DB matching category & player difficulty randomly (Game Consistency Agent)
function pickQuestionForPlayer(state: GameState, targetCategoryId: CategoryId, playerDifficulty: DifficultyLevel): Question {
  const activeCustomTheme = state.settings.customThemePackName;
  const targetCategory = normalizeCategoryId(targetCategoryId);

  // 1. If an active AI theme pack filter is selected, prioritize unused questions from that theme pack
  if (activeCustomTheme) {
    const customPackUnused = state.questionsPool.filter(q => 
      q.themePack && q.themePack.toLowerCase().trim() === activeCustomTheme.toLowerCase().trim() &&
      !state.usedQuestionIds.includes(q.id)
    );

    if (customPackUnused.length > 0) {
      const catMatches = customPackUnused.filter(q => normalizeCategoryId(q.categoryId) === targetCategory);
      let selected: Question;

      if (catMatches.length > 0) {
        const diffMatches = catMatches.filter(q => q.difficulty === playerDifficulty);
        selected = diffMatches.length > 0
          ? diffMatches[Math.floor(Math.random() * diffMatches.length)]
          : catMatches[Math.floor(Math.random() * catMatches.length)];
      } else {
        const diffMatches = customPackUnused.filter(q => q.difficulty === playerDifficulty);
        selected = diffMatches.length > 0
          ? diffMatches[Math.floor(Math.random() * diffMatches.length)]
          : customPackUnused[Math.floor(Math.random() * customPackUnused.length)];
      }

      state.usedQuestionIds.push(selected.id);
      return shuffleQuestionOptions({ ...selected, categoryId: targetCategory });
    }
  }

  // 2. Standard Pool Selection (Search unused questions from questionsPool matching targetCategory)
  let candidates = state.questionsPool.filter(q => 
    normalizeCategoryId(q.categoryId) === targetCategory && 
    !state.usedQuestionIds.includes(q.id)
  );

  // If no unused question for targetCategory, try to find any unused question in questionsPool
  if (candidates.length === 0) {
    const allUnused = state.questionsPool.filter(q => !state.usedQuestionIds.includes(q.id));
    if (allUnused.length > 0) {
      candidates = allUnused;
    } else {
      // Entire pool exhausted: reset usedQuestionIds to restart a fresh cycle
      state.usedQuestionIds = [];
      candidates = state.questionsPool.filter(q => normalizeCategoryId(q.categoryId) === targetCategory);
      if (candidates.length === 0) candidates = state.questionsPool;
    }
  }

  // Filter by player difficulty if matching questions exist
  const diffMatches = candidates.filter(q => q.difficulty === playerDifficulty);
  const selected = diffMatches.length > 0
    ? diffMatches[Math.floor(Math.random() * diffMatches.length)]
    : candidates[Math.floor(Math.random() * candidates.length)];

  state.usedQuestionIds.push(selected.id);

  // Maintain question's category or align with targetCategory
  const finalCategory = selected.categoryId ? normalizeCategoryId(selected.categoryId) : targetCategory;
  return shuffleQuestionOptions({ ...selected, categoryId: finalCategory });
}

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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Serveur Trivial Pursuit Famille en ligne sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
