import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_QUESTION_TIMER_SECONDS,
  DEFAULT_READER_MODE,
} from '../src/config/gameSettings';
import { QUESTION_TIMER_OPTIONS } from '../src/utils/questionTimer';

test('un nouveau salon démarre avec 60 secondes par question', () => {
  assert.equal(DEFAULT_QUESTION_TIMER_SECONDS, 60);
  assert.ok(QUESTION_TIMER_OPTIONS.includes(DEFAULT_QUESTION_TIMER_SECONDS));
});

test('un nouveau salon démarre en mode lecteur de carte', () => {
  assert.equal(DEFAULT_READER_MODE, true);
});
