/**
 * Who plays which part during a question, shared by the server and the client.
 *
 * A question turn has two speaking roles and any number of onlookers:
 *
 *  - the **answerer**: the active player, who has to answer;
 *  - the **reader**: the player seated just *before* the answerer, who reads the
 *    card out loud to them;
 *  - the **spectators**: everybody else, who watch and listen.
 *
 * The reader is the preceding player and not the following one, so that the
 * player who just finished their own turn hands the card over to the next one —
 * the table order then reads naturally around the board.
 *
 * Both sides must agree on this, otherwise the server would open a microphone
 * for someone the client never displays as the reader. Hence a single module,
 * imported by `gameStateView`, by the socket handlers and by the live camera.
 */

import { GameSettings } from '../types';

/**
 * True when the card is read out loud by the reader instead of being shown to
 * the answerer.
 *
 * Turning the live camera on implies it. The two settings used to be
 * independent, which produced the combination players actually hit: a
 * microphone open for the one person who had nothing to say, while the answerer
 * simply read the question off their own screen. Opening the reader's
 * microphone only makes sense for a card the answerer cannot see.
 */
export function isCardReadAloud(
  settings: Pick<GameSettings, 'isReaderMode' | 'enableLiveCamera'>,
): boolean {
  return settings.isReaderMode === true || settings.enableLiveCamera === true;
}

/** Minimal player shape needed to resolve roles. */
export interface TurnRolePlayer {
  id: string;
  isConnected: boolean;
}

export type LiveRole = 'answerer' | 'reader' | 'spectator';

/**
 * Index of the player who reads the card out loud, or `null` when nobody can.
 *
 * Walks backwards from the active player and skips disconnected players: with a
 * masked card, a reader who dropped out of the game would leave the answerer
 * staring at four blank options with nobody able to read them.
 */
export function resolveReaderIndex(
  players: readonly TurnRolePlayer[],
  activePlayerIndex: number,
): number | null {
  const count = players.length;
  if (count < 2) return null;
  if (activePlayerIndex < 0 || activePlayerIndex >= count) return null;

  for (let step = 1; step < count; step += 1) {
    const index = ((activePlayerIndex - step) % count + count) % count;
    const candidate = players[index];
    if (candidate && candidate.isConnected) return index;
  }

  return null;
}

/** The reader's id, or `null` when no connected player can take the part. */
export function resolveReaderId(
  players: readonly TurnRolePlayer[],
  activePlayerIndex: number,
): string | null {
  const index = resolveReaderIndex(players, activePlayerIndex);
  return index === null ? null : players[index]?.id ?? null;
}

/**
 * The part a given player takes in the current turn.
 *
 * `answerer` wins over `reader`: in a one-player room the same id would match
 * both, and the active player must never be handed the solution.
 */
export function resolveLiveRole(
  players: readonly TurnRolePlayer[],
  activePlayerIndex: number,
  playerId: string | null | undefined,
): LiveRole {
  if (!playerId) return 'spectator';
  if (players[activePlayerIndex]?.id === playerId) return 'answerer';
  return resolveReaderId(players, activePlayerIndex) === playerId ? 'reader' : 'spectator';
}

/**
 * The two players whose camera and microphone are open during the question.
 *
 * Everyone receives their streams; nobody else sends anything. Keeping the list
 * in one place is what stops the server's authorisation checks and the client's
 * peer connections from disagreeing about who is on air.
 */
export function resolveOnAirIds(
  players: readonly TurnRolePlayer[],
  activePlayerIndex: number,
): string[] {
  const answererId = players[activePlayerIndex]?.id ?? null;
  const readerId = resolveReaderId(players, activePlayerIndex);
  return [answererId, readerId].filter((id): id is string => typeof id === 'string');
}
