import assert from 'node:assert/strict';
import test from 'node:test';
import {
  QUESTION_TIMER_OPTIONS,
  resolveQuestionTimerSeconds,
} from '../src/utils/questionTimer';

test('propose 30, 60, 90 secondes et sans limite', () => {
  assert.deepEqual(QUESTION_TIMER_OPTIONS, [30, 60, 90, 0]);
});

test('respecte exactement la durée choisie, y compris sans limite', () => {
  for (const seconds of QUESTION_TIMER_OPTIONS) {
    assert.equal(resolveQuestionTimerSeconds(seconds), seconds);
  }
});
