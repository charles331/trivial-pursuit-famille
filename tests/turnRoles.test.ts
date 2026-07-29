import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isCardReadAloud,
  resolveLiveRole,
  resolveOnAirIds,
  resolveReaderId,
  resolveReaderIndex,
} from '../src/server/turnRoles';
import { testSettings } from './fixtures';

const table = (count: number, disconnected: string[] = []) =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    isConnected: !disconnected.includes(`p${index}`),
  }));

test('the reader is the player seated just before the one being questioned', () => {
  const players = table(4);
  assert.equal(resolveReaderIndex(players, 2), 1);
  assert.equal(resolveReaderId(players, 2), 'p1');
});

test('the reader wraps around to the last seat for the first player', () => {
  assert.equal(resolveReaderId(table(4), 0), 'p3');
});

test('a disconnected reader hands the card to the next one further back', () => {
  // p3 dropped out: without this, p0 would face a masked card nobody can read.
  assert.equal(resolveReaderId(table(4, ['p3']), 0), 'p2');
  assert.equal(resolveReaderId(table(4, ['p3', 'p2']), 0), 'p1');
});

test('nobody reads when no other player is connected', () => {
  assert.equal(resolveReaderId(table(1), 0), null);
  assert.equal(resolveReaderId(table(3, ['p0', 'p1']), 2), null);
  assert.equal(resolveReaderIndex(table(4), 9), null);
});

test('the two players on air are the answerer and their reader', () => {
  assert.deepEqual(resolveOnAirIds(table(4), 2), ['p2', 'p1']);
  assert.deepEqual(resolveOnAirIds(table(1), 0), ['p0']);
});

test('every other player is a spectator', () => {
  const players = table(4);
  assert.equal(resolveLiveRole(players, 2, 'p2'), 'answerer');
  assert.equal(resolveLiveRole(players, 2, 'p1'), 'reader');
  assert.equal(resolveLiveRole(players, 2, 'p0'), 'spectator');
  assert.equal(resolveLiveRole(players, 2, 'p3'), 'spectator');
  assert.equal(resolveLiveRole(players, 2, undefined), 'spectator');
});

test('answering wins over reading, so a lone player never gets the solution', () => {
  assert.equal(resolveLiveRole(table(2), 0, 'p0'), 'answerer');
});

test('the live duo implies the card is read out loud', () => {
  assert.equal(isCardReadAloud(testSettings), false);
  assert.equal(isCardReadAloud({ ...testSettings, isReaderMode: true }), true);
  // Opening the reader's microphone only makes sense for a masked card.
  assert.equal(isCardReadAloud({ ...testSettings, enableLiveCamera: true }), true);
});
