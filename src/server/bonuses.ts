import { GameState, Player } from '../types';

export const FIFTY_FIFTY_BONUS = 'fifty_fifty' as const;

export function fiftyFiftyCount(player: Player): number {
  const count = player.bonuses?.[FIFTY_FIFTY_BONUS];
  return Number.isInteger(count) && (count ?? 0) > 0 ? count! : 0;
}

/** Une case Surprise crédite un 50/50, sans l'utiliser automatiquement. */
export function awardSurpriseBonus(state: GameState): boolean {
  if (state.settings.enableBonuses !== true) return false;
  const player = state.players[state.activePlayerIndex];
  if (!player) return false;

  player.bonuses = {
    ...player.bonuses,
    [FIFTY_FIFTY_BONUS]: fiftyFiftyCount(player) + 1,
  };
  state.bonusAwardedThisTurn = FIFTY_FIFTY_BONUS;
  return true;
}

/**
 * Consomme un 50/50 et choisit côté serveur deux mauvaises réponses à masquer.
 * Renvoie false si le bonus ne peut pas être utilisé dans l'état courant.
 */
export function useFiftyFiftyBonus(
  state: GameState,
  random: () => number = Math.random,
): boolean {
  if (state.settings.enableBonuses !== true || state.phase !== 'question') return false;
  if (!state.currentQuestion || state.activeQuestionBonus) return false;

  const player = state.players[state.activePlayerIndex];
  if (!player || fiftyFiftyCount(player) < 1) return false;

  const wrongIndexes = state.currentQuestion.options
    .map((_, index) => index)
    .filter(index => index !== state.currentQuestion!.correctAnswerIndex);
  if (wrongIndexes.length < 2) return false;

  for (let index = wrongIndexes.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [wrongIndexes[index], wrongIndexes[swapWith]] = [wrongIndexes[swapWith], wrongIndexes[index]];
  }

  player.bonuses = {
    ...player.bonuses,
    [FIFTY_FIFTY_BONUS]: fiftyFiftyCount(player) - 1,
  };
  state.activeQuestionBonus = {
    type: FIFTY_FIFTY_BONUS,
    playerId: player.id,
    hiddenOptionIndexes: wrongIndexes.slice(0, 2).sort((a, b) => a - b),
  };
  return true;
}
