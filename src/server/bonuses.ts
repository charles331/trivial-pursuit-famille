import { BonusType, CategoryId, GameState, Player } from '../types';

export const FIFTY_FIFTY_BONUS = 'fifty_fifty' as const;
export const CAMEMBERT_JOKER_BONUS = 'camembert_joker' as const;

/** Bonus qu'un joueur peut détenir et utiliser. */
export const BONUS_ROSTER: BonusType[] = [FIFTY_FIFTY_BONUS, CAMEMBERT_JOKER_BONUS];

/**
 * Les six quartiers de la roue surprise, dans l'ordre. On ne gagne pas à tous
 * les coups : deux quartiers sont vides (`null`). Cette disposition est la
 * source de vérité partagée par le serveur (qui tire le résultat) et par le
 * client (qui dessine la roue et l'arrête sur le bon quartier).
 */
export const SURPRISE_WHEEL: (BonusType | null)[] = [
  FIFTY_FIFTY_BONUS,
  null,
  FIFTY_FIFTY_BONUS,
  CAMEMBERT_JOKER_BONUS,
  FIFTY_FIFTY_BONUS,
  null,
];

/**
 * Le Joker camembert peut-il encore rapporter quelque chose à ce joueur ?
 *
 * Signalé en partie : « j'ai gagné un joker pour avoir un camembert, mais je les
 * ai déjà tous ». Le joker ne faisait alors rien du tout — et pire, il était
 * consommé en silence, puisque `resolveAnswer` n'ajoute un camembert que si le
 * joueur ne l'a pas déjà. Un bonus qui se dépense sans effet est une punition
 * déguisée en récompense.
 *
 * Deux cas où il ne sert à rien :
 *  - le joueur a déjà tous les camemberts qu'il lui faut pour gagner ;
 *  - il possède déjà celui de la catégorie posée à ce tour-ci — le joker le
 *    rejouerait à vide, alors qu'il vaudra son prix sur une autre case.
 *
 * La case camembert n'est volontairement pas exclue : le joker y ferait doublon,
 * mais le joueur qui l'arme quand même n'y perd rien, la bonne réponse lui
 * rapportant de toute façon le camembert.
 */
export function jokerCanEarnWedge(
  wedges: readonly CategoryId[],
  questionCategoryId: CategoryId,
  wedgesToWin: number,
): boolean {
  if (wedges.length >= wedgesToWin) return false;
  return !wedges.includes(questionCategoryId);
}

export function bonusCount(player: Player, type: BonusType): number {
  const count = player.bonuses?.[type];
  return Number.isInteger(count) && (count ?? 0) > 0 ? count! : 0;
}

/** Rétrocompatibilité : le décompte de 50/50, encore lu par l'interface. */
export function fiftyFiftyCount(player: Player): number {
  return bonusCount(player, FIFTY_FIFTY_BONUS);
}

/**
 * Sur quel quartier la roue doit s'arrêter pour annoncer ce résultat.
 *
 * Deux quartiers portent le même 50/50 et deux sont vides : le choix appartient
 * donc au serveur, une fois pour toute la table. Chaque client le tirait de son
 * côté, et la roue s'arrêtait ailleurs selon l'écran — un joueur voyait le 🎯 du
 * premier quartier, son voisin celui du troisième, pour le même bonus.
 */
export function wheelSlotFor(
  outcome: BonusType | null,
  random: () => number = Math.random,
): number {
  const quarters = SURPRISE_WHEEL
    .map((slot, index) => (slot === outcome ? index : -1))
    .filter((index) => index >= 0);
  return quarters[Math.floor(random() * quarters.length)] ?? 0;
}

/**
 * Une case Surprise fait tourner la roue. Elle tombe au hasard sur l'un des six
 * quartiers : un bonus est alors crédité, ou rien du tout si le quartier est
 * vide. Renvoie le résultat (le bonus, ou `null` pour une case vide) ; renvoie
 * aussi `null` quand le mode bonus est désactivé — on distingue les deux via
 * `state.surpriseSpinThisTurn`, positionné uniquement lorsqu'une roue tourne.
 */
export function awardSurpriseBonus(
  state: GameState,
  random: () => number = Math.random,
): BonusType | null {
  if (state.settings.enableBonuses !== true) return null;
  const player = state.players[state.activePlayerIndex];
  if (!player) return null;

  const drawn = SURPRISE_WHEEL[Math.floor(random() * SURPRISE_WHEEL.length)] ?? null;
  // La roue ne remet pas un lot mort. Le joueur qui a déjà tous ses camemberts
  // n'a plus rien à en faire : il repart avec un 50/50, utile jusqu'au bout.
  // Le quartier visé par l'animation suit, le client cherchant un quartier du
  // type annoncé dans `bonusAwardedThisTurn`.
  const outcome = drawn === CAMEMBERT_JOKER_BONUS
    && player.wedges.length >= state.settings.wedgesToWin
    ? FIFTY_FIFTY_BONUS
    : drawn;
  if (outcome) {
    player.bonuses = {
      ...player.bonuses,
      [outcome]: bonusCount(player, outcome) + 1,
    };
  }
  state.bonusAwardedThisTurn = outcome;
  state.surpriseSpinThisTurn = true;
  state.surpriseWheel = { slot: wheelSlotFor(outcome, random), startedAt: null };
  return outcome;
}

/**
 * Consomme un bonus conservé et l'arme sur la question en cours. Renvoie false
 * si le bonus ne peut pas être utilisé dans l'état courant.
 *
 * - `fifty_fifty` : choisit côté serveur deux mauvaises réponses à masquer, si
 *   bien que la bonne réponse n'a jamais besoin d'être envoyée au client du
 *   joueur. Réservé de fait aux QCM (il faut au moins deux distracteurs).
 * - `camembert_joker` : s'arme simplement ; la résolution de la réponse le lit
 *   au moment de décerner le camembert. Compatible avec tous les formats.
 */
export function useBonus(
  state: GameState,
  type: BonusType,
  random: () => number = Math.random,
): boolean {
  if (state.settings.enableBonuses !== true || state.phase !== 'question') return false;
  if (!state.currentQuestion || state.activeQuestionBonus) return false;

  const player = state.players[state.activePlayerIndex];
  if (!player || bonusCount(player, type) < 1) return false;

  let hiddenOptionIndexes: number[] = [];

  if (type === FIFTY_FIFTY_BONUS) {
    const wrongIndexes = state.currentQuestion.options
      .map((_, index) => index)
      .filter(index => index !== state.currentQuestion!.correctAnswerIndex);
    if (wrongIndexes.length < 2) return false;

    for (let index = wrongIndexes.length - 1; index > 0; index -= 1) {
      const swapWith = Math.floor(random() * (index + 1));
      [wrongIndexes[index], wrongIndexes[swapWith]] = [wrongIndexes[swapWith], wrongIndexes[index]];
    }
    hiddenOptionIndexes = wrongIndexes.slice(0, 2).sort((a, b) => a - b);
  } else if (type === CAMEMBERT_JOKER_BONUS) {
    // Un joker qui ne peut rien rapporter n'est pas consommé : il reste en poche
    // pour une case dont le camembert manque encore.
    if (!jokerCanEarnWedge(
      player.wedges,
      state.currentQuestion.categoryId,
      state.settings.wedgesToWin,
    )) {
      return false;
    }
  } else {
    return false;
  }

  player.bonuses = {
    ...player.bonuses,
    [type]: bonusCount(player, type) - 1,
  };
  state.activeQuestionBonus = { type, playerId: player.id, hiddenOptionIndexes };
  return true;
}

/** Rétrocompatibilité : arme un 50/50 (raccourci pour `useBonus`). */
export function useFiftyFiftyBonus(
  state: GameState,
  random: () => number = Math.random,
): boolean {
  return useBonus(state, FIFTY_FIFTY_BONUS, random);
}
