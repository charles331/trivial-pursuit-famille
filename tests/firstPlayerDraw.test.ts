import assert from 'node:assert/strict';
import test from 'node:test';
import {
  beginFirstPlayerDraw,
  describeFirstPlayerDraw,
  pendingRollers,
  purgeFirstPlayerRoll,
  rankFirstPlayerRolls,
  recordFirstPlayerRoll,
  settleFirstPlayerDraw,
  transferFirstPlayerRoll,
} from '../src/server/firstPlayerDraw';
import { createGameState, createPlayer } from './fixtures';

function drawState(playerIds: string[], isLocalMode = false) {
  const state = createGameState({
    players: playerIds.map((id, index) => createPlayer(id, index === 0)),
  });
  state.settings.isLocalMode = isLocalMode;
  beginFirstPlayerDraw(state, 1000);
  return state;
}

test('the draw opens with nobody designated and everyone still to roll', () => {
  const state = drawState(['host', 'ada', 'bob']);

  assert.equal(state.phase, 'first_player_roll');
  assert.equal(state.firstPlayerDraw?.winnerId, null);
  assert.deepEqual(pendingRollers(state).map(player => player.id), ['host', 'ada', 'bob']);
});

test('the highest roll opens the game, whoever created the room', () => {
  const state = drawState(['host', 'ada', 'bob']);

  recordFirstPlayerRoll(state, 'host', 2, 1500);
  recordFirstPlayerRoll(state, 'ada', 5, 1800);
  assert.equal(state.phase, 'first_player_roll', 'le tirage attend le dernier joueur');

  recordFirstPlayerRoll(state, 'bob', 3, 2000);
  assert.equal(settleFirstPlayerDraw(state), true);

  assert.equal(state.firstPlayerDraw?.winnerId, 'ada');
  assert.equal(state.activePlayerIndex, 1);
  assert.equal(state.phase, 'rolling');
  assert.equal(state.diceValue, null);
});

test('a tie is won by the fastest roll', () => {
  const state = drawState(['host', 'ada', 'bob']);

  recordFirstPlayerRoll(state, 'host', 6, 3400); // 2,4 s
  recordFirstPlayerRoll(state, 'ada', 6, 1600); // 0,6 s
  recordFirstPlayerRoll(state, 'bob', 6, 2000); // 1,0 s
  settleFirstPlayerDraw(state);

  assert.equal(state.firstPlayerDraw?.winnerId, 'ada');
  assert.match(describeFirstPlayerDraw(state), /Égalité à 6/);
  assert.match(describeFirstPlayerDraw(state), /0,6 s/);
});

test('an exact tie on both value and time falls back on who reached the server first', () => {
  const rolls = [
    { playerId: 'ada', value: 4, elapsedMs: 800, order: 1 },
    { playerId: 'host', value: 4, elapsedMs: 800, order: 0 },
  ];

  assert.equal(rankFirstPlayerRolls(rolls)[0].playerId, 'host');
});

test('nobody rolls twice', () => {
  const state = drawState(['host', 'ada']);

  assert.equal(recordFirstPlayerRoll(state, 'host', 1, 1200), true);
  assert.equal(recordFirstPlayerRoll(state, 'host', 6, 1300), false);
  assert.equal(state.firstPlayerDraw?.rolls.length, 1);
  assert.equal(state.firstPlayerDraw?.rolls[0].value, 1);
});

test('the draw stays open until every expected player has rolled', () => {
  const state = drawState(['host', 'ada']);

  recordFirstPlayerRoll(state, 'host', 4, 1400);
  assert.equal(settleFirstPlayerDraw(state), false);
  assert.equal(state.phase, 'first_player_roll');

  recordFirstPlayerRoll(state, 'ada', 2, 1900);
  assert.equal(settleFirstPlayerDraw(state), true);
  assert.equal(state.activePlayerIndex, 0);
});

test('reaction time is measured from the draw start when everyone rolls at once', () => {
  const state = drawState(['host', 'ada']);

  recordFirstPlayerRoll(state, 'host', 3, 2500);
  recordFirstPlayerRoll(state, 'ada', 3, 2800);

  assert.equal(state.firstPlayerDraw?.rolls[0].elapsedMs, 1500);
  assert.equal(state.firstPlayerDraw?.rolls[1].elapsedMs, 1800);
});

test('in pass & play each player is timed from the previous roll, not from the draw start', () => {
  const state = drawState(['host', 'ada'], true);

  recordFirstPlayerRoll(state, 'host', 3, 2500); // 1,5 s après l'ouverture
  recordFirstPlayerRoll(state, 'ada', 3, 2800); // 0,3 s après avoir reçu l'appareil
  settleFirstPlayerDraw(state);

  assert.equal(state.firstPlayerDraw?.rolls[0].elapsedMs, 1500);
  assert.equal(state.firstPlayerDraw?.rolls[1].elapsedMs, 300);
  assert.equal(state.firstPlayerDraw?.winnerId, 'ada', 'le second joueur a été le plus rapide');
});

test('a disconnected player is no longer awaited', () => {
  const state = drawState(['host', 'ada']);

  recordFirstPlayerRoll(state, 'host', 2, 1500);
  state.players[1].isConnected = false;

  assert.deepEqual(pendingRollers(state).map(player => player.id), []);
  assert.equal(settleFirstPlayerDraw(state), true);
  assert.equal(state.firstPlayerDraw?.winnerId, 'host');
});

test('a local pass & play player is awaited even in a room restored from disk', () => {
  const state = drawState(['host', 'local_1'], true);
  state.players.forEach(player => { player.isConnected = false; });

  assert.deepEqual(pendingRollers(state).map(player => player.id), ['local_1']);
});

test('the host can settle the draw without the missing players', () => {
  const state = drawState(['host', 'ada', 'bob']);

  recordFirstPlayerRoll(state, 'host', 1, 1500);
  recordFirstPlayerRoll(state, 'ada', 5, 1700);

  assert.equal(settleFirstPlayerDraw(state), false);
  assert.equal(settleFirstPlayerDraw(state, { force: true }), true);
  assert.equal(state.firstPlayerDraw?.winnerId, 'ada');
});

test('an empty draw cannot be settled, even by force', () => {
  const state = drawState(['host', 'ada']);

  assert.equal(settleFirstPlayerDraw(state, { force: true }), false);
  assert.equal(state.phase, 'first_player_roll');
});

test('a settled draw is never re-settled', () => {
  const state = drawState(['host', 'ada']);

  recordFirstPlayerRoll(state, 'host', 6, 1200);
  recordFirstPlayerRoll(state, 'ada', 1, 1300);
  settleFirstPlayerDraw(state);

  assert.equal(recordFirstPlayerRoll(state, 'ada', 6, 1400), false);
  assert.equal(settleFirstPlayerDraw(state, { force: true }), false);
  assert.equal(state.firstPlayerDraw?.winnerId, 'host');
});

test('a reconnecting player keeps the roll made under their previous socket', () => {
  const state = drawState(['host', 'ada']);

  recordFirstPlayerRoll(state, 'ada', 5, 1400);
  state.players[1].id = 'ada-2';
  transferFirstPlayerRoll(state, 'ada', 'ada-2');

  assert.deepEqual(pendingRollers(state).map(player => player.id), ['host']);
  assert.equal(state.firstPlayerDraw?.rolls[0].playerId, 'ada-2');
});

test('a player who leaves takes their roll out of the draw', () => {
  const state = drawState(['host', 'ada', 'bob']);

  recordFirstPlayerRoll(state, 'host', 2, 1500);
  recordFirstPlayerRoll(state, 'ada', 6, 1600);
  purgeFirstPlayerRoll(state, 'ada');
  state.players.splice(1, 1);

  recordFirstPlayerRoll(state, 'bob', 3, 1800);
  settleFirstPlayerDraw(state);

  assert.equal(state.firstPlayerDraw?.winnerId, 'bob');
  assert.equal(state.activePlayerIndex, 1);
});

test('the announcement names the winner and their roll', () => {
  const state = drawState(['host', 'ada']);

  recordFirstPlayerRoll(state, 'host', 6, 1500);
  recordFirstPlayerRoll(state, 'ada', 2, 1600);
  settleFirstPlayerDraw(state);

  assert.equal(state.lastTurnEventMessage, '🎲 Tirage au sort : host ouvre la partie avec un 6.');
});
