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
  // Le Joker camembert transforme n'importe quelle case en case camembert le
  // temps d'une bonne réponse : le joueur décroche un camembert là où il ne
  // gagnerait normalement que le droit de rejouer.
  const jokerActive = state.activeQuestionBonus?.type === 'camembert_joker'
    && state.activeQuestionBonus.playerId === activePlayer.id;
  const isCamembertTile = tile?.type === 'camembert' || tile?.isCamembert;
  let earnedWedge: CategoryId | null = null;
  if (isCorrect && (isCamembertTile || jokerActive)) {
    const category = tile?.categoryId || question.categoryId;
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

  // La roue surprise est un rituel d'avant-question. Une fois la réponse
  // résolue, elle n'a plus lieu d'être : on éteint le drapeau ici, et non
  // seulement au tour suivant (`advanceTurn`). Sinon la phase « evaluating »
  // remonte un nouveau modal (état local réinitialisé) qui, voyant encore
  // `surpriseSpinThisTurn` vrai, relançait la roue une seconde fois.
  state.surpriseSpinThisTurn = false;

  state.lastAnswerResult = {
    playerId: activePlayer.id,
    isCorrect,
    selectedOption: optionIndex,
    earnedWedge,
  };

  return { isCorrect, isWinner, earnedWedge };
}

export function advanceTurn(state: GameState): void {
  // On capture le résumé de la carte avant de l'effacer : il reste affiché sur le
  // plateau jusqu'à ce que la carte suivante soit tirée, pour que la table ait le
  // temps de lire le « Le saviez-vous ? » même si un autre joueur a déjà cliqué.
  state.lastQuestionRecap = buildQuestionRecap(state);

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
  state.surpriseSpinThisTurn = false;
  state.activeQuestionBonus = null;
}

/**
 * Remet la table à zéro pour une nouvelle manche, en gardant les joueurs, les
 * réglages et les paquets de thèmes.
 *
 * `start-game` ne réinitialisait que le réservoir de questions : ni les
 * camemberts, ni les pions, ni les scores, ni les bonus. Rejouer après une
 * victoire repartait donc avec le vainqueur détenant déjà tous ses camemberts,
 * prêt à gagner au premier passage par le centre.
 *
 * La phase n'est pas fixée ici : l'appelant décide s'il repart vers le lobby ou
 * vers une nouvelle partie.
 */
export function resetGameForNewRound(state: GameState): void {
  state.activePlayerIndex = 0;
  state.diceValue = null;
  state.possibleMoves = [];
  state.selectedTileId = null;
  state.currentQuestion = null;
  state.questionStartTime = null;
  state.lastAnswerResult = null;
  state.winnerId = null;
  state.lastTurnEventMessage = null;
  state.usedQuestionIds = [];
  state.bonusAwardedThisTurn = null;
  state.surpriseSpinThisTurn = false;
  state.activeQuestionBonus = null;
  state.firstPlayerDraw = null;
  state.lastQuestionRecap = null;
  state.isPaused = false;
  state.pausedAt = null;

  for (const player of state.players) {
    player.wedges = [];
    player.currentTileId = 0;
    player.score = 0;
    player.correctAnswersCount = 0;
    player.totalAnswersCount = 0;
    player.bonuses = {};
  }
}

/**
 * Retire un joueur de la partie en cours et rend la main proprement.
 *
 * Le retrait est plus délicat qu'une simple suppression du tableau, parce que le
 * partant peut être celui dont c'est le tour. Sa carte est alors à l'écran et
 * c'est lui, et lui seul, que le serveur autorise à répondre : si l'on se
 * contentait de l'effacer, la table resterait devant une question que plus
 * personne ne peut trancher, sans bouton pour avancer. On repart donc d'un tour
 * neuf, exactement comme `advanceTurn`, mais sans incrémenter : après la
 * suppression, le même index désigne déjà le joueur suivant.
 *
 * Renvoie `false` si le joueur est introuvable.
 */
export function removePlayerFromGame(state: GameState, playerId: string): boolean {
  const index = state.players.findIndex((player) => player.id === playerId);
  if (index < 0) return false;

  const wasActive = index === state.activePlayerIndex;
  state.players.splice(index, 1);

  if (state.players.length === 0) {
    state.activePlayerIndex = 0;
    return true;
  }

  if (index < state.activePlayerIndex) {
    // Un départ devant le joueur actif décale toute la table d'un cran.
    state.activePlayerIndex -= 1;
  } else if (state.activePlayerIndex >= state.players.length) {
    state.activePlayerIndex = 0;
  }

  if (wasActive && state.phase !== 'lobby' && state.phase !== 'game_over') {
    state.phase = 'rolling';
    state.diceValue = null;
    state.possibleMoves = [];
    state.selectedTileId = null;
    state.currentQuestion = null;
    state.questionStartTime = null;
    state.lastAnswerResult = null;
    state.bonusAwardedThisTurn = null;
    state.surpriseSpinThisTurn = false;
    state.activeQuestionBonus = null;
  }

  return true;
}

/** Résumé de la carte en cours, tel qu'il survivra au changement de tour. */
function buildQuestionRecap(state: GameState): GameState['lastQuestionRecap'] {
  const question = state.currentQuestion;
  if (!question) return null;

  // Lecture prudente : un résumé purement informatif ne doit jamais faire tomber
  // un tour. Une carte tronquée — options absentes, index hors bornes — donne un
  // rappel vide plutôt qu'une exception au changement de joueur.
  const answer = (question.format ?? 'mcq') === 'open'
    ? question.answer ?? ''
    : question.options?.[question.correctAnswerIndex] ?? '';
  const answeringPlayer = state.players.find(
    (player) => player.id === state.lastAnswerResult?.playerId,
  ) ?? state.players[state.activePlayerIndex];

  return {
    categoryId: question.categoryId,
    question: question.question,
    answer,
    explanation: question.explanation,
    playerName: answeringPlayer?.name ?? '',
    isCorrect: state.lastAnswerResult?.isCorrect ?? false,
  };
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
