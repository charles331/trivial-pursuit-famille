/**
 * Tirage de la carte d'un tour.
 *
 * Le thème IA actif vidait auparavant tout son pack avant que la banque
 * officielle ne reprenne la main : trente tours d'affilée sur le même thème,
 * sans égard pour le camembert de la case ni pour le niveau du joueur. Les
 * thèmes actifs — il peut y en avoir plusieurs — sont désormais des invités
 * réguliers : une carte sur trois en moyenne, au rythme du hasard plutôt qu'à
 * cadence fixe, et une carte n'est servie que si elle tombe juste.
 */

import { normalizeCategoryId } from '../data/categories';
import { CategoryId, DifficultyLevel, GameSettings, GameState, Question } from '../types';

/** Part moyenne visée pour les thèmes actifs : une carte sur trois. */
export const CUSTOM_PACK_TARGET_SHARE = 1 / 3;
/** Plafond dur : les thèmes ne dépassent jamais une carte sur deux. */
export const CUSTOM_PACK_MAX_SHARE = 1 / 2;

/**
 * Part visée pour les formats variés (vrai/faux, questions ouvertes) au niveau
 * adulte : environ une carte sur cinq. Sans ce coup de pouce, une trentaine de
 * cartes noyées parmi 3 200 QCM ne sortaient quasiment jamais en partie.
 */
export const VARIABLE_FORMAT_TARGET_SHARE = 0.2;
/** Plafond dur : les formats variés ne dépassent jamais une carte sur trois. */
export const VARIABLE_FORMAT_MAX_SHARE = 1 / 3;

type Random = () => number;

/**
 * Thèmes actifs d'un salon, en clé normalisée. L'ancien réglage à thème
 * unique reste lu en secours pour les salons sauvegardés avant la
 * multi-sélection.
 */
export function activeThemeKeys(
  settings: Pick<GameSettings, 'customThemePackName' | 'customThemePackNames'>,
): Set<string> {
  const names = [
    ...(settings.customThemePackNames ?? []),
    ...(settings.customThemePackName ? [settings.customThemePackName] : []),
  ];
  return new Set(names.map((name) => name.toLowerCase().trim()).filter(Boolean));
}

/** Mélange les options pour que la bonne réponse ne reste pas au même rang. */
export function shuffleQuestionOptions(question: Question, random: Random = Math.random): Question {
  // Seul le QCM se mélange : une carte vrai/faux garde l'ordre « Vrai » puis
  // « Faux », et une carte ouverte n'a pas d'options (son index correct reste 0,
  // celui que le lecteur soumet en cas de réussite).
  if ((question.format ?? 'mcq') !== 'mcq') return question;
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

function belongsToActiveTheme(question: Question, activeThemes: Set<string>): boolean {
  return Boolean(question.themePack)
    && activeThemes.has(question.themePack!.toLowerCase().trim());
}

/**
 * Le tour en cours peut-il servir une carte des thèmes actifs ? `served`
 * compte les cartes déjà posées, `fromPack` celles qui venaient d'un thème.
 *
 * L'ancienne cadence fixe — une carte tous les trois tours, exactement —
 * rendait le tirage prévisible : la table savait quand le thème allait
 * tomber. Le hasard décide désormais du moment, entre deux bornes :
 *
 * - plafond : jamais plus d'une carte sur deux, et jamais la toute première
 *   carte de la partie — elle revient à la banque officielle ;
 * - plancher : jamais plus de deux cartes de retard sur la part cible, pour
 *   que les thèmes sortent tôt même quand le hasard boude (au plus tard à la
 *   sixième carte, si une carte du thème correspond à la case et au niveau).
 */
export function customPackTurnIsDue(
  served: number,
  fromPack: number,
  random: Random = Math.random,
): boolean {
  if ((fromPack + 1) / (served + 1) > CUSTOM_PACK_MAX_SHARE) return false;

  const deficit = (served + 1) * CUSTOM_PACK_TARGET_SHARE - fromPack;
  if (deficit >= 2) return true;
  if (deficit <= 0) return false;
  return random() < CUSTOM_PACK_TARGET_SHARE;
}

/**
 * Le tour en cours doit-il servir une carte à format varié ? Même logique que
 * pour les thèmes, avec une part plus basse : `served` compte les cartes déjà
 * posées, `fromVariable` celles qui étaient en vrai/faux ou ouvertes.
 */
export function variableFormatTurnIsDue(
  served: number,
  fromVariable: number,
  random: Random = Math.random,
): boolean {
  if ((fromVariable + 1) / (served + 1) > VARIABLE_FORMAT_MAX_SHARE) return false;

  const deficit = (served + 1) * VARIABLE_FORMAT_TARGET_SHARE - fromVariable;
  if (deficit >= 2) return true;
  if (deficit <= 0) return false;
  return random() < VARIABLE_FORMAT_TARGET_SHARE;
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
  const activeThemes = activeThemeKeys(state.settings);
  const usedIds = new Set(state.usedQuestionIds);
  const pickOne = (list: Question[]): Question => list[Math.floor(random() * list.length)];

  // Les questions ouvertes n'apparaissent qu'en mode lecteur : hors de ce mode,
  // la solution est masquée au joueur actif et personne ne pourrait juger sa
  // réponse orale. Le garde-fou vaut pour les packs IA comme pour la banque.
  const readerMode = state.settings.isReaderMode === true;
  const servableFormat = (question: Question): boolean =>
    !((question.format ?? 'mcq') === 'open' && !readerMode);

  const serve = (question: Question, categoryId: CategoryId): Question => {
    state.usedQuestionIds.push(question.id);
    return shuffleQuestionOptions({ ...question, categoryId }, random);
  };

  // 1. Thèmes IA actifs : une carte d'un des packs, à leur part commune et
  //    seulement si elle correspond vraiment à la case et au niveau du
  //    joueur. Faute de quoi, la banque officielle reprend la main — sans
  //    jamais déguiser la catégorie d'une carte ni servir une question
  //    adulte à un enfant.
  if (activeThemes.size > 0) {
    const packQuestions = state.questionsPool.filter(
      (question) => belongsToActiveTheme(question, activeThemes),
    );
    const servedFromPack = packQuestions.filter((question) => usedIds.has(question.id)).length;

    if (customPackTurnIsDue(state.usedQuestionIds.length, servedFromPack, random)) {
      const candidates = packQuestions.filter(
        (question) => !usedIds.has(question.id)
          && normalizeCategoryId(question.categoryId) === targetCategory
          && question.difficulty === playerDifficulty
          && servableFormat(question),
      );
      if (candidates.length > 0) {
        return serve(pickOne(candidates), targetCategory);
      }
    }
  }

  // 1.5 Formats variés (adulte). On garantit une part régulière de vrai/faux et
  //     de questions ouvertes : trente cartes noyées parmi 3 200 QCM ne
  //     sortaient sinon quasiment jamais. Elles priment sur la banque QCM quand
  //     c'est leur tour, à condition de coller à la case, d'être servables (les
  //     ouvertes hors mode lecteur sont écartées) et hors thème actif.
  if (playerDifficulty === 'adulte') {
    const isVariable = (question: Question): boolean => (question.format ?? 'mcq') !== 'mcq';
    const servedVariable = state.questionsPool.filter(
      (question) => isVariable(question) && usedIds.has(question.id),
    ).length;
    if (variableFormatTurnIsDue(state.usedQuestionIds.length, servedVariable, random)) {
      const candidates = state.questionsPool.filter(
        (question) => isVariable(question)
          && question.difficulty === 'adulte'
          && normalizeCategoryId(question.categoryId) === targetCategory
          && servableFormat(question)
          && (activeThemes.size === 0 || !belongsToActiveTheme(question, activeThemes)),
      );
      const fresh = candidates.filter((question) => !usedIds.has(question.id));
      const chosen = fresh.length > 0 ? fresh : candidates;
      if (chosen.length > 0) {
        return serve(pickOne(chosen), targetCategory);
      }
    }
  }

  // 2. Banque officielle. Les thèmes actifs en sont exclus : leur part est
  //    déjà tenue par l'étape 1, et un second tirage la ferait déborder.
  const isEligible = (question: Question): boolean => {
    if (!servableFormat(question)) return false;
    return activeThemes.size === 0 || !belongsToActiveTheme(question, activeThemes);
  };

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
