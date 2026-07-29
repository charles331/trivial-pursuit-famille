import { GameState, Question } from '../types';
import { isCardReadAloud, resolveReaderId } from './turnRoles';

export interface PublicQuestion extends Omit<Question, 'correctAnswerIndex' | 'explanation'> {
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface PublicGameState extends Omit<
  GameState,
  'currentQuestion' | 'questionsPool' | 'usedQuestionIds' | 'customPacks'
> {
  currentQuestion: PublicQuestion | null;
  customPacks?: Array<{ name: string; questionCount: number }>;
}

function isDesignatedReader(state: GameState, socketId: string, hostSocketId: string): boolean {
  if (!isCardReadAloud(state.settings) || state.players.length === 0) return false;
  if (state.settings.isLocalMode) return socketId === hostSocketId;

  return resolveReaderId(state.players, state.activePlayerIndex) === socketId;
}

/**
 * Builds the only representation of a game state that may leave the server.
 *
 * The full question pool is server-only. Before an answer is submitted, the
 * solution is also server-only, except for the designated reader.
 */
export function createGameStateView(
  state: GameState,
  socketId: string,
  hostSocketId: string,
): PublicGameState {
  const {
    questionsPool: _questionsPool,
    usedQuestionIds: _usedQuestionIds,
    customPacks,
    currentQuestion,
    ...publicState
  } = state;

  const maySeeSolution = state.phase !== 'question'
    || isDesignatedReader(state, socketId, hostSocketId);

  let publicQuestion: PublicQuestion | null = null;
  if (currentQuestion) {
    const { correctAnswerIndex, explanation, ...questionWithoutSolution } = currentQuestion;
    publicQuestion = maySeeSolution
      ? { ...questionWithoutSolution, correctAnswerIndex, explanation }
      : questionWithoutSolution;
  }

  return {
    ...publicState,
    currentQuestion: publicQuestion,
    customPacks: customPacks?.map(pack => ({
      name: pack.name,
      questionCount: pack.questions.length,
    })),
  };
}
