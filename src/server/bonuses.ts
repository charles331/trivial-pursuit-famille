import { BonusType, GameState, Player } from '../types';

export const FIFTY_FIFTY_BONUS = 'fifty_fifty' as const;
export const CAMEMBERT_JOKER_BONUS = 'camembert_joker' as const;

/**
 * Bonus que la case Surprise peut offrir. La case tire au hasard dans cette
 * liste : elle redevient une vraie boîte mystère plutôt qu'un distributeur de
 * 50/50.
 */
export const BONUS_ROSTER: BonusType[] = [FIFTY_FIFTY_BONUS, CAMEMBERT_JOKER_BONUS];

export function bonusCount(player: Player, type: BonusType): number {
  const count = player.bonuses?.[type];
  return Number.isInteger(count) && (count ?? 0) > 0 ? count! : 0;
}

/** Rétrocompatibilité : le décompte de 50/50, encore lu par l'interface. */
export function fiftyFiftyCount(player: Player): number {
  return bonusCount(player, FIFTY_FIFTY_BONUS);
}

/**
 * Une case Surprise crédite un bonus tiré au hasard, sans l'utiliser
 * automatiquement. Renvoie le type offert, ou `null` si rien n'a été donné.
 */
export function awardSurpriseBonus(
  state: GameState,
  random: () => number = Math.random,
): BonusType | null {
  if (state.settings.enableBonuses !== true) return null;
  const player = state.players[state.activePlayerIndex];
  if (!player) return null;

  const type = BONUS_ROSTER[Math.floor(random() * BONUS_ROSTER.length)] ?? FIFTY_FIFTY_BONUS;
  player.bonuses = {
    ...player.bonuses,
    [type]: bonusCount(player, type) + 1,
  };
  state.bonusAwardedThisTurn = type;
  return type;
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
