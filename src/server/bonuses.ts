import { BonusType, GameState, Player } from '../types';

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

export function bonusCount(player: Player, type: BonusType): number {
  const count = player.bonuses?.[type];
  return Number.isInteger(count) && (count ?? 0) > 0 ? count! : 0;
}

/** Rétrocompatibilité : le décompte de 50/50, encore lu par l'interface. */
export function fiftyFiftyCount(player: Player): number {
  return bonusCount(player, FIFTY_FIFTY_BONUS);
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

  const outcome = SURPRISE_WHEEL[Math.floor(random() * SURPRISE_WHEEL.length)] ?? null;
  if (outcome) {
    player.bonuses = {
      ...player.bonuses,
      [outcome]: bonusCount(player, outcome) + 1,
    };
  }
  state.bonusAwardedThisTurn = outcome;
  state.surpriseSpinThisTurn = true;
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
  } else if (type !== CAMEMBERT_JOKER_BONUS) {
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
