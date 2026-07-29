import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createOpeningRoll,
  openingContenders,
  openingRollStandings,
  pendingRollerId,
  pruneOpeningRoll,
  recordOpeningRoll,
  remapOpeningRollId,
  settleOpeningRoll,
  unblockOpeningRoll,
} from '../src/server/openingRoll';

const seats = (count: number, disconnected: string[] = []) =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    isConnected: !disconnected.includes(`p${index}`),
  }));

const rollAll = (state: ReturnType<typeof createOpeningRoll>, values: Record<string, number>) => {
  for (const [id, value] of Object.entries(values)) recordOpeningRoll(state, id, value);
  return settleOpeningRoll(state);
};

test('the highest roll opens the game', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  assert.equal(rollAll(state, { p0: 2, p1: 5, p2: 3 }), 'won');
  assert.equal(state.winnerId, 'p1');
});

test('nothing is settled until every contender has rolled', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  assert.equal(rollAll(state, { p0: 6, p1: 1 }), 'waiting');
  assert.equal(state.winnerId, null);
  assert.equal(pendingRollerId(state), 'p2');
});

test('a tie is replayed by the tied players only', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  assert.equal(rollAll(state, { p0: 6, p1: 6, p2: 2 }), 'tie');
  assert.deepEqual(state.contenders, ['p0', 'p1']);
  assert.deepEqual(state.tiedIds, ['p0', 'p1']);
  assert.deepEqual(state.rolls, {});
  assert.equal(state.round, 2);

  assert.equal(rollAll(state, { p0: 3, p1: 4 }), 'won');
  assert.equal(state.winnerId, 'p1');
});

test('ties chain over as many rounds as needed', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  assert.equal(rollAll(state, { p0: 4, p1: 4 }), 'tie');
  assert.equal(rollAll(state, { p0: 2, p1: 2 }), 'tie');
  assert.equal(state.round, 3);
  assert.equal(rollAll(state, { p0: 5, p1: 1 }), 'won');
  assert.equal(state.winnerId, 'p0');
});

test('a second tap never buys a player a better roll', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  assert.equal(recordOpeningRoll(state, 'p0', 1), true);
  assert.equal(recordOpeningRoll(state, 'p0', 6), false);
  assert.equal(state.rolls.p0, 1);
});

test('a player outside the round cannot roll', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  assert.equal(recordOpeningRoll(state, 'p9', 6), false);
  assert.equal('p9' in state.rolls, false);
});

test('a winner is never overwritten by a late roll', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  rollAll(state, { p0: 6, p1: 1 });
  assert.equal(state.winnerId, 'p0');
  assert.equal(recordOpeningRoll(state, 'p1', 6), false);
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p0');
});

test('a player who leaves mid-roll cannot freeze the game', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  recordOpeningRoll(state, 'p0', 3);
  recordOpeningRoll(state, 'p1', 5);
  // p2 left before rolling: the round must still be able to conclude.
  assert.equal(settleOpeningRoll(state), 'waiting');
  pruneOpeningRoll(state, id => id !== 'p2');
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p1');
});

test('the last player standing opens the game with their own roll', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  recordOpeningRoll(state, 'p0', 2);
  pruneOpeningRoll(state, id => id === 'p0');
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p0');
});

test('an empty room keeps the roll intact until players come back', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  recordOpeningRoll(state, 'p0', 4);
  pruneOpeningRoll(state, () => false);
  assert.deepEqual(state.contenders, ['p0', 'p1']);
  assert.equal(state.rolls.p0, 4);
  assert.equal(settleOpeningRoll(state), 'waiting');
});

test('online play only rolls for connected seats, pass & play for all of them', () => {
  const table = seats(3, ['p1']);
  assert.deepEqual(openingContenders(table, false), ['p0', 'p2']);
  assert.deepEqual(openingContenders(table, true), ['p0', 'p1', 'p2']);
});

test('the standings list the best roll first and the pending seats last', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  recordOpeningRoll(state, 'p0', 3);
  recordOpeningRoll(state, 'p2', 6);
  assert.deepEqual(openingRollStandings(state), [
    { playerId: 'p2', roll: 6 },
    { playerId: 'p0', roll: 3 },
    { playerId: 'p1', roll: null },
  ]);
});

test('a player who reconnects under a new id keeps their place and their roll', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  recordOpeningRoll(state, 'p0', 5);
  recordOpeningRoll(state, 'p1', 2);

  // The server reassigns player.id on reconnection, and iOS reconnects whenever
  // the tab goes to the background.
  remapOpeningRollId(state, 'p0', 'p0-bis');
  assert.deepEqual(state.contenders, ['p0-bis', 'p1', 'p2']);
  assert.equal(state.rolls['p0-bis'], 5);
  assert.equal('p0' in state.rolls, false);

  assert.equal(recordOpeningRoll(state, 'p2', 1), true);
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p0-bis');
});

test('reconnecting as the last awaited player still concludes the roll', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  recordOpeningRoll(state, 'p0', 3);
  // p1 refreshes before rolling: nobody else can trigger a prune, so the id
  // must follow or the opening roll deadlocks for good.
  remapOpeningRollId(state, 'p1', 'p1-bis');
  assert.equal(pendingRollerId(state), 'p1-bis');
  assert.equal(recordOpeningRoll(state, 'p1-bis', 6), true);
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p1-bis');
});

test('remapping carries the tie list and a decided winner', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  rollAll(state, { p0: 6, p1: 6, p2: 1 });
  assert.deepEqual(state.tiedIds, ['p0', 'p1']);
  remapOpeningRollId(state, 'p1', 'p1-bis');
  assert.deepEqual(state.tiedIds, ['p0', 'p1-bis']);
  assert.deepEqual(state.contenders, ['p0', 'p1-bis']);

  const settled = createOpeningRoll(['a', 'b']);
  rollAll(settled, { a: 6, b: 2 });
  remapOpeningRollId(settled, 'a', 'a-bis');
  assert.equal(settled.winnerId, 'a-bis');
});

test('a brief absence does not cost a player their place in the roll', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  recordOpeningRoll(state, 'p0', 4);
  // p1 dropped out, but p2 is present and still owes a roll: nothing to unblock,
  // so p1 keeps their slot long enough to come back.
  assert.equal(unblockOpeningRoll(state, id => id !== 'p1'), false);
  assert.deepEqual(state.contenders, ['p0', 'p1', 'p2']);

  remapOpeningRollId(state, 'p1', 'p1-bis');
  assert.equal(recordOpeningRoll(state, 'p1-bis', 6), true);
  recordOpeningRoll(state, 'p2', 2);
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p1-bis');
});

test('absent players are dropped once only they are holding the round up', () => {
  const state = createOpeningRoll(['p0', 'p1', 'p2']);
  recordOpeningRoll(state, 'p0', 3);
  recordOpeningRoll(state, 'p1', 5);
  // Everyone still pending is gone: the round has to be able to finish.
  assert.equal(unblockOpeningRoll(state, id => id !== 'p2'), true);
  assert.deepEqual(state.contenders, ['p0', 'p1']);
  assert.equal(settleOpeningRoll(state), 'won');
  assert.equal(state.winnerId, 'p1');
});

test('nothing is dropped once the round is already complete', () => {
  const state = createOpeningRoll(['p0', 'p1']);
  rollAll(state, { p0: 6, p1: 2 });
  assert.equal(unblockOpeningRoll(state, () => false), false);
  assert.equal(state.winnerId, 'p0');
});
