import { BoardConfig, CategoryId, GameSettings, GameState } from '../types';

export function calculateMoves(startTileId: number, steps: number, board: BoardConfig): number[] {
  let paths: number[][] = [[startTileId]];

  for (let step = 0; step < steps; step += 1) {
    const nextPaths: number[][] = [];
    for (const currentPath of paths) {
      const currentId = currentPath[currentPath.length - 1];
      const tile = board.tiles.find(candidate => candidate.id === currentId);
      for (const nextId of tile?.nextTileIds ?? []) {
        if (currentPath.length > 1 && nextId === currentPath[currentPath.length - 2]) continue;
        nextPaths.push([...currentPath, nextId]);
      }
    }
    paths = nextPaths;
  }

  const destinations = [...new Set(paths.map(currentPath => currentPath[currentPath.length - 1]))];
  return destinations.length > 0 ? destinations : [startTileId];
}

export function resolveAnswer(
  state: GameState,
  settings: GameSettings,
  board: BoardConfig,
  optionIndex: number,
): { isCorrect: boolean; isWinner: boolean; earnedWedge: CategoryId | null } {
  const activePlayer = state.players[state.activePlayerIndex];
  const question = state.currentQuestion;
  if (!activePlayer || !question) {
    throw new Error('Impossible de résoudre une réponse sans joueur actif et question.');
  }

  const isCorrect = optionIndex === question.correctAnswerIndex;
  activePlayer.totalAnswersCount += 1;
  if (isCorrect) {
    activePlayer.correctAnswersCount += 1;
    activePlayer.score += 100;
  }

  const tile = board.tiles.find(candidate => candidate.id === activePlayer.currentTileId);
  let earnedWedge: CategoryId | null = null;
  if (isCorrect && (tile?.type === 'camembert' || tile?.isCamembert)) {
    const category = tile.categoryId || question.categoryId;
    if (!activePlayer.wedges.includes(category)) {
      activePlayer.wedges.push(category);
      earnedWedge = category;
    }
  }

  const isWinner = Boolean(
    isCorrect
    && tile?.type === 'hub'
    && activePlayer.wedges.length >= settings.wedgesToWin,
  );

  if (isWinner) {
    state.winnerId = activePlayer.id;
    state.phase = 'game_over';
  } else {
    state.phase = 'evaluating';
  }

  state.lastAnswerResult = {
    playerId: activePlayer.id,
    isCorrect,
    selectedOption: optionIndex,
    earnedWedge,
  };

  return { isCorrect, isWinner, earnedWedge };
}

export function advanceTurn(state: GameState): void {
  const earnedWedge = state.lastAnswerResult?.earnedWedge;
  if (!state.lastAnswerResult?.isCorrect || earnedWedge) {
    state.activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length;
    state.lastTurnEventMessage = null;
  } else {
    const activePlayer = state.players[state.activePlayerIndex];
    state.lastTurnEventMessage = `✨ Bonne réponse ! ${activePlayer?.name || 'Vous'} rejoue(z) !`;
  }

  state.phase = 'rolling';
  state.diceValue = null;
  state.possibleMoves = [];
  state.currentQuestion = null;
  state.lastAnswerResult = null;
  state.bonusAwardedThisTurn = null;
  state.activeQuestionBonus = null;
}

export function togglePauseState(state: GameState, now: number): void {
  if (state.isPaused) {
    const pausedFor = now - (state.pausedAt ?? now);
    if (state.questionStartTime) state.questionStartTime += pausedFor;
    state.isPaused = false;
    state.pausedAt = null;
    state.lastTurnEventMessage = 'La partie reprend !';
    return;
  }

  state.isPaused = true;
  state.pausedAt = now;
  state.lastTurnEventMessage = 'Partie en pause.';
}
