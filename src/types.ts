export type CategoryId = 
  | 'histoire'
  | 'geographie'
  | 'cinema'
  | 'sciences'
  | 'art'
  | 'sports'
  | 'popculture'
  | 'gastronomie';

export type DifficultyLevel = 'enfant' | 'ado' | 'adulte';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
  description: string;
}

export interface Question {
  id: string;
  categoryId: CategoryId;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  difficulty: DifficultyLevel;
  themePack?: string;
}

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  iconName: string;
  bgGradient: string;
}

export interface Player {
  id: string;
  name: string;
  avatarId: string;
  color: string;
  difficulty: DifficultyLevel;
  wedges: CategoryId[]; // Collected pie wedges
  currentTileId: number;
  isHost: boolean;
  isReady: boolean;
  score: number;
  correctAnswersCount: number;
  totalAnswersCount: number;
  isConnected: boolean;
}

export type BoardType = 'wheel' | 'snake' | 'star';

export type TileType = 'category' | 'camembert' | 'reroll' | 'hub' | 'surprise';

export interface BoardTile {
  id: number;
  type: TileType;
  categoryId?: CategoryId;
  label: string;
  x: number; // percentage 0-100 or relative SVG coordinate
  y: number;
  nextTileIds: number[];
  isCamembert?: boolean;
}

export interface BoardConfig {
  id: BoardType;
  name: string;
  description: string;
  tiles: BoardTile[];
  suggestedDuration: string;
  /** How the board is drawn: a radial wheel or a serpentine track. */
  layout?: 'radial' | 'grid';
}

export interface GameSettings {
  roomCode: string;
  boardType: BoardType;
  selectedCategories: CategoryId[];
  timerSeconds: number; // e.g. 30, 45, 0 (no timer)
  wedgesToWin: number; // default 6
  customThemePackName?: string;
  isLocalMode?: boolean; // pass & play on single device
  isReaderMode?: boolean; // Card Reader Mode: another player reads the card out loud
  enableLiveCamera?: boolean; // Live camera & mic spotlight during question turn
}

export type GamePhase = 
  | 'lobby'
  | 'rolling'
  | 'moving'
  | 'question'
  | 'evaluating'
  | 'turn_end'
  | 'game_over';

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  settings: GameSettings;
  players: Player[];
  activePlayerIndex: number;
  diceValue: number | null;
  possibleMoves: number[]; // tile IDs player can move to after roll
  selectedTileId: number | null;
  currentQuestion: Question | null;
  questionStartTime: number | null;
  lastAnswerResult: {
    playerId: string;
    isCorrect: boolean;
    selectedOption: number;
    earnedWedge: CategoryId | null;
  } | null;
  winnerId: string | null;
  questionsPool: Question[];
  usedQuestionIds: string[];
  customPacks?: { name: string; questions: Question[] }[];
  lastTurnEventMessage?: string | null;
}

export interface EmojiReaction {
  id: string;
  playerId: string;
  playerName: string;
  emoji: string;
  timestamp: number;
}

export interface GameLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'turn';
  timestamp: number;
}
