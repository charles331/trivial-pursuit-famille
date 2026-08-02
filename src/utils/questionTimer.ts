/** Durées proposées dans le salon, en secondes. Zéro désactive le chrono. */
export const QUESTION_TIMER_OPTIONS = [30, 60, 90, 0] as const;

/**
 * La durée choisie par l'organisateur s'applique telle quelle dans tous les
 * modes de jeu. Le passage de l'appareil en mode lecteur est géré séparément :
 * le décompte ne démarre qu'une fois le lecteur prêt.
 */
export function resolveQuestionTimerSeconds(timerSeconds: number): number {
  return timerSeconds;
}
