import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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

const PORT = 3000;

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
app.post('/api/generate-pack', async (req, res) => {
  try {
    const { themeName, count = 30 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: 'GEMINI_API_KEY non configurée.' });
    }

    if (!themeName || typeof themeName !== 'string') {
      return res.status(400).json({ error: 'Nom de thème requis.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Génère ${count} questions de quiz captivantes et amusantes en français sur le thème "${themeName}".
IMPORTANT : Répartis ces ${count} questions de manière équilibrée entre les différentes catégories du jeu (histoire, geographie, cinema, sciences, art, sports, popculture, gastronomie).

Format JSON strict exigé, sous forme de tableau d'objets JSON avec les propriétés suivantes :
[
  {
    "id": "gen_${Date.now()}_1",
    "categoryId": "cinema" (choisir impérativement parmi: histoire, geographie, cinema, sciences, art, sports, popculture, gastronomie),
    "question": "Texte de la question ?",
    "options": ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
    "correctAnswerIndex": 0,
    "explanation": "Le saviez-vous ? Explication courte et passionnante.",
    "difficulty": "adulte",
    "themePack": "${themeName}"
  }
]
Avertissement : Ne mets AUCUN texte d'introduction ni de conclusion, uniquement le tableau JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Réponse JSON invalide de Gemini');
    }

    const rawQuestions: any[] = JSON.parse(jsonMatch[0]);
    const generatedQuestions: Question[] = rawQuestions.map((q, idx) => ({
      id: `gen_${Date.now()}_${idx}`,
      categoryId: normalizeCategoryId(q.categoryId),
      question: q.question,
      options: q.options || ['A', 'B', 'C', 'D'],
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
      explanation: q.explanation || `Question tirée du thème ${themeName}`,
      difficulty: q.difficulty || 'adulte',
      themePack: themeName
    }));

    return res.json({ success: true, questions: generatedQuestions, themeName });
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
}

const rooms = new Map<string, Room>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FAM-${code}`;
}

// Socket.IO Connection Handler
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Connexion: ${socket.id}`);

  // Create Private Room
  socket.on('create-room', (data: { player: Partial<Player>; settings: Partial<GameSettings> }) => {
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
      isReady: true,
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
      isReaderMode: data.settings?.isReaderMode ?? false
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

    const room: Room = {
      code: roomCode,
      hostSocketId: socket.id,
      settings: initialSettings,
      gameState: initialGameState,
      sockets: new Map([[socket.id, hostPlayer]])
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);

    socket.emit('room-created', { roomCode, player: hostPlayer, gameState: initialGameState });
    console.log(`[Room] Salon créé: ${roomCode} par ${hostPlayer.name}`);
  });

  // Reconnect Existing Session (on page refresh or disconnect recovery)
  socket.on('reconnect-session', (data: { roomCode: string; playerId: string }) => {
    const code = (data.roomCode || '').toUpperCase().trim();
    const room = rooms.get(code);

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

    if (room.hostSocketId === oldSocketId) {
      room.hostSocketId = socket.id;
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
    const room = rooms.get(code);

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

      if (room.hostSocketId === oldId) {
        room.hostSocketId = socket.id;
        existingPlayer.isHost = true;
      }

      socket.join(code);
      socket.emit('room-joined', { roomCode: code, player: existingPlayer, gameState: room.gameState });
      io.to(code).emit('game-state-update', room.gameState);
      console.log(`[Room] ${existingPlayer.name} a réintégré le salon ${code}`);
      return;
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
      isReady: true,
      score: 0,
      correctAnswersCount: 0,
      totalAnswersCount: 0,
      isConnected: true
    };

    room.sockets.set(socket.id, newPlayer);
    room.gameState.players.push(newPlayer);
    socket.join(code);

    socket.emit('room-joined', { roomCode: code, player: newPlayer, gameState: room.gameState });
    io.to(code).emit('game-state-update', room.gameState);
    console.log(`[Room] ${newPlayer.name} a rejoint le salon ${code}`);
  });

  // Local Pass & Play Add Player
  socket.on('add-local-player', (data: { roomCode: string; player: Partial<Player> }) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;

    const newPlayer: Player = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: data.player.name || `Joueur ${room.gameState.players.length + 1}`,
      avatarId: data.player.avatarId || 'robot',
      color: data.player.color || '#10B981',
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

  // Update Settings (Host only)
  socket.on('update-settings', (data: { roomCode: string; settings: Partial<GameSettings> }) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    room.settings = { ...room.settings, ...data.settings };
    room.gameState.settings = room.settings;

    io.to(data.roomCode).emit('game-state-update', room.gameState);
  });

  // Update Player Profile (Avatar, Color, Name, Difficulty)
  socket.on('update-player', (data: { roomCode: string; player: Partial<Player> }) => {
    const room = rooms.get(data.roomCode);
    if (!room) return;

    const p = room.gameState.players.find(pl => pl.id === socket.id || pl.id === data.player.id);
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
    const room = rooms.get(data.roomCode);
    if (!room) return;

    if (!room.gameState.customPacks) {
      room.gameState.customPacks = [];
    }

    const existingIndex = room.gameState.customPacks.findIndex(
      p => p.name.toLowerCase().trim() === data.themeName.toLowerCase().trim()
    );

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
    const room = rooms.get(data.roomCode);
    if (!room) return;

    if (room.gameState.players.length < 1) {
      return socket.emit('error-msg', 'Il faut au moins 1 joueur pour commencer.');
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

  // Roll Dice
  socket.on('roll-dice', (data: { roomCode: string }) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.phase !== 'rolling') return;

    if (!isPlayerAllowedToAct(room, socket.id)) {
      console.warn(`[Roll Rejected] Socket ${socket.id} is not active player ${room.gameState.players[room.gameState.activePlayerIndex]?.id}`);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    room.gameState.diceValue = dice;
    room.gameState.phase = 'moving';

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
    const room = rooms.get(data.roomCode);
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
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.phase !== 'question' || !room.gameState.currentQuestion) return;

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
    const room = rooms.get(data.roomCode);
    if (!room || room.gameState.phase === 'game_over') return;

    // Guardrail: next-turn CAN ONLY BE EXECUTED when phase is evaluating or question
    if (room.gameState.phase !== 'evaluating' && room.gameState.phase !== 'question') {
      console.warn(`[NextTurn Rejected] Cannot trigger next-turn from phase "${room.gameState.phase}"`);
      return;
    }

    const lastResult = room.gameState.lastAnswerResult;
    // If answer was correct, player gets to roll again! If wrong, next player's turn.
    if (!lastResult?.isCorrect) {
      room.gameState.activePlayerIndex = (room.gameState.activePlayerIndex + 1) % room.gameState.players.length;
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
    const room = rooms.get(data.roomCode);
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

        // If host disconnected, transfer host
        if (room.hostSocketId === socket.id) {
          const remainingConnected = room.gameState.players.find(pl => pl.isConnected && !pl.id.startsWith('local_'));
          if (remainingConnected) {
            room.hostSocketId = remainingConnected.id;
            remainingConnected.isHost = true;
          }
        }

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
