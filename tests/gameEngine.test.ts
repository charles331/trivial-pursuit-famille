import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceTurn,
  calculateMoves,
  removePlayerFromGame,
  resolveAnswer,
  togglePauseState,
} from '../src/server/gameEngine';
import { createGameState, createPlayer, testBoard, testSettings } from './fixtures';

test('movement follows the board without immediate backtracking', () => {
  assert.deepEqual(calculateMoves(0, 2, testBoard), [2]);
  assert.deepEqual(calculateMoves(2, 6, testBoard), [2]);
});

test('a correct camembert answer updates score and awards one wedge', () => {
  const state = createGameState();
  const result = resolveAnswer(state, testSettings, testBoard, 1);

  assert.equal(result.isCorrect, true);
  assert.equal(result.earnedWedge, 'histoire');
  assert.deepEqual(state.players[0].wedges, ['histoire']);
  assert.equal(state.players[0].score, 100);
  assert.equal(state.phase, 'evaluating');

  state.phase = 'question';
  state.lastAnswerResult = null;
  resolveAnswer(state, testSettings, testBoard, 1);
  assert.deepEqual(state.players[0].wedges, ['histoire']);
});

test('resolving an answer turns off the surprise wheel flag', () => {
  // La roue surprise ne doit pas se relancer une fois la question tranchée :
  // le drapeau tombe dès la résolution, sans attendre le tour suivant, pour que
  // la phase « evaluating » ne réaffiche jamais la roue.
  const state = createGameState({ surpriseSpinThisTurn: true, bonusAwardedThisTurn: 'fifty_fifty' });
  resolveAnswer(state, testSettings, testBoard, 1);

  assert.equal(state.phase, 'evaluating');
  assert.equal(state.surpriseSpinThisTurn, false);
});

test('a wrong answer advances to the next player', () => {
  const state = createGameState({
    bonusAwardedThisTurn: 'fifty_fifty',
    activeQuestionBonus: {
      type: 'fifty_fifty',
      playerId: 'host',
      hiddenOptionIndexes: [0, 2],
    },
  });
  resolveAnswer(state, testSettings, testBoard, 0);
  advanceTurn(state);

  assert.equal(state.activePlayerIndex, 1);
  assert.equal(state.phase, 'rolling');
  assert.equal(state.currentQuestion, null);
  assert.equal(state.bonusAwardedThisTurn, null);
  assert.equal(state.activeQuestionBonus, null);
});

test('winning a camembert passes the turn to the next player', () => {
  const state = createGameState();
  resolveAnswer(state, testSettings, testBoard, 1);
  advanceTurn(state);

  assert.equal(state.activePlayerIndex, 1);
  assert.equal(state.phase, 'rolling');
});

test('a correct answer on a regular tile grants an extra turn', () => {
  const state = createGameState();
  state.players[0].currentTileId = 2;
  resolveAnswer(state, testSettings, testBoard, 1);
  advanceTurn(state);

  assert.equal(state.activePlayerIndex, 0);
  assert.equal(state.phase, 'rolling');
});

test('the camembert joker earns a wedge on a regular tile', () => {
  const state = createGameState();
  state.players[0].currentTileId = 2; // case Sciences, sans camembert
  state.activeQuestionBonus = {
    type: 'camembert_joker', playerId: state.players[0].id, hiddenOptionIndexes: [],
  };

  const result = resolveAnswer(state, testSettings, testBoard, 1);

  assert.equal(result.isCorrect, true);
  assert.equal(result.earnedWedge, 'sciences');
  assert.deepEqual(state.players[0].wedges, ['sciences']);
});

test('the joker does nothing on a wrong answer', () => {
  const state = createGameState();
  state.players[0].currentTileId = 2;
  state.activeQuestionBonus = {
    type: 'camembert_joker', playerId: state.players[0].id, hiddenOptionIndexes: [],
  };

  const result = resolveAnswer(state, testSettings, testBoard, 0);

  assert.equal(result.isCorrect, false);
  assert.equal(result.earnedWedge, null);
  assert.deepEqual(state.players[0].wedges, []);
});

test('a correct answer on an already-owned camembert grants an extra turn', () => {
  const state = createGameState();
  state.players[0].wedges = ['histoire'];
  resolveAnswer(state, testSettings, testBoard, 1);
  advanceTurn(state);

  assert.equal(state.activePlayerIndex, 0);
  assert.equal(state.phase, 'rolling');
});

test('a correct hub answer wins once the required wedges are owned', () => {
  const state = createGameState();
  state.players[0].currentTileId = 0;
  state.players[0].wedges = ['histoire'];
  const result = resolveAnswer(state, testSettings, testBoard, 1);

  assert.equal(result.isWinner, true);
  assert.equal(state.phase, 'game_over');
  assert.equal(state.winnerId, 'host');
});

test('pause and resume preserve the remaining question time', () => {
  const state = createGameState({ questionStartTime: 1000 });
  togglePauseState(state, 5000);
  assert.equal(state.isPaused, true);
  assert.equal(state.pausedAt, 5000);

  togglePauseState(state, 9000);
  assert.equal(state.isPaused, false);
  assert.equal(state.pausedAt, null);
  assert.equal(state.questionStartTime, 5000);
});

// --- Retrait d'un joueur en cours de partie ---------------------------------
// Un enfant qui va se coucher laissait jusqu'ici un pion inerte qui prenait son
// tour à chaque passage : rien ne permettait de le retirer d'une partie lancée.

test('removing a player closes the table around the survivors', () => {
  const state = createGameState({
    players: [createPlayer('papa', true), createPlayer('olivia'), createPlayer('mamie')],
    activePlayerIndex: 0,
  });

  assert.equal(removePlayerFromGame(state, 'olivia'), true);
  assert.deepEqual(state.players.map((player) => player.id), ['papa', 'mamie']);
  // Le départ est derrière le joueur actif : son index ne bouge pas.
  assert.equal(state.activePlayerIndex, 0);
  assert.equal(removePlayerFromGame(state, 'inconnu'), false);
});

test('a departure ahead of the active player shifts the whole table', () => {
  const state = createGameState({
    players: [createPlayer('papa', true), createPlayer('olivia'), createPlayer('mamie')],
    activePlayerIndex: 2,
  });

  removePlayerFromGame(state, 'papa');
  // Mamie était en troisième position, elle est désormais en deuxième : c'est
  // toujours son tour, et pas celui d'Olivia.
  assert.equal(state.players[state.activePlayerIndex].id, 'mamie');
});

test('removing the player whose turn it is hands the game back instead of locking it', () => {
  // Le cas qui bloquait la partie : sa carte est à l'écran et lui seul est
  // autorisé à répondre. L'effacer sans rien faire laissait la table devant une
  // question que personne ne pouvait plus trancher.
  const state = createGameState({
    players: [createPlayer('papa', true), createPlayer('olivia'), createPlayer('mamie')],
    activePlayerIndex: 1,
    phase: 'question',
    surpriseSpinThisTurn: true,
    bonusAwardedThisTurn: 'fifty_fifty',
  });

  removePlayerFromGame(state, 'olivia');

  assert.equal(state.phase, 'rolling');
  assert.equal(state.currentQuestion, null);
  assert.equal(state.lastAnswerResult, null);
  assert.equal(state.questionStartTime, null);
  assert.equal(state.surpriseSpinThisTurn, false);
  assert.equal(state.bonusAwardedThisTurn, null);
  assert.equal(state.activeQuestionBonus, null);
  // Après la suppression, le même index désigne déjà le joueur suivant.
  assert.equal(state.players[state.activePlayerIndex].id, 'mamie');
});

test('removing the last player in the list wraps the turn back to the first', () => {
  const state = createGameState({
    players: [createPlayer('papa', true), createPlayer('olivia')],
    activePlayerIndex: 1,
    phase: 'question',
  });

  removePlayerFromGame(state, 'olivia');
  assert.equal(state.players.length, 1);
  assert.equal(state.activePlayerIndex, 0);
  assert.equal(state.phase, 'rolling');
});
