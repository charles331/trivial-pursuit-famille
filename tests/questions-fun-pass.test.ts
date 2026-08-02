import assert from 'node:assert/strict';
import test from 'node:test';
import { QUESTIONS_DATABASE } from '../src/data/questions';

function question(id: string) {
  const value = QUESTIONS_DATABASE.find((candidate) => candidate.id === id);
  assert.ok(value, `question introuvable : ${id}`);
  return value;
}

function answer(id: string): string {
  const value = question(id);
  return value.options[value.correctAnswerIndex];
}

test('les cinq cartes signalées offrent désormais un point d’entrée jouable', () => {
  assert.equal(answer('his_adulte_editorial_05_008'), 'Au Nigeria');
  assert.match(question('geo_adulte_editorial_04_016').question, /explorateur britannique/);
  assert.equal(answer('art_adulte_editorial_030'), 'pointillisme');
  assert.equal(answer('art_adulte_editorial_07_009'), 'L’affiche du Chat Noir');
  assert.equal(answer('art_adulte_editorial_07_018'), 'Un marin aventurier');
});

test('le lot d’art mondial demande un repère et conserve le terme savant dans l’explication', () => {
  const cards = QUESTIONS_DATABASE.filter(
    (candidate) => candidate.id.startsWith('art_adulte_editorial_06_'),
  );
  assert.equal(cards.length, 43);
  assert.equal(answer('art_adulte_editorial_06_012'), 'Les fissures d’un objet réparé');
  assert.match(question('art_adulte_editorial_06_012').explanation ?? '', /kintsugi/);
  assert.equal(answer('art_adulte_editorial_06_038'), 'Chez les Maoris');
  assert.match(question('art_adulte_editorial_06_038').explanation ?? '', /tā moko/);
});

test('les cartes Corto Maltese ne reposent plus trois fois sur le même fait', () => {
  assert.equal(answer('art_adulte_bd_litterature_012'), 'Corto Maltese');
  assert.equal(answer('art_adulte_editorial_07_018'), 'Un marin aventurier');
  assert.equal(answer('pop_adulte_editorial_02_022'), 'D’Italie');
});
