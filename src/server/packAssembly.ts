/**
 * Assemblage d'un pack de questions généré par l'IA.
 *
 * Le générateur ne validait que la forme : 4 options, un index, un texte non
 * vide. Toutes les règles éditoriales de l'ADR 0001 — longueurs, format
 * d'association, réponse révélée, explication informative, faits reformulés,
 * moules d'énoncé — restaient hors de son chemin. Elles s'appliquent ici, avec
 * les mêmes fonctions que l'audit de la banque rédigée.
 */

import { CATEGORY_IDS } from '../data/categories';
import {
  MAX_BARE_NUMBER_RATIO,
  MAX_SKELETON_REUSE,
  comparableAnswer,
  editorialRejectionReason,
  isBareNumberCard,
  normalize,
  paraphrasesSameFact,
  questionSkeleton,
} from '../data/questionRules';
import { DifficultyLevel, Question } from '../types';

const DIFFICULTY_ORDER: DifficultyLevel[] = ['enfant', 'ado', 'adulte'];

/**
 * Ce que la banque officielle sait déjà, injecté pour que l'assemblage reste
 * testable sans charger les 5 360 cartes.
 */
export interface KnownFactIndex {
  /** L'énoncé figure-t-il déjà, au mot près, dans la banque rédigée ? */
  hasQuestionText(normalizedQuestion: string): boolean;
  /** Énoncés officiels de la même catégorie qui portent déjà cette réponse. */
  questionsSharingAnswer(answerKey: string): string[];
}

export interface PackAssemblyResult {
  questions: Question[];
  /** Motif de rejet -> nombre de cartes concernées, pour les journaux. */
  rejections: Map<string, number>;
  examined: number;
}

export function answerKeyOf(question: Question): string {
  const answer = question.options[question.correctAnswerIndex] ?? '';
  return `${question.categoryId}|${comparableAnswer(answer)}`;
}

export const EMPTY_KNOWN_FACTS: KnownFactIndex = {
  hasQuestionText: () => false,
  questionsSharingAnswer: () => [],
};

/**
 * Répartit la coupe finale entre les trois niveaux, à tour de rôle.
 *
 * Couper à la file livrerait un pack dont les premières cartes — donc un seul
 * niveau, l'IA les produisant groupées — écraseraient la progression enfant /
 * ado / adulte sur laquelle repose le tirage en jeu.
 */
function trimBalanced(questions: Question[], count: number): Question[] {
  if (questions.length <= count) return questions;

  const buckets = DIFFICULTY_ORDER.map(
    (difficulty) => questions.filter((question) => question.difficulty === difficulty),
  );
  const kept: Question[] = [];
  for (let round = 0; kept.length < count; round += 1) {
    let servedThisRound = false;
    for (const bucket of buckets) {
      if (kept.length >= count) break;
      const candidate = bucket[round];
      if (!candidate) continue;
      kept.push(candidate);
      servedThisRound = true;
    }
    if (!servedThisRound) break;
  }
  // Ordre d'origine conservé : le pack reste lisible dans les journaux.
  return questions.filter((question) => kept.includes(question));
}

/**
 * Retient les cartes conformes, puis ramène le pack à `targetCount`.
 *
 * Les candidats sont examinés dans l'ordre reçu : le résultat est déterministe,
 * ce qui rend la chaîne rejouable et testable.
 */
export function assembleGeneratedPack(
  candidates: Question[],
  targetCount: number,
  known: KnownFactIndex = EMPTY_KNOWN_FACTS,
): PackAssemblyResult {
  const rejections = new Map<string, number>();
  const reject = (reason: string): void => {
    rejections.set(reason, (rejections.get(reason) ?? 0) + 1);
  };

  const kept: Question[] = [];
  const keptTexts = new Set<string>();
  const keptByAnswer = new Map<string, string[]>();
  const skeletonsByCategory = new Map<string, Map<string, number>>();
  const maxBareCards = Math.floor(targetCount * MAX_BARE_NUMBER_RATIO);
  let bareCards = 0;

  for (const candidate of candidates) {
    const structuralReason = editorialRejectionReason(candidate);
    if (structuralReason) {
      reject(structuralReason);
      continue;
    }
    if (!CATEGORY_IDS.includes(candidate.categoryId)) {
      reject('catégorie invalide');
      continue;
    }

    const normalizedText = normalize(candidate.question);
    if (keptTexts.has(normalizedText) || known.hasQuestionText(normalizedText)) {
      reject('question déjà posée');
      continue;
    }

    const answerKey = answerKeyOf(candidate);
    const sameAnswer = [
      ...(keptByAnswer.get(answerKey) ?? []),
      ...known.questionsSharingAnswer(answerKey),
    ];
    if (sameAnswer.some((other) => paraphrasesSameFact(other, candidate.question))) {
      reject('fait déjà posé sous une autre formulation');
      continue;
    }

    const skeletons = skeletonsByCategory.get(candidate.categoryId) ?? new Map<string, number>();
    const skeleton = questionSkeleton(candidate.question);
    if ((skeletons.get(skeleton) ?? 0) >= MAX_SKELETON_REUSE) {
      reject('moule d’énoncé sur-utilisé');
      continue;
    }

    if (isBareNumberCard(candidate.options)) {
      if (bareCards >= maxBareCards) {
        reject('quatre options numériques nues');
        continue;
      }
      bareCards += 1;
    }

    kept.push(candidate);
    keptTexts.add(normalizedText);
    keptByAnswer.set(answerKey, [...(keptByAnswer.get(answerKey) ?? []), candidate.question]);
    skeletons.set(skeleton, (skeletons.get(skeleton) ?? 0) + 1);
    skeletonsByCategory.set(candidate.categoryId, skeletons);
  }

  return {
    questions: trimBalanced(kept, targetCount),
    rejections,
    examined: candidates.length,
  };
}

/** Résumé d'une passe d'assemblage, pour une seule ligne de journal. */
export function describeRejections(rejections: Map<string, number>): string {
  if (rejections.size === 0) return 'aucun rejet';
  return [...rejections.entries()]
    .sort(([, left], [, right]) => right - left)
    .map(([reason, count]) => `${reason} (${count})`)
    .join(', ');
}
