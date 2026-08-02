import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_GENERATED_PACK_COUNT } from '../src/config/generatedPack';

test('un thème IA demande 50 questions par défaut', () => {
  assert.equal(DEFAULT_GENERATED_PACK_COUNT, 50);
});
