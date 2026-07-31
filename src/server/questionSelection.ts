/**
 * Tirage de la carte d'un tour.
 *
 * Le thème IA actif vidait auparavant tout son pack avant que la banque
 * officielle ne reprenne la main : trente tours d'affilée sur le même thème,
 * sans égard pour le camembert de la case ni pour le niveau du joueur. Le pack
 * est désormais un invité régulier — au plus une carte tous
 * `CUSTOM_PACK_TURN_RATIO` tours — et il n'est servi que s'il tombe juste.
 */

import { normalizeCategoryId } from '../data/categories';
import { CategoryId, DifficultyLevel, GameState, Question } from '../types';

/** Une carte générée au maximum tous les trois tours. */
export const CUSTOM_PACK_TURN_RATIO = 3;

type Random = () => number;

/** Mélange les options pour que la bonne réponse ne reste pas au même rang. */
export function shuffleQuestionOptions(question: Question, random: Random = Math.random): Question {
  const originalCorrectOption = question.options[question.correctAnswerIndex];
  const shuffledOptions = [...question.options];
  for (let i = shuffledOptions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  return {
    ...question,
    options: shuffledOptions,
    correctAnswerIndex: shuffledOptions.indexOf(originalCorrectOption),
  };
}

function belongsToTheme(question: Question, activeTheme: string): boolean {
  return Boolean(question.themePack)
    && question.themePack!.toLowerCase().trim() === activeTheme;
}

/**
 * Le tour en cours peut-il servir une carte du thème actif sans dépasser sa
 * part ? `served` compte les cartes déjà posées, `fromPack` celles qui venaient
 * du thème.
 */
export function customPackTurnIsDue(served: number, fromPack: number): boolean {
  return (fromPack + 1) * CUSTOM_PACK_TURN_RATIO <= served + 1;
}

/**
 * Choisit une carte pour la case et le joueur courants.
 *
 * `random` est injectable pour rendre le tirage reproductible dans les tests.
 */
export function pickQuestionForPlayer(
  state: GameState,
  targetCategoryId: CategoryId,
  playerDifficulty: DifficultyLevel,
  random: Random = Math.random,
): Question {
  const targetCategory = normalizeCategoryId(targetCategoryId);
  const activeTheme = state.settings.customThemePackName?.toLowerCase().trim();
  const usedIds = new Set(state.usedQuestionIds);
  const pickOne = (list: Question[]): Question => list[Math.floor(random() * list.length)];

  const serve = (question: Question, categoryId: CategoryId): Question => {
    state.usedQuestionIds.push(question.id);
    return shuffleQuestionOptions({ ...question, categoryId }, random);
  };

  // 1. Thème IA actif : une carte du pack, à sa part et seulement si elle
  //    correspond vraiment à la case et au niveau du joueur. Faute de quoi, la
  //    banque officielle reprend la main — sans jamais déguiser la catégorie
  //    d'une carte ni servir une question adulte à un enfant.
  if (activeTheme) {
    const packQuestions = state.questionsPool.filter(
      (question) => belongsToTheme(question, activeTheme),
    );
    const servedFromPack = packQuestions.filter((question) => usedIds.has(question.id)).length;

    if (customPackTurnIsDue(state.usedQuestionIds.length, servedFromPack)) {
      const candidates = packQuestions.filter(
        (question) => !usedIds.has(question.id)
          && normalizeCategoryId(question.categoryId) === targetCategory
          && question.difficulty === playerDifficulty,
      );
      if (candidates.length > 0) {
        return serve(pickOne(candidates), targetCategory);
      }
    }
  }

  // 2. Banque officielle. Le thème actif en est exclu : sa part est déjà tenue
  //    par l'étape 1, et un second tirage la ferait déborder.
  const isEligible = (question: Question): boolean => !activeTheme
    || !belongsToTheme(question, activeTheme);

  const eligible = state.questionsPool.filter(isEligible);

  // Le niveau du joueur passe avant la catégorie et avant la fraîcheur des
  // cartes : plutôt changer de catégorie, ou resservir une carte déjà jouée,
  // que poser une question adulte à un enfant. Les autres niveaux ne
  // reviennent qu'en dernier recours, si le réservoir n'a aucune carte du
  // niveau demandé.
  const atPlayerLevel = eligible.filter(
    (question) => question.difficulty === playerDifficulty,
  );
  const pool = atPlayerLevel.length > 0
    ? atPlayerLevel
    : eligible.length > 0 ? eligible : state.questionsPool;

  let candidates = pool.filter(
    (question) => normalizeCategoryId(question.categoryId) === targetCategory
      && !usedIds.has(question.id),
  );

  if (candidates.length === 0) {
    const unused = pool.filter((question) => !usedIds.has(question.id));
    if (unused.length > 0) {
      candidates = unused;
    } else {
      // Réservoir du niveau épuisé : un nouveau cycle repart des mêmes
      // cartes, sans remettre à zéro les cartes encore fraîches que les
      // joueurs des autres niveaux n'ont pas vues.
      const recycledIds = new Set(pool.map((question) => question.id));
      state.usedQuestionIds = state.usedQuestionIds.filter((id) => !recycledIds.has(id));
      const sameCategory = pool.filter(
        (question) => normalizeCategoryId(question.categoryId) === targetCategory,
      );
      candidates = sameCategory.length > 0 ? sameCategory : pool;
    }
  }

  const selected = pickOne(candidates);

  return serve(
    selected,
    selected.categoryId ? normalizeCategoryId(selected.categoryId) : targetCategory,
  );
}
