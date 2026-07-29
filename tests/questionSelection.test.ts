import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CUSTOM_PACK_TURN_RATIO,
  customPackTurnIsDue,
  pickQuestionForPlayer,
} from '../src/server/questionSelection';
import { CategoryId, DifficultyLevel, GameState, Question } from '../src/types';
import { createGameState, testQuestion } from './fixtures';

function officialQuestion(index: number, overrides: Partial<Question> = {}): Question {
  return {
    ...testQuestion,
    id: `off-${index}`,
    question: `Question officielle ${index} ?`,
    ...overrides,
  };
}

function packQuestion(index: number, overrides: Partial<Question> = {}): Question {
  return {
    ...testQuestion,
    id: `pack-${index}`,
    question: `Question du thème ${index} ?`,
    themePack: 'Astérix',
    ...overrides,
  };
}

/** Banque de secours fournie dans les huit catégories et les trois niveaux. */
function officialBank(): Question[] {
  const categories: CategoryId[] = ['histoire', 'geographie', 'cinema', 'sciences'];
  const difficulties: DifficultyLevel[] = ['enfant', 'ado', 'adulte'];
  const bank: Question[] = [];
  let index = 0;
  for (const categoryId of categories) {
    for (const difficulty of difficulties) {
      for (let copy = 0; copy < 20; copy += 1) {
        index += 1;
        bank.push(officialQuestion(index, { categoryId, difficulty }));
      }
    }
  }
  return bank;
}

function themedState(pack: Question[], overrides: Partial<GameState> = {}): GameState {
  return createGameState({
    settings: { ...createGameState().settings, customThemePackName: 'Astérix' },
    questionsPool: [...pack, ...officialBank()],
    usedQuestionIds: [],
    customPacks: [{ name: 'Astérix', questions: pack }],
    ...overrides,
  });
}

/** Tirage déterministe : toujours le premier candidat, options non mélangées. */
const firstCandidate = () => 0;

test('un thème actif ne dépasse pas une carte tous les trois tours', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const state = themedState(pack);

  const served: Question[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    served.push(pickQuestionForPlayer(state, 'histoire', 'adulte', firstCandidate));
  }

  const fromPack = served.filter((question) => question.themePack === 'Astérix').length;
  assert.equal(fromPack, 10, 'dix cartes générées sur trente tours');
  assert.ok(
    served.slice(0, 2).every((question) => !question.themePack),
    'la partie ne démarre pas sur le pack',
  );

  // Aucune série : jamais deux cartes générées d'affilée.
  const consecutive = served.some(
    (question, index) => index > 0 && question.themePack && served[index - 1].themePack,
  );
  assert.equal(consecutive, false, 'pas deux cartes générées consécutives');
});

test('le niveau du joueur est respecté même quand le pack ne le couvre pas', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const state = themedState(pack);

  const served = Array.from(
    { length: 12 },
    () => pickQuestionForPlayer(state, 'histoire', 'enfant', firstCandidate),
  );

  assert.ok(
    served.every((question) => question.difficulty === 'enfant'),
    'aucune carte adulte servie à un enfant',
  );
  assert.ok(
    served.every((question) => !question.themePack),
    'le pack, qui n’a aucune carte enfant, reste au repos',
  );
});

test('la catégorie affichée n’est jamais réécrite pour caser une carte du thème', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'gastronomie',
    difficulty: 'adulte',
  }));
  const state = themedState(pack);

  const served = Array.from(
    { length: 12 },
    () => pickQuestionForPlayer(state, 'histoire', 'adulte', firstCandidate),
  );

  assert.ok(
    served.every((question) => question.categoryId === 'histoire'),
    'la case Histoire ne pose que des questions Histoire',
  );
  assert.ok(
    served.every((question) => !question.themePack),
    'une carte Gastronomie du thème n’est pas déguisée en Histoire',
  );
});

test('une carte du thème sort quand la case et le niveau correspondent', () => {
  const pack = [
    packQuestion(1, { categoryId: 'histoire', difficulty: 'adulte' }),
    packQuestion(2, { categoryId: 'sciences', difficulty: 'enfant' }),
  ];
  const state = themedState(pack);

  const served = Array.from(
    { length: 6 },
    () => pickQuestionForPlayer(state, 'histoire', 'adulte', firstCandidate),
  );

  assert.equal(served.filter((question) => question.themePack).length, 1);
  assert.equal(served.find((question) => question.themePack)?.id, 'pack-1');
});

test('sans thème actif, les cartes générées se fondent dans le réservoir', () => {
  const pack = [packQuestion(1, { categoryId: 'histoire', difficulty: 'adulte' })];
  const state = themedState(pack, {
    settings: { ...createGameState().settings, customThemePackName: undefined },
  });

  // Le tirage ne privilégie plus rien : le premier candidat du pool est servi,
  // et le pack a été placé en tête du réservoir par `add-custom-pack`.
  const question = pickQuestionForPlayer(state, 'histoire', 'adulte', firstCandidate);
  assert.equal(question.id, 'pack-1');
});

test('chaque carte servie est marquée comme utilisée, sans répétition', () => {
  const state = themedState([
    packQuestion(1, { categoryId: 'histoire', difficulty: 'adulte' }),
  ]);

  const served = Array.from(
    { length: 20 },
    () => pickQuestionForPlayer(state, 'histoire', 'adulte', () => 0.999),
  );

  assert.equal(new Set(served.map((question) => question.id)).size, served.length);
  assert.equal(state.usedQuestionIds.length, served.length);
});

test('la part du thème se calcule sur les tours déjà joués', () => {
  assert.equal(CUSTOM_PACK_TURN_RATIO, 3);
  assert.equal(customPackTurnIsDue(0, 0), false);
  assert.equal(customPackTurnIsDue(1, 0), false);
  assert.equal(customPackTurnIsDue(2, 0), true);
  assert.equal(customPackTurnIsDue(3, 1), false);
  assert.equal(customPackTurnIsDue(5, 1), true);
});
