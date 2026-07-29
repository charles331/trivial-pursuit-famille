import assert from 'node:assert/strict';
import test from 'node:test';
import { createGameStateView } from '../src/server/gameStateView';
import { createGameState } from './fixtures';

test('the public state never contains the question pool or used IDs', () => {
  const view = createGameStateView(createGameState(), 'host', 'host');
  assert.equal('questionsPool' in view, false);
  assert.equal('usedQuestionIds' in view, false);
  assert.deepEqual(view.customPacks, [{ name: 'Famille', questionCount: 1 }]);
  assert.ok(Buffer.byteLength(JSON.stringify(view)) < 5000);
});

test('the solution is hidden from active player and spectators before validation', () => {
  const state = createGameState();
  const activeView = createGameStateView(state, 'host', 'host');
  const spectatorView = createGameStateView(state, 'spectator', 'host');

  for (const view of [activeView, spectatorView]) {
    assert.equal(view.currentQuestion?.correctAnswerIndex, undefined);
    assert.equal(view.currentQuestion?.explanation, undefined);
  }
});

test('only the designated reader sees the solution while the question is live', () => {
  const state = createGameState({
    settings: {
      ...createGameState().settings,
      isReaderMode: true,
    },
  });

  const readerView = createGameStateView(state, 'reader', 'host');
  const activeView = createGameStateView(state, 'host', 'host');
  assert.equal(readerView.currentQuestion?.correctAnswerIndex, 1);
  assert.match(readerView.currentQuestion?.explanation ?? '', /réponse attendue/);
  assert.equal(activeView.currentQuestion?.correctAnswerIndex, undefined);
});

test('the solution is revealed to everyone after validation', () => {
  const state = createGameState({ phase: 'evaluating' });
  const view = createGameStateView(state, 'spectator', 'host');
  assert.equal(view.currentQuestion?.correctAnswerIndex, 1);
  assert.ok(view.currentQuestion?.explanation);
});

test('reader mode does not reveal the solution to a lone online player', () => {
  const state = createGameState();
  state.players = [state.players[0]];
  state.settings = { ...state.settings, isReaderMode: true, isLocalMode: false };
  const view = createGameStateView(state, 'host', 'host');
  assert.equal(view.currentQuestion?.correctAnswerIndex, undefined);
});
