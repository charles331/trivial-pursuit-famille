import assert from 'node:assert/strict';
import test from 'node:test';
import {
  awardSurpriseBonus,
  bonusCount,
  fiftyFiftyCount,
  jokerCanEarnWedge,
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

// --- Un Joker qui ne peut rien rapporter --------------------------------------
// Signalé en partie : « j'ai gagné un joker pour avoir un camembert, mais je les
// ai déjà tous ». Il était alors consommé en silence, sans effet.

test('the joker is worthless once every wedge is owned', () => {
  assert.equal(jokerCanEarnWedge([], 'histoire', 6), true);
  assert.equal(
    jokerCanEarnWedge(
      ['histoire', 'geographie', 'cinema', 'sciences', 'art', 'sports'],
      'popculture',
      6,
    ),
    false,
  );
});

test('the joker is worthless on a category already collected', () => {
  // Le camembert existe déjà : le rejouer ne donnerait rien, alors qu'il vaudra
  // son prix sur une autre case.
  assert.equal(jokerCanEarnWedge(['histoire'], 'histoire', 6), false);
  assert.equal(jokerCanEarnWedge(['histoire'], 'sciences', 6), true);
});

test('a joker that cannot earn anything is not consumed', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.players[0].bonuses = { camembert_joker: 1 };
  // La carte en cours est en histoire, catégorie déjà acquise.
  state.players[0].wedges = ['histoire'];

  assert.equal(useBonus(state, 'camembert_joker'), false);
  assert.equal(state.activeQuestionBonus, undefined);
  // Il reste en poche pour une case dont le camembert manque encore.
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 1);
});

test('the wheel hands a 50/50 instead of a dead joker', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.settings.wedgesToWin = 1;
  state.players[0].wedges = ['histoire']; // le compte est fait

  // rollJoker viserait le quartier Joker : il devient un 50/50, utile jusqu'au bout.
  assert.equal(awardSurpriseBonus(state, rollJoker), 'fifty_fifty');
  assert.equal(fiftyFiftyCount(state.players[0]), 1);
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 0);
});

test('the wheel still hands a joker to a player who can use it', () => {
  const state = createGameState();
  state.settings.enableBonuses = true;
  state.settings.wedgesToWin = 6;

  assert.equal(awardSurpriseBonus(state, rollJoker), 'camembert_joker');
  assert.equal(bonusCount(state.players[0], 'camembert_joker'), 1);
});
