import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CUSTOM_PACK_MAX_SHARE,
  CUSTOM_PACK_TARGET_SHARE,
  activeThemeKeys,
  customPackTurnIsDue,
  pickQuestionForPlayer,
  shuffleQuestionOptions,
  variableFormatTurnIsDue,
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
    settings: { ...createGameState().settings, customThemePackNames: ['Astérix'] },
    questionsPool: [...pack, ...officialBank()],
    usedQuestionIds: [],
    customPacks: [{ name: 'Astérix', questions: pack }],
    ...overrides,
  });
}

/** Tirage déterministe : toujours le premier candidat, options non mélangées. */
const firstCandidate = () => 0;
/** Hasard le plus réticent : le thème ne sort que par la garantie de retard. */
const reluctant = () => 0.999;

/** Générateur pseudo-aléatoire reproductible, pour les tirages « réalistes ». */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('un thème actif garde une part d\'un tiers en moyenne, sans envahir la partie', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const state = themedState(pack);

  // Hasard le plus gourmand : le thème sort dès que sa part le permet.
  const served: Question[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    served.push(pickQuestionForPlayer(state, 'histoire', 'adulte', firstCandidate));
  }

  const fromPack = served.filter((question) => question.themePack === 'Astérix').length;
  assert.equal(fromPack, 10, 'même au plus gourmand, la part reste un tiers');
  assert.ok(!served[0].themePack, 'la partie ne démarre jamais sur le pack');
});

test('le thème sort tôt même quand le hasard le boude', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const state = themedState(pack);

  const served: Question[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    served.push(pickQuestionForPlayer(state, 'histoire', 'adulte', reluctant));
  }

  const firstThemed = served.findIndex((question) => Boolean(question.themePack));
  assert.equal(firstThemed, 5, 'au plus tard à la sixième carte');
  const fromPack = served.filter((question) => Boolean(question.themePack)).length;
  assert.equal(fromPack, 9, 'la garantie de retard maintient la part proche du tiers');
});

test('le rythme du thème n\'est pas prévisible : les écarts entre cartes varient', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const state = themedState(pack);
  const random = seededRandom(42);

  const served: Question[] = [];
  for (let turn = 0; turn < 30; turn += 1) {
    served.push(pickQuestionForPlayer(state, 'histoire', 'adulte', random));
  }

  const themedIndexes = served
    .map((question, index) => (question.themePack ? index : -1))
    .filter((index) => index >= 0);
  const gaps = themedIndexes.slice(1).map((index, i) => index - themedIndexes[i]);
  assert.ok(new Set(gaps).size > 1, 'l\'écart entre deux cartes du thème n\'est pas constant');
  const share = themedIndexes.length / served.length;
  assert.ok(share >= 0.25 && share <= CUSTOM_PACK_MAX_SHARE, `part servie raisonnable (${share})`);
});

test('plusieurs thèmes actifs se partagent la même part', () => {
  const asterix = Array.from({ length: 15 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const pokemon = Array.from({ length: 15 }, (_, index) => ({
    ...testQuestion,
    id: `poke-${index}`,
    question: `Question Pokémon ${index} ?`,
    themePack: 'Pokémon',
    categoryId: 'histoire' as const,
    difficulty: 'adulte' as const,
  }));
  const state = createGameState({
    settings: { ...createGameState().settings, customThemePackNames: ['Astérix', 'Pokémon'] },
    questionsPool: [...asterix, ...pokemon, ...officialBank()],
    usedQuestionIds: [],
    customPacks: [
      { name: 'Astérix', questions: asterix },
      { name: 'Pokémon', questions: pokemon },
    ],
  });
  const random = seededRandom(7);

  const served: Question[] = [];
  for (let turn = 0; turn < 45; turn += 1) {
    served.push(pickQuestionForPlayer(state, 'histoire', 'adulte', random));
  }

  const themes = new Set(served.filter((q) => q.themePack).map((q) => q.themePack));
  assert.ok(themes.has('Astérix') && themes.has('Pokémon'), 'les deux thèmes sortent en jeu');
  const themedCount = served.filter((q) => q.themePack).length;
  assert.ok(
    themedCount <= Math.ceil(served.length * CUSTOM_PACK_MAX_SHARE),
    'la part est commune aux thèmes, pas multipliée par leur nombre',
  );
});

test('l\'ancien réglage à thème unique reste compris (salons sauvegardés)', () => {
  const pack = Array.from({ length: 30 }, (_, index) => packQuestion(index, {
    categoryId: 'histoire',
    difficulty: 'adulte',
  }));
  const state = themedState(pack, {
    settings: {
      ...createGameState().settings,
      customThemePackName: 'Astérix',
      customThemePackNames: undefined,
    },
  });

  const served: Question[] = [];
  for (let turn = 0; turn < 12; turn += 1) {
    served.push(pickQuestionForPlayer(state, 'histoire', 'adulte', firstCandidate));
  }

  assert.ok(
    served.some((question) => question.themePack === 'Astérix'),
    'le thème hérité de l\'ancien champ est toujours servi',
  );
  assert.deepEqual([...activeThemeKeys(state.settings)], ['astérix']);
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
    settings: {
      ...createGameState().settings,
      customThemePackName: undefined,
      customThemePackNames: undefined,
    },
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

test('le niveau du joueur tient même quand sa banque est épuisée', () => {
  // 20 cartes enfant par catégorie seulement : la case Histoire s'épuise vite.
  const state = createGameState({
    questionsPool: officialBank(),
    usedQuestionIds: [],
    customPacks: undefined,
  });

  const served = Array.from(
    { length: 200 },
    () => pickQuestionForPlayer(state, 'histoire', 'enfant', () => 0.5),
  );

  assert.ok(
    served.every((question) => question.difficulty === 'enfant'),
    'aucune carte ado ou adulte servie à un enfant, même après épuisement',
  );
  // Les 20 cartes enfant Histoire sortent avant tout changement de catégorie.
  assert.ok(
    served.slice(0, 20).every((question) => question.categoryId === 'histoire'),
    'la catégorie de la case est servie tant qu\'elle a des cartes fraîches',
  );
});

test('le recyclage d\'un niveau épuisé préserve les cartes fraîches des autres niveaux', () => {
  const state = createGameState({
    questionsPool: officialBank(),
    usedQuestionIds: [],
    customPacks: undefined,
  });

  // Un adulte joue trois cartes, puis un enfant épuise les 80 cartes enfant.
  for (let turn = 0; turn < 3; turn += 1) {
    pickQuestionForPlayer(state, 'histoire', 'adulte', () => 0.5);
  }
  const adultIds = state.usedQuestionIds.slice(0, 3);
  for (let turn = 0; turn < 81; turn += 1) {
    pickQuestionForPlayer(state, 'histoire', 'enfant', () => 0.5);
  }

  assert.ok(
    adultIds.every((id) => state.usedQuestionIds.includes(id)),
    'le nouveau cycle enfant n\'a pas remis en jeu les cartes adultes déjà posées',
  );
});

test('la part du thème est bornée : plancher garanti, plafond une carte sur deux', () => {
  assert.equal(CUSTOM_PACK_TARGET_SHARE, 1 / 3);
  assert.equal(CUSTOM_PACK_MAX_SHARE, 1 / 2);

  // Jamais la toute première carte de la partie.
  assert.equal(customPackTurnIsDue(0, 0, () => 0), false);
  // Le hasard peut faire sortir le thème dès la deuxième carte…
  assert.equal(customPackTurnIsDue(1, 0, () => 0), true);
  // …ou le retenir, mais au plus tard à la sixième carte.
  assert.equal(customPackTurnIsDue(1, 0, () => 0.99), false);
  assert.equal(customPackTurnIsDue(5, 0, () => 0.99), true);
  // Plafond : jamais plus d'une carte sur deux, même au hasard le plus gourmand.
  assert.equal(customPackTurnIsDue(2, 1, () => 0), false);
  // En avance sur la part cible : la banque officielle reprend la main.
  assert.equal(customPackTurnIsDue(5, 2, () => 0), false);
});

test('le mélange préserve l\'ordre Vrai/Faux et n\'altère pas une carte ouverte', () => {
  const booleanCard: Question = {
    id: 'b1', categoryId: 'sciences', difficulty: 'adulte', format: 'boolean',
    question: 'Un ver de terre possède plusieurs cœurs.',
    options: ['Vrai', 'Faux'], correctAnswerIndex: 0,
  };
  // random qui inverserait tout s'il était consulté : il ne doit pas l'être.
  const shuffledBoolean = shuffleQuestionOptions(booleanCard, () => 0.99);
  assert.deepEqual(shuffledBoolean.options, ['Vrai', 'Faux']);
  assert.equal(shuffledBoolean.correctAnswerIndex, 0);

  const openCard: Question = {
    id: 'o1', categoryId: 'sciences', difficulty: 'adulte', format: 'open',
    question: 'Comment nomme-t-on la peur des hauteurs ?',
    options: [], correctAnswerIndex: 0, answer: 'L\'acrophobie',
  };
  const shuffledOpen = shuffleQuestionOptions(openCard, () => 0.99);
  assert.deepEqual(shuffledOpen.options, []);
  assert.equal(shuffledOpen.correctAnswerIndex, 0);
});

test('la cadence des formats variés reste sous le plafond puis force une sortie', () => {
  // Jamais dès la première carte (plafond), mais le déficit force une sortie
  // avant d'avoir accumulé trop de retard sur la part cible.
  assert.equal(variableFormatTurnIsDue(0, 0, () => 0), false);
  assert.equal(variableFormatTurnIsDue(9, 0, () => 0.99), true); // déficit ≥ 2
  // Plafond : au-delà d'une carte sur trois, on refuse.
  assert.equal(variableFormatTurnIsDue(3, 2, () => 0), false);
});

test('une carte à format varié finit par sortir pour un joueur adulte', () => {
  const boolCard: Question = {
    ...testQuestion, id: 'bool-1', format: 'boolean',
    question: 'Le Soleil est une étoile.', options: ['Vrai', 'Faux'],
    correctAnswerIndex: 0, categoryId: 'histoire', difficulty: 'adulte',
  };
  const pool: Question[] = [
    ...Array.from({ length: 20 }, (_, i) => ({
      ...testQuestion, id: `mcq-${i}`, categoryId: 'histoire' as const, difficulty: 'adulte' as const,
    })),
    boolCard,
  ];
  const state = createGameState({
    questionsPool: pool,
    // 9 cartes déjà servies : le déficit rend le format varié « dû ».
    usedQuestionIds: Array.from({ length: 9 }, (_, i) => `used-${i}`),
  });

  const served = pickQuestionForPlayer(state, 'histoire', 'adulte', () => 0);
  assert.equal(served.id, 'bool-1');
  assert.deepEqual(served.options, ['Vrai', 'Faux']);
});
