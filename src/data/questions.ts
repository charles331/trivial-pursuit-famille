import { Question } from '../types';
import { HISTOIRE_QUESTIONS } from './questionBank/histoire';
import { HISTOIRE_ADULTE_PILOT } from './questionBank/histoireAdultPilot';
import { HISTOIRE_ADULTE_EDITORIAL } from './questionBank/histoireAdultEditorial';
import { HISTOIRE_ADULTE_EDITORIAL_02 } from './questionBank/histoireAdultEditorial02';
import { HISTOIRE_ADULTE_EDITORIAL_03 } from './questionBank/histoireAdultEditorial03';
import { HISTOIRE_ADULTE_EDITORIAL_04 } from './questionBank/histoireAdultEditorial04';
import { HISTOIRE_ADULTE_EDITORIAL_05 } from './questionBank/histoireAdultEditorial05';
import { HISTOIRE_ADULTE_EDITORIAL_06 } from './questionBank/histoireAdultEditorial06';
import { HISTOIRE_ADULTE_EDITORIAL_07 } from './questionBank/histoireAdultEditorial07';
import { GEOGRAPHIE_QUESTIONS } from './questionBank/geographie';
import {
  ADULT_QUALITY_GEOGRAPHY,
  ADULT_QUALITY_SCIENCE,
} from './questionBank/adultQualityGeoScience';
import {
  GEOGRAPHIE_ADULTE_EDITORIAL_02,
  SCIENCES_ADULTE_EDITORIAL_02,
} from './questionBank/geoScienceAdultEditorial02';
import {
  GEOGRAPHIE_ADULTE_EDITORIAL_03,
  SCIENCES_ADULTE_EDITORIAL_03,
} from './questionBank/geoScienceAdultEditorial03';
import {
  GEOGRAPHIE_ADULTE_EDITORIAL_04,
  SCIENCES_ADULTE_EDITORIAL_04,
} from './questionBank/geoScienceAdultEditorial04';
import {
  GEOGRAPHIE_ADULTE_EDITORIAL_FINAL,
  SCIENCES_ADULTE_EDITORIAL_FINAL,
} from './questionBank/geoScienceAdultEditorialFinal';
import { CINEMA_QUESTIONS } from './questionBank/cinema';
import { CINEMA_ADULT_EDITORIAL } from './questionBank/cinemaAdultEditorial';
import { CINEMA_ADULT_EDITORIAL_02 } from './questionBank/cinemaAdultEditorial02';
import { CINEMA_ADULT_EDITORIAL_03 } from './questionBank/cinemaAdultEditorial03';
import { CINEMA_ADULT_EDITORIAL_04 } from './questionBank/cinemaAdultEditorial04';
import { CINEMA_ADULTE_EDITORIAL_05 } from './questionBank/cinemaAdultEditorial05';
import { CINEMA_ADULT_EDITORIAL_06 } from './questionBank/cinemaAdultEditorial06';
import {
  CINEMA_ADULTE_EDITORIAL_FINAL,
  POPCULTURE_ADULTE_EDITORIAL_FINAL,
} from './questionBank/cinemaPopAdultEditorialFinal';
import { CINEMA_POP_ADULT_EDITORIAL_FINAL_02 } from './questionBank/cinemaPopAdultEditorialFinal02';
import { SCIENCES_QUESTIONS } from './questionBank/sciences';
import { ART_QUESTIONS } from './questionBank/art';
import { ART_ADULTE_EDITORIAL } from './questionBank/artAdultEditorial';
import { ART_ADULTE_EDITORIAL_02 } from './questionBank/artAdultEditorial02';
import { ART_ADULTE_EDITORIAL_03 } from './questionBank/artAdultEditorial03';
import { ART_ADULTE_EDITORIAL_04 } from './questionBank/artAdultEditorial04';
import { ART_ADULTE_EDITORIAL_05 } from './questionBank/artAdultEditorial05';
import { ART_ADULTE_EDITORIAL_06 } from './questionBank/artAdultEditorial06';
import { ART_ADULTE_EDITORIAL_07 } from './questionBank/artAdultEditorial07';
import { ART_ADULTE_EDITORIAL_FINAL } from './questionBank/artAdultEditorialFinal';
import { SPORTS_QUESTIONS } from './questionBank/sports';
import { SPORTS_ADULT_CURATED_01 } from './questionBank/sportsAdultCurated01';
import { SPORTS_ADULT_CURATED_02 } from './questionBank/sportsAdultCurated02';
import { SPORTS_ADULT_CURATED_03 } from './questionBank/sportsAdultCurated03';
import { SPORTS_ADULT_CURATED_04 } from './questionBank/sportsAdultCurated04';
import { SPORTS_ADULT_CURATED_05 } from './questionBank/sportsAdultCurated05';
import { SPORTS_ADULT_CURATED_06 } from './questionBank/sportsAdultCurated06';
import { SPORTS_ADULT_CURATED_FINAL } from './questionBank/sportsAdultCuratedFinal';
import { POPCULTURE_QUESTIONS } from './questionBank/popculture';
import { POPCULTURE_ADULT_EDITORIAL } from './questionBank/popcultureAdultEditorial';
import { POPCULTURE_ADULT_EDITORIAL_02 } from './questionBank/popcultureAdultEditorial02';
import { POPCULTURE_ADULT_EDITORIAL_03 } from './questionBank/popcultureAdultEditorial03';
import { POPCULTURE_ADULT_EDITORIAL_04 } from './questionBank/popcultureAdultEditorial04';
import { POPCULTURE_ADULTE_EDITORIAL_05 } from './questionBank/popcultureAdultEditorial05';
import { POPCULTURE_ADULT_EDITORIAL_06 } from './questionBank/popcultureAdultEditorial06';
import { GASTRONOMIE_QUESTIONS } from './questionBank/gastronomie';
import { GASTRONOMIE_ADULT_CURATED_01 } from './questionBank/gastronomieAdultCurated01';
import { GASTRONOMIE_ADULT_CURATED_02 } from './questionBank/gastronomieAdultCurated02';
import { GASTRONOMIE_ADULT_CURATED_03 } from './questionBank/gastronomieAdultCurated03';
import { GASTRONOMIE_ADULT_CURATED_04 } from './questionBank/gastronomieAdultCurated04';
import { GASTRONOMIE_ADULT_CURATED_05 } from './questionBank/gastronomieAdultCurated05';
import { GASTRONOMIE_ADULT_CURATED_06 } from './questionBank/gastronomieAdultCurated06';
import { GASTRONOMIE_ADULT_CURATED_FINAL } from './questionBank/gastronomieAdultCuratedFinal';
import { ADULT_KNOWLEDGE_SUPPLEMENT } from './questionBank/adultKnowledgeSupplement';
import { completeTeenQuestionBank } from './adultExpansion';

const CURATED_QUESTIONS: Question[] = [
  ...HISTOIRE_QUESTIONS,
  ...HISTOIRE_ADULTE_PILOT,
  ...HISTOIRE_ADULTE_EDITORIAL,
  ...HISTOIRE_ADULTE_EDITORIAL_02,
  ...HISTOIRE_ADULTE_EDITORIAL_03,
  ...HISTOIRE_ADULTE_EDITORIAL_04,
  ...HISTOIRE_ADULTE_EDITORIAL_05,
  ...HISTOIRE_ADULTE_EDITORIAL_06,
  ...HISTOIRE_ADULTE_EDITORIAL_07,
  ...GEOGRAPHIE_QUESTIONS,
  ...ADULT_QUALITY_GEOGRAPHY,
  ...GEOGRAPHIE_ADULTE_EDITORIAL_02,
  ...GEOGRAPHIE_ADULTE_EDITORIAL_03,
  ...GEOGRAPHIE_ADULTE_EDITORIAL_04,
  ...GEOGRAPHIE_ADULTE_EDITORIAL_FINAL,
  ...CINEMA_QUESTIONS,
  ...CINEMA_ADULT_EDITORIAL,
  ...CINEMA_ADULT_EDITORIAL_02,
  ...CINEMA_ADULT_EDITORIAL_03,
  ...CINEMA_ADULT_EDITORIAL_04,
  ...CINEMA_ADULTE_EDITORIAL_05,
  ...CINEMA_ADULT_EDITORIAL_06,
  ...CINEMA_ADULTE_EDITORIAL_FINAL,
  ...SCIENCES_QUESTIONS,
  ...ADULT_QUALITY_SCIENCE,
  ...SCIENCES_ADULTE_EDITORIAL_02,
  ...SCIENCES_ADULTE_EDITORIAL_03,
  ...SCIENCES_ADULTE_EDITORIAL_04,
  ...SCIENCES_ADULTE_EDITORIAL_FINAL,
  ...ART_QUESTIONS,
  ...ART_ADULTE_EDITORIAL,
  ...ART_ADULTE_EDITORIAL_02,
  ...ART_ADULTE_EDITORIAL_03,
  ...ART_ADULTE_EDITORIAL_04,
  ...ART_ADULTE_EDITORIAL_05,
  ...ART_ADULTE_EDITORIAL_06,
  ...ART_ADULTE_EDITORIAL_07,
  ...ART_ADULTE_EDITORIAL_FINAL,
  ...SPORTS_QUESTIONS,
  ...SPORTS_ADULT_CURATED_01,
  ...SPORTS_ADULT_CURATED_02,
  ...SPORTS_ADULT_CURATED_03,
  ...SPORTS_ADULT_CURATED_04,
  ...SPORTS_ADULT_CURATED_05,
  ...SPORTS_ADULT_CURATED_06,
  ...SPORTS_ADULT_CURATED_FINAL,
  ...POPCULTURE_QUESTIONS,
  ...POPCULTURE_ADULT_EDITORIAL,
  ...POPCULTURE_ADULT_EDITORIAL_02,
  ...POPCULTURE_ADULT_EDITORIAL_03,
  ...POPCULTURE_ADULT_EDITORIAL_04,
  ...POPCULTURE_ADULTE_EDITORIAL_05,
  ...POPCULTURE_ADULT_EDITORIAL_06,
  ...POPCULTURE_ADULTE_EDITORIAL_FINAL,
  ...CINEMA_POP_ADULT_EDITORIAL_FINAL_02,
  ...GASTRONOMIE_QUESTIONS,
  ...GASTRONOMIE_ADULT_CURATED_01,
  ...GASTRONOMIE_ADULT_CURATED_02,
  ...GASTRONOMIE_ADULT_CURATED_03,
  ...GASTRONOMIE_ADULT_CURATED_04,
  ...GASTRONOMIE_ADULT_CURATED_05,
  ...GASTRONOMIE_ADULT_CURATED_06,
  ...GASTRONOMIE_ADULT_CURATED_FINAL,
  ...ADULT_KNOWLEDGE_SUPPLEMENT,
];

// Safety net: guarantee unique ids even if two bank files ever collide
const seenIds = new Set<string>();
// Adult cards are deliberately not completed from teen or child material.
// A category reaches its adult target only through explicit editorial banks.
const COMPLETED_QUESTIONS = completeTeenQuestionBank(CURATED_QUESTIONS);

function balanceAdultAnswerPositions(questions: Question[]): Question[] {
  const sequenceByCategory = new Map<string, number>();

  return questions.map((question) => {
    if (question.difficulty !== 'adulte' || question.options.length !== 4) {
      return question;
    }

    const sequence = sequenceByCategory.get(question.categoryId) ?? 0;
    sequenceByCategory.set(question.categoryId, sequence + 1);
    const targetIndex = sequence % 4;
    const shift = (question.correctAnswerIndex - targetIndex + 4) % 4;

    return {
      ...question,
      options: question.options.map(
        (_, index) => question.options[(index + shift) % question.options.length],
      ),
      correctAnswerIndex: targetIndex,
    };
  });
}

export const QUESTIONS_DATABASE: Question[] = balanceAdultAnswerPositions(
  COMPLETED_QUESTIONS,
).filter(q => {
  if (seenIds.has(q.id)) return false;
  seenIds.add(q.id);
  return true;
});
