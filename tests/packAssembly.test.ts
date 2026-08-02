import assert from 'node:assert/strict';
import test from 'node:test';
import { normalize } from '../src/data/questionRules';
import {
  KnownFactIndex,
  answerKeyOf,
  assembleGeneratedPack,
  correctObviousGeneratedCategory,
  describeRejections,
} from '../src/server/packAssembly';
import { Question } from '../src/types';

function card(overrides: Partial<Question> = {}): Question {
  return {
    id: 'gen_0',
    categoryId: 'histoire',
    question: 'Quel village gaulois résiste encore à César ?',
    options: ['Armorique', 'Lutèce', 'Gergovie', 'Alésia'],
    correctAnswerIndex: 0,
    explanation: 'Goscinny situait ce hameau sur la côte bretonne, près d’Erquy.',
    difficulty: 'adulte',
    themePack: 'Astérix',
    ...overrides,
  };
}

/** Le pack conforme minimal : une carte différente par niveau. */
function threeLevels(): Question[] {
  return [
    card({ id: 'a', difficulty: 'enfant' }),
    card({
      id: 'b',
      difficulty: 'ado',
      question: 'Quelle boisson donne sa force au village gaulois ?',
      options: ['La potion magique', 'Le cidre', 'L’hydromel', 'Le lait de chèvre'],
      explanation: 'Panoramix garde la recette secrète, transmise oralement entre druides.',
    }),
    card({
      id: 'c',
      difficulty: 'adulte',
      question: 'Quel animal accompagne Obélix dans ses voyages ?',
      options: ['Un chien', 'Un sanglier', 'Un aigle', 'Un âne'],
      correctAnswerIndex: 0,
      explanation: 'Idéfix apparaît en 1963 et devient une mascotte écologiste avant l’heure.',
    }),
  ];
}

function reasons(rejections: Map<string, number>): string[] {
  return [...rejections.keys()];
}

test('une carte conforme est retenue telle quelle', () => {
  const pack = assembleGeneratedPack([card()], 30);

  assert.equal(pack.questions.length, 1);
  assert.equal(pack.rejections.size, 0);
  assert.equal(describeRejections(pack.rejections), 'aucun rejet');
});

test('les règles éditoriales de l’ADR sont appliquées carte par carte', () => {
  const cases: Array<[string, Question, string]> = [
    ['choix dupliqué', card({ options: ['Armorique', 'Armorique', 'Lutèce', 'Alésia'] }), 'choix dupliqué'],
    [
      'énoncé trop long',
      card({ question: `Quel village gaulois résiste encore à César ${'et à ses légions '.repeat(8)}?` }),
      'énoncé de plus de 125 caractères',
    ],
    [
      'choix trop long',
      card({ options: [`Armorique ${'et toute sa côte bretonne '.repeat(4)}`, 'Lutèce', 'Gergovie', 'Alésia'] }),
      'choix de plus de 72 caractères',
    ],
    [
      'préfixe décoratif',
      card({ question: 'Question flash : quel village gaulois résiste à César ?' }),
      'préfixe artificiel interdit',
    ],
    [
      'format association',
      card({
        question: 'Quelle association question-réponse est correcte ?',
        options: ['Village — Armorique', 'Chef — Lutèce', 'Druide — Gergovie', 'Barde — Alésia'],
      }),
      'format d’association interdit',
    ],
    [
      'question à trou',
      card({ question: 'Quel mot complète cette phrase : le village gaulois de ___ ?' }),
      'question à trou artificielle',
    ],
    [
      'réponse révélée',
      card({
        question: 'Le village gaulois d’irréductibles est Armorique, mais qui est Armorique ?',
        options: ['Armorique', 'Lutèce', 'Gergovie', 'Alésia'],
      }),
      'bonne réponse révélée dans l’énoncé',
    ],
    [
      'explication non informative',
      card({ explanation: 'Le village gaulois qui résiste à César est l’Armorique.' }),
      'explication non informative',
    ],
    ['index invalide', card({ correctAnswerIndex: 7 }), 'bonne réponse invalide'],
    ['énoncé absent', card({ question: 'Qui ?' }), 'énoncé absent ou trop court'],
  ];

  for (const [label, rejected, expected] of cases) {
    const pack = assembleGeneratedPack([rejected], 30);
    assert.equal(pack.questions.length, 0, `${label} devrait être écartée`);
    assert.deepEqual(reasons(pack.rejections), [expected], label);
  }
});

test('un doublon exact et une reformulation du même fait sont écartés', () => {
  const original = card({ id: 'a' });
  const exactCopy = card({ id: 'b' });
  const paraphrase = card({
    id: 'c',
    question: 'Quel village gaulois résiste toujours à César ?',
    explanation: 'Uderzo dessinait ses huttes d’après des fermes bretonnes existantes.',
  });

  const pack = assembleGeneratedPack([original, exactCopy, paraphrase], 30);

  assert.deepEqual(pack.questions.map((question) => question.id), ['a']);
  assert.deepEqual(
    new Set(reasons(pack.rejections)),
    new Set(['question déjà posée', 'fait déjà posé sous une autre formulation']),
  );
});

test('une carte déjà présente dans la banque officielle est écartée', () => {
  const official = card({ id: 'officielle' });
  const known: KnownFactIndex = {
    hasQuestionText: (text) => text === normalize(official.question),
    questionsSharingAnswer: (key) => (key === answerKeyOf(official) ? [official.question] : []),
  };

  const exact = assembleGeneratedPack([card()], 30, known);
  assert.deepEqual(reasons(exact.rejections), ['question déjà posée']);

  const reworded = assembleGeneratedPack([
    card({ question: 'Quel village gaulois résiste toujours à César ?' }),
  ], 30, known);
  assert.deepEqual(reasons(reworded.rejections), ['fait déjà posé sous une autre formulation']);
});

test('le moule d’énoncé n’est pas réutilisé plus de huit fois par catégorie', () => {
  const invaders = ['César', 'Rome', 'Titus', 'Brutus', 'Pompée', 'Crassus', 'Tullius', 'Caius', 'Lucius', 'Marcus'];
  const candidates = invaders.map((invader, index) => card({
    id: `gen_${index}`,
    question: `Quel village gaulois résiste encore à ${invader} ?`,
    options: [`Armorique ${index}`, `Lutèce ${index}`, `Gergovie ${index}`, `Alésia ${index}`],
    explanation: `Goscinny publiait cet épisode dans Pilote, numéro ${index + 100}.`,
  }));

  const pack = assembleGeneratedPack(candidates, 30);

  assert.equal(pack.questions.length, 8);
  assert.deepEqual(reasons(pack.rejections), ['moule d’énoncé sur-utilisé']);
  assert.equal(pack.rejections.get('moule d’énoncé sur-utilisé'), 2);
});

test('les cartes jouées entre quatre nombres nus restent marginales', () => {
  const years = [
    ['1959', '1961', '1965', '1968'],
    ['1971', '1974', '1977', '1980'],
    ['1983', '1986', '1989', '1992'],
  ];
  const candidates = years.map((options, index) => card({
    id: `an_${index}`,
    question: `En quelle année paraît le ${index + 2}e album de la série ?`,
    options,
    explanation: 'Dargaud a longtemps imposé un rythme de deux parutions par an.',
  }));

  const pack = assembleGeneratedPack(candidates, 30);

  assert.equal(pack.questions.length, 1, 'une seule carte numérique sur un pack de 30');
  assert.equal(pack.rejections.get('quatre options numériques nues'), 2);
});

test('la coupe finale garde les trois niveaux', () => {
  const candidates = [
    ...threeLevels(),
    card({ id: 'd', difficulty: 'enfant', question: 'Qui porte des ailes sur son casque ?', options: ['Astérix', 'Obélix', 'Idéfix', 'Assurancetourix'], explanation: 'Ce détail vient du casque gaulois retrouvé à Amfreville, en Normandie.' }),
    card({ id: 'e', difficulty: 'enfant', question: 'Quel métier exerce Cétautomatix ?', options: ['Forgeron', 'Boulanger', 'Pêcheur', 'Berger'], explanation: 'Son nom vient de la formule publicitaire des années 1960 sur l’électroménager.' }),
  ];

  const pack = assembleGeneratedPack(candidates, 3);

  assert.equal(pack.questions.length, 3);
  assert.deepEqual(
    new Set(pack.questions.map((question) => question.difficulty)),
    new Set(['enfant', 'ado', 'adulte']),
    'un niveau par carte plutôt que trois cartes du même niveau',
  );
});

test('une catégorie hors plateau est refusée', () => {
  const pack = assembleGeneratedPack(
    [card({ categoryId: 'astronomie' as Question['categoryId'] })],
    30,
  );

  assert.deepEqual(reasons(pack.rejections), ['catégorie invalide']);
});

test('une question sur un rôle de film ne peut pas rester classée en sciences', () => {
  const bladeRunner = card({
    categoryId: 'sciences',
    question: 'Dans Blade Runner (1982), quel androïde est interprété par Rutger Hauer ?',
    options: ['Pris Stratton', 'Rachael', 'Roy Batty', 'Leon Kowalski'],
    correctAnswerIndex: 2,
    explanation: 'Son monologue final sous la pluie est devenu une scène culte du cinéma.',
  });

  const corrected = correctObviousGeneratedCategory(bladeRunner);
  const pack = assembleGeneratedPack([bladeRunner], 30);

  assert.equal(corrected.categoryId, 'cinema');
  assert.equal(pack.questions[0]?.categoryId, 'cinema');
});

test('une vraie question scientifique contenant un androïde reste en sciences', () => {
  const scienceCard = card({
    categoryId: 'sciences',
    question: 'Quel matériau conducteur est souvent utilisé dans les circuits d’un androïde ?',
    options: ['Le cuivre', 'Le verre', 'Le bois', 'Le granit'],
    explanation: 'Le cuivre conduit bien le courant tout en restant facile à façonner.',
  });

  assert.equal(correctObviousGeneratedCategory(scienceCard).categoryId, 'sciences');
});
