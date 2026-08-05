import { Question } from '../../types';

/**
 * Réécriture de cartes existantes, par identifiant, sans toucher aux volumes.
 *
 * Les passes précédentes (`familyAdultReplacements`, `adoReplacements`) ne
 * savaient remplacer qu'un QCM par un QCM. Deux chantiers demandent davantage :
 * réécrire une carte qui reposait un fait déjà présent, et convertir une carte à
 * choix multiples en Vrai/Faux ou en question ouverte. D'où un type par forme,
 * et une seule fonction pour les appliquer.
 *
 * Dans tous les cas la carte garde son identifiant, sa catégorie et son niveau :
 * les invariants de volume de l'audit — 135 cartes enfant et ado par catégorie,
 * 400 QCM adultes relues — restent vrais. C'est aussi pourquoi une conversion de
 * format ne vise que le niveau ado : convertir un QCM adulte le ferait sortir du
 * quota des 400.
 */
export type CardRewrite =
  | {
    id: string;
    /** Choix multiples : la bonne réponse d'abord, puis les trois distracteurs. */
    answer: string;
    distractors: [string, string, string];
    question: string;
    explanation: string;
  }
  | {
    id: string;
    format: 'boolean';
    question: string;
    /** L'affirmation est-elle vraie ? */
    isTrue: boolean;
    explanation: string;
  }
  | {
    id: string;
    format: 'open';
    question: string;
    answer: string;
    explanation: string;
  };

export function applyCardRewrites(questions: Question[], rewrites: CardRewrite[]): Question[] {
  const byId = new Map(rewrites.map((rewrite) => [rewrite.id, rewrite]));
  // Les bonnes réponses des QCM réécrits tournent entre A, B, C et D : sans cela
  // une passe entière concentrerait ses solutions au même rang, ce que l'audit
  // vérifie sur les cartes adultes.
  let sequence = 0;

  return questions.map((question) => {
    const rewrite = byId.get(question.id);
    if (!rewrite) return question;

    if ('format' in rewrite && rewrite.format === 'boolean') {
      return {
        ...question,
        format: 'boolean' as const,
        question: rewrite.question,
        options: ['Vrai', 'Faux'],
        correctAnswerIndex: rewrite.isTrue ? 0 : 1,
        answer: undefined,
        explanation: rewrite.explanation,
      };
    }

    if ('format' in rewrite && rewrite.format === 'open') {
      return {
        ...question,
        format: 'open' as const,
        question: rewrite.question,
        options: [],
        correctAnswerIndex: 0,
        answer: rewrite.answer,
        explanation: rewrite.explanation,
      };
    }

    const options = [rewrite.answer, ...rewrite.distractors];
    const targetIndex = sequence % 4;
    sequence += 1;

    return {
      ...question,
      format: 'mcq' as const,
      answer: undefined,
      question: rewrite.question,
      options: options.map(
        (_, index) => options[(index + options.length - targetIndex) % options.length],
      ),
      correctAnswerIndex: targetIndex,
      explanation: rewrite.explanation,
    };
  });
}
