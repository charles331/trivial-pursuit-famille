import assert from 'node:assert/strict';
import test from 'node:test';
import {
  awardSurpriseBonus,
  fiftyFiftyCount,
  useFiftyFiftyBonus,
} from '../src/server/bonuses';
import { createGameState } from './fixtures';

test('bonus mode is opt-in and surprise tiles do nothing while disabled', () => {
  const state = createGameState();

  assert.equal(awardSurpriseBonus(state), false);
  assert.equal(fiftyFiftyCount(state.players[0]), 0);
  assert.equal(state.bonusAwardedThisTurn, undefined);
});

test('each surprise landing adds a stored 50/50 to the active player', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;

  assert.equal(awardSurpriseBonus(state), true);
  assert.equal(awardSurpriseBonus(state), true);
  assert.equal(fiftyFiftyCount(state.players[0]), 2);
  assert.equal(state.bonusAwardedThisTurn, 'fifty_fifty');
  assert.equal(fiftyFiftyCount(state.players[1]), 0);
});

test('50/50 consumes one bonus and hides exactly two wrong answers', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { fifty_fifty: 2 };

  assert.equal(useFiftyFiftyBonus(state, () => 0), true);
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
  assert.equal(state.activeQuestionBonus?.type, 'fifty_fifty');
  assert.equal(state.activeQuestionBonus?.hiddenOptionIndexes.length, 2);
  assert.equal(
    state.activeQuestionBonus?.hiddenOptionIndexes.includes(state.currentQuestion!.correctAnswerIndex),
    false,
  );
});

test('a 50/50 cannot be reused on the same question or without inventory', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { fifty_fifty: 1 };

  assert.equal(useFiftyFiftyBonus(state), true);
  assert.equal(useFiftyFiftyBonus(state), false);
  assert.equal(fiftyFiftyCount(state.players[0]), 0);

  state.activeQuestionBonus = null;
  assert.equal(useFiftyFiftyBonus(state), false);
});

test('50/50 is available only during a live question', () => {
  const state = createGameState({ phase: 'rolling' });
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { fifty_fifty: 1 };

  assert.equal(useFiftyFiftyBonus(state), false);
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
});
