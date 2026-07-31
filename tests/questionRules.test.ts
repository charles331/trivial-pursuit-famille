import assert from 'node:assert/strict';
import test from 'node:test';
import {
  echoesCorrectAnswer,
  editorialRejectionReason,
  quotesAnswerProperName,
} from '../src/data/questionRules';

/** Raccourci de lecture : la bonne réponse est toujours le premier choix. */
function echoes(question: string, correct: string, ...wrong: [string, string, string]): boolean {
  return echoesCorrectAnswer(question, [correct, ...wrong], 0);
}

test('an answer echoed word for word in the question is caught', () => {
  assert.equal(
    echoes(
      'Quel film de 1966 montre une bataille d’Alger sans acteurs professionnels ?',
      'La Bataille d’Alger',
      'Z', 'Queimada', 'Chronique des années de braise',
    ),
    true,
  );
});

test('a changed article does not hide the leak', () => {
  // « une bataille d'Alger » contre « La Bataille d'Alger » : la citation
  // littérale manque, la carte se joue quand même sans rien savoir.
  assert.equal(
    echoes(
      'Quelle province belge a pour chef-lieu la ville de Liège ?',
      'La province de Liège',
      'Le Hainaut', 'Le Brabant wallon', 'Le Luxembourg',
    ),
    true,
  );
});

test('a word shared by every option gives nothing away', () => {
  // Quatre marches, une seule « du sel » : « marche » ne désigne personne.
  assert.equal(
    echoes(
      'Quelle marche menée par Gandhi en 1930 dénonça un monopole britannique ?',
      'La Marche du sel',
      'La Longue Marche', 'La Marche sur Rome', 'La Marche de la faim',
    ),
    false,
  );
});

test('naming two candidates still forces a choice', () => {
  assert.equal(
    echoes(
      'Entre le lièvre et la tortue, qui remporte la course de la fable ?',
      'La tortue',
      'Le lièvre', 'Le renard', 'Le corbeau',
    ),
    false,
  );
});

test('plural and singular are the same word from one option to the next', () => {
  // « plante » apparaît dans un mauvais choix : il ne distingue plus rien.
  assert.equal(
    echoes(
      'De quelle plante le thé vert et le thé noir proviennent-ils ?',
      'La même plante',
      'Deux plantes différentes', 'Un arbuste et une liane', 'Un arbre et une fleur',
    ),
    false,
  );
});

test('accents separate words a player reads as different', () => {
  // « maïs » n'est pas la conjonction « mais ».
  assert.equal(
    echoes(
      'Quel grain donne son nom au whisky bourbon mais n’est pas son seul ingrédient ?',
      'Le maïs',
      'Le blé', 'Le seigle', 'L’orge',
    ),
    false,
  );
});

test('a rewritten question is accepted once the giveaway word is gone', () => {
  assert.equal(
    echoes(
      'Quel fruit du verger, rouge ou vert, se croque à l’automne et se cuit en compote ?',
      'La pomme',
      'La banane', 'L’ananas', 'Le melon',
    ),
    false,
  );
});

test('the editorial contract rejects a card that gives its answer away', () => {
  assert.equal(
    editorialRejectionReason({
      question: 'Quel fruit garnit la tarte aux pommes ?',
      options: ['La pomme', 'La banane', 'L’ananas', 'Le melon'],
      correctAnswerIndex: 0,
      explanation: 'La tarte aux pommes figure déjà dans des recettes du Moyen Âge.',
    }),
    'énoncé qui donne la bonne réponse',
  );
});

/** Raccourci de lecture : la bonne réponse est toujours le premier choix. */
function quotesName(question: string, correct: string, ...wrong: [string, string, string]): boolean {
  return quotesAnswerProperName(question, [correct, ...wrong], 0);
}

test('a filler word in the answer no longer hides a quoted proper name', () => {
  // « virus » n'apparaît pas dans l'énoncé, ce qui suffisait à passer
  // echoesCorrectAnswer alors que « Ebola » donne la carte.
  assert.equal(
    quotesName(
      'Quelle épidémie fut identifiée pour la première fois en 1976 près de la rivière Ebola ?',
      'La maladie à virus Ebola',
      'La fièvre jaune', 'La fièvre de Lassa', 'La maladie de Marburg',
    ),
    true,
  );
});

test('a proper name shared with another option gives nothing away', () => {
  assert.equal(
    quotesName(
      'Quelle maladie doit son nom à la ville allemande de Marburg ?',
      'La maladie de Marburg',
      'La maladie à virus Ebola', 'La fièvre de Marburg-Lassa', 'La variole de Marburg',
    ),
    false,
  );
});

test('a shared first name does not designate a person', () => {
  // « Daniel » ne distingue rien : c'est le nom de famille qui nomme la réponse.
  assert.equal(
    quotesName(
      'Qui joue Daniel Plainview dans There Will Be Blood ?',
      'Daniel Day-Lewis',
      'Joaquin Phoenix', 'Christian Bale', 'Sean Penn',
    ),
    false,
  );
});

test('naming the work whose content is asked about stays allowed', () => {
  assert.equal(
    quotesName(
      'Que devient Simba à la fin du dessin animé de Disney ?',
      'Le roi de la Terre des Lions',
      'Un explorateur', 'Un chasseur', 'Un chef hyène',
    ),
    false,
  );
});

test('a capital at the start of a sentence is not a proper name', () => {
  // « Quand » ouvre l'énoncé comme la réponse : ce n'est pas un nom propre.
  assert.equal(
    quotesName(
      'Quand un arbitre accorde-t-il un avantage au football ?',
      'Quand poursuivre le jeu profite à l’équipe lésée',
      'Quand la faute est involontaire', 'Quand le ballon sort', 'Quand le gardien sort de sa surface',
    ),
    false,
  );
});

test('the editorial contract rejects a card that quotes its answer’s name', () => {
  assert.equal(
    editorialRejectionReason({
      question: 'Quelle épidémie fut identifiée en 1976 près de la rivière Ebola ?',
      options: ['La maladie à virus Ebola', 'La fièvre jaune', 'La fièvre de Lassa', 'La maladie de Marburg'],
      correctAnswerIndex: 0,
      explanation: 'Deux flambées presque simultanées eurent lieu au Soudan et au Zaïre en 1976.',
    }),
    'nom propre de la bonne réponse cité dans l’énoncé',
  );
});
