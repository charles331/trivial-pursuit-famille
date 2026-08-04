import assert from 'node:assert/strict';
import test from 'node:test';
import {
  awardSurpriseBonus,
  bonusCount,
  fiftyFiftyCount,
  useBonus,
  useFiftyFiftyBonus,
} from '../src/server/bonuses';
import { createGameState } from './fixtures';

// Roue = [fifty_fifty, vide, fifty_fifty, camembert_joker, fifty_fifty, vide].
// Un tirage vise un quartier via floor(r * 6).
const rollFiftyFifty = () => 0;    // quartier 0
const rollJoker = () => 0.55;      // quartier 3
const rollEmpty = () => 0.2;       // quartier 1 (vide)

test('bonus mode is opt-in and surprise tiles do nothing while disabled', () => {
  const state = createGameState();

  assert.equal(awardSurpriseBonus(state), null);
  assert.equal(fiftyFiftyCount(state.players[0]), 0);
  assert.equal(state.bonusAwardedThisTurn, undefined);
  assert.notEqual(state.surpriseSpinThisTurn, true);
});

test('a surprise box grants the drawn bonus to the active player', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;

  assert.equal(awardSurpriseBonus(state, rollFiftyFifty), 'fifty_fifty');
  assert.equal(awardSurpriseBonus(state, rollJoker), 'camembert_joker');
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 1);
  assert.equal(state.bonusAwardedThisTurn, 'camembert_joker');
  assert.equal(state.surpriseSpinThisTurn, true);
  assert.equal(fiftyFiftyCount(state.players[1]), 0);
});

test('an empty wheel slot spins but grants nothing', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;

  assert.equal(awardSurpriseBonus(state, rollEmpty), null);
  assert.equal(state.surpriseSpinThisTurn, true); // la roue a bien tourné
  assert.equal(state.bonusAwardedThisTurn, null);  // mais rien de gagné
  assert.equal(fiftyFiftyCount(state.players[0]), 0);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 0);
});

test('the camembert joker arms itself for the current question, whatever the format', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { camembert_joker: 1 };
  state.currentQuestion = {
    id: 'b', categoryId: 'sciences', difficulty: 'adulte', format: 'boolean',
    question: 'Le soleil est une étoile.', options: ['Vrai', 'Faux'], correctAnswerIndex: 0,
  };

  assert.equal(useBonus(state, 'camembert_joker'), true);
  assert.equal(state.activeQuestionBonus?.type, 'camembert_joker');
  assert.deepEqual(state.activeQuestionBonus?.hiddenOptionIndexes, []);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 0);
  // Un seul bonus armé par question.
  assert.equal(useBonus(state, 'camembert_joker'), false);
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
