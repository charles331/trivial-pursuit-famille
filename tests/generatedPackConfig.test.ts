import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_GENERATED_PACK_COUNT,
  GENERATED_PACK_BUTTON_LABEL,
} from '../src/config/generatedPack';

test('un thème IA demande 25 questions par défaut', () => {
  assert.equal(DEFAULT_GENERATED_PACK_COUNT, 25);
});

test('le bouton du générateur affiche la quantité réellement demandée', () => {
  assert.equal(GENERATED_PACK_BUTTON_LABEL, `Créer (${DEFAULT_GENERATED_PACK_COUNT} q)`);
});
