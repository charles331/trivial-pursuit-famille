import { FirstPlayerRoll, GameState, Player } from '../types';

/**
 * Tirage au sort d'ouverture.
 *
 * L'organisateur ouvrait automatiquement la partie, ce qui lui donnait un
 * avantage systématique. Désormais chaque joueur lance le dé une seule fois :
 * le plus haut commence et, à égalité, c'est le plus rapide qui l'emporte.
 *
 * « Le plus rapide » se mesure par joueur, à partir du moment où il a
 * réellement pu lancer :
 *
 * - en ligne, tout le monde lance en même temps, l'origine est l'ouverture du
 *   tirage ;
 * - en pass & play, les joueurs se passent l'appareil, l'origine est donc le
 *   lancer précédent — sinon le premier à saisir le téléphone gagnerait toutes
 *   les égalités.
 *
 * L'ordre des joueurs, lui, ne change pas : seul le point de départ du tour de
 * table se déplace sur le vainqueur du tirage.
 */

/**
 * Un joueur déconnecté ne doit pas bloquer le tirage : on ne l'attend plus.
 * Les joueurs locaux du pass & play sont toujours attendus, y compris dans une
 * partie rechargée depuis le disque, où plus personne n'est marqué connecté.
 */
export function isExpectedToRoll(player: Player): boolean {
  return player.isConnected || player.id.startsWith('local_');
}

/** Les joueurs attendus qui n'ont pas encore lancé, dans l'ordre de la table. */
export function pendingRollers(state: GameState): Player[] {
  const draw = state.firstPlayerDraw;
  if (!draw) return [];

  const alreadyRolled = new Set(draw.rolls.map(roll => roll.playerId));
  return state.players.filter(player => isExpectedToRoll(player) && !alreadyRolled.has(player.id));
}

/** Ouvre le tirage : plus personne n'est premier joueur tant qu'il n'est pas tranché. */
export function beginFirstPlayerDraw(state: GameState, now: number): void {
  state.phase = 'first_player_roll';
  state.firstPlayerDraw = { startedAt: now, lastRollAt: null, rolls: [], winnerId: null };
  state.activePlayerIndex = 0;
  state.diceValue = null;
  state.possibleMoves = [];
  state.selectedTileId = null;
  state.currentQuestion = null;
  state.lastAnswerResult = null;
  state.lastTurnEventMessage = null;
}

/** Désigne d'office le premier joueur, pour une partie qui n'a rien à départager. */
export function skipFirstPlayerDraw(state: GameState): void {
  state.phase = 'rolling';
  state.firstPlayerDraw = null;
  state.activePlayerIndex = 0;
  state.diceValue = null;
  state.possibleMoves = [];
  state.lastTurnEventMessage = null;
}

/**
 * Enregistre le lancer unique d'un joueur. Un deuxième lancer est refusé : c'est
 * ce qui garantit qu'on ne relance pas jusqu'à obtenir le 6 qui arrange.
 */
export function recordFirstPlayerRoll(
  state: GameState,
  playerId: string,
  value: number,
  now: number,
): boolean {
  const draw = state.firstPlayerDraw;
  if (state.phase !== 'first_player_roll' || !draw || draw.winnerId) return false;
  if (draw.rolls.some(roll => roll.playerId === playerId)) return false;

  const player = state.players.find(candidate => candidate.id === playerId);
  if (!player || !isExpectedToRoll(player)) return false;

  const openedAt = state.settings.isLocalMode ? draw.lastRollAt ?? draw.startedAt : draw.startedAt;
  draw.rolls.push({
    playerId,
    value,
    elapsedMs: Math.max(0, now - openedAt),
    order: draw.rolls.length,
  });
  draw.lastRollAt = now;
  return true;
}

/** Le plus haut d'abord ; à égalité le plus rapide, puis le premier arrivé. */
export function rankFirstPlayerRolls(rolls: FirstPlayerRoll[]): FirstPlayerRoll[] {
  return [...rolls].sort((left, right) => (
    right.value - left.value
    || left.elapsedMs - right.elapsedMs
    || left.order - right.order
  ));
}

function formatSeconds(elapsedMs: number): string {
  return `${(elapsedMs / 1000).toFixed(1).replace('.', ',')} s`;
}

function nameOf(state: GameState, playerId: string): string {
  return state.players.find(player => player.id === playerId)?.name || 'Un joueur';
}

/** Le récit du tirage, affiché en bandeau au premier tour. */
export function describeFirstPlayerDraw(state: GameState): string {
  const draw = state.firstPlayerDraw;
  const ranked = rankFirstPlayerRolls(draw?.rolls ?? []);
  const winner = ranked[0];
  if (!winner) return '';

  const winnerName = nameOf(state, winner.playerId);
  const tied = ranked.filter(roll => roll.value === winner.value && roll.playerId !== winner.playerId);
  if (tied.length === 0) {
    return `🎲 Tirage au sort : ${winnerName} ouvre la partie avec un ${winner.value}.`;
  }

  const tiedNames = tied.map(roll => nameOf(state, roll.playerId)).join(', ');
  return `🎲 Égalité à ${winner.value} avec ${tiedNames} : ${winnerName} ouvre la partie, `
    + `plus rapide en ${formatSeconds(winner.elapsedMs)}.`;
}

/**
 * Tranche le tirage dès que tous les joueurs attendus ont lancé, et place le
 * vainqueur en premier. `force` sert à l'organisateur quand un joueur ne lance
 * jamais : on départage alors entre les lancers déjà enregistrés.
 */
export function settleFirstPlayerDraw(state: GameState, options: { force?: boolean } = {}): boolean {
  const draw = state.firstPlayerDraw;
  if (state.phase !== 'first_player_roll' || !draw || draw.winnerId) return false;
  if (draw.rolls.length === 0) return false;
  if (!options.force && pendingRollers(state).length > 0) return false;

  const winner = rankFirstPlayerRolls(draw.rolls)[0];
  const winnerIndex = state.players.findIndex(player => player.id === winner.playerId);
  if (winnerIndex < 0) return false;

  draw.winnerId = winner.playerId;
  state.activePlayerIndex = winnerIndex;
  state.phase = 'rolling';
  state.diceValue = null;
  state.possibleMoves = [];
  state.lastTurnEventMessage = describeFirstPlayerDraw(state);
  return true;
}

/** Un joueur parti pendant le tirage emporte son lancer avec lui. */
export function purgeFirstPlayerRoll(state: GameState, playerId: string): void {
  const draw = state.firstPlayerDraw;
  if (!draw) return;

  draw.rolls = draw.rolls.filter(roll => roll.playerId !== playerId);
}

/**
 * Une reconnexion change l'identifiant de socket du joueur : son lancer le suit,
 * sinon il devrait relancer et son premier résultat resterait orphelin.
 */
export function transferFirstPlayerRoll(state: GameState, oldPlayerId: string, newPlayerId: string): void {
  const draw = state.firstPlayerDraw;
  if (!draw || oldPlayerId === newPlayerId) return;

  for (const roll of draw.rolls) {
    if (roll.playerId === oldPlayerId) roll.playerId = newPlayerId;
  }
  if (draw.winnerId === oldPlayerId) draw.winnerId = newPlayerId;
}
