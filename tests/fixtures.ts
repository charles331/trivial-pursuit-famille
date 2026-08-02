import {
  BoardConfig,
  GameSettings,
  GameState,
  Player,
  Question,
} from '../src/types';

export const testQuestion: Question = {
  id: 'q1',
  categoryId: 'histoire',
  question: 'Quelle est la bonne réponse ?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswerIndex: 1,
  explanation: 'Parce que B est la réponse attendue.',
  difficulty: 'adulte',
};

export const testSettings: GameSettings = {
  roomCode: 'FAM-TEST',
  boardType: 'wheel',
  selectedCategories: ['histoire', 'geographie', 'cinema', 'sciences'],
  timerSeconds: 30,
  wedgesToWin: 1,
  isLocalMode: false,
  isReaderMode: false,
  enableLiveCamera: false,
  enableBonuses: false,
};

export const testBoard: BoardConfig = {
  id: 'wheel',
  name: 'Test',
  description: 'Plateau minimal',
  suggestedDuration: '5 min',
  tiles: [
    { id: 0, type: 'hub', label: 'Centre', x: 0, y: 0, nextTileIds: [1] },
    {
      id: 1,
      type: 'camembert',
      categoryId: 'histoire',
      label: 'Histoire',
      x: 1,
      y: 0,
      nextTileIds: [0, 2],
      isCamembert: true,
    },
    { id: 2, type: 'category', categoryId: 'sciences', label: 'Sciences', x: 2, y: 0, nextTileIds: [1] },
  ],
};

export function createPlayer(id: string, isHost = false): Player {
  return {
    id,
    name: id,
    avatarId: 'lion',
    color: '#000000',
    difficulty: 'adulte',
    wedges: [],
    currentTileId: 1,
    isHost,
    isReady: true,
    score: 0,
    correctAnswersCount: 0,
    totalAnswersCount: 0,
    isConnected: true,
    bonuses: {},
  };
}

export function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    roomCode: testSettings.roomCode,
    phase: 'question',
    settings: { ...testSettings },
    players: [createPlayer('host', true), createPlayer('reader')],
    activePlayerIndex: 0,
    diceValue: 2,
    possibleMoves: [],
    selectedTileId: 1,
    currentQuestion: { ...testQuestion },
    questionStartTime: 1000,
    lastAnswerResult: null,
    winnerId: null,
    questionsPool: Array.from({ length: 5360 }, (_, index) => ({
      ...testQuestion,
      id: `q${index}`,
      question: `Question ${index}`,
    })),
    usedQuestionIds: ['q0'],
    customPacks: [{ name: 'Famille', questions: [{ ...testQuestion, id: 'custom-1' }] }],
    ...overrides,
  };
}
