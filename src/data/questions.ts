import { Question } from '../types';
import { HISTOIRE_QUESTIONS } from './questionBank/histoire';
import { GEOGRAPHIE_QUESTIONS } from './questionBank/geographie';
import { CINEMA_QUESTIONS } from './questionBank/cinema';
import { SCIENCES_QUESTIONS } from './questionBank/sciences';
import { ART_QUESTIONS } from './questionBank/art';
import { SPORTS_QUESTIONS } from './questionBank/sports';
import { POPCULTURE_QUESTIONS } from './questionBank/popculture';
import { GASTRONOMIE_QUESTIONS } from './questionBank/gastronomie';
import {
  completeAdultQuestionBank,
  completeTeenQuestionBank,
} from './adultExpansion';

const CURATED_QUESTIONS: Question[] = [
  ...HISTOIRE_QUESTIONS,
  ...GEOGRAPHIE_QUESTIONS,
  ...CINEMA_QUESTIONS,
  ...SCIENCES_QUESTIONS,
  ...ART_QUESTIONS,
  ...SPORTS_QUESTIONS,
  ...POPCULTURE_QUESTIONS,
  ...GASTRONOMIE_QUESTIONS
];

// Safety net: guarantee unique ids even if two bank files ever collide
const seenIds = new Set<string>();
const COMPLETED_QUESTIONS = completeTeenQuestionBank(
  completeAdultQuestionBank(CURATED_QUESTIONS),
);

export const QUESTIONS_DATABASE: Question[] = COMPLETED_QUESTIONS.filter(q => {
  if (seenIds.has(q.id)) return false;
  seenIds.add(q.id);
  return true;
});
