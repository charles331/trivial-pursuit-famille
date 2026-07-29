/**
 * Le lancé d'ouverture : qui commence la partie.
 *
 * Le siège du créateur du salon décidait l'ordre du jeu — `activePlayerIndex`
 * partait à 0, et le joueur 0 est l'hôte. Le premier tour, qui vaut un
 * camembert d'avance, était donc un privilège d'organisateur.
 *
 * Chaque joueur lance désormais un dé une fois. Le plus haut score ouvre la
 * partie. En cas d'égalité, seuls les joueurs à égalité relancent, autant de
 * manches que nécessaire — c'est le geste qu'on ferait autour d'une table.
 *
 * Tout est ici en fonctions pures : le hasard et les sockets restent dans
 * `server.ts`, et ces règles se testent sans salon ni réseau.
 */

/** Ce que le lancé d'ouverture a besoin de savoir d'un joueur. */
export interface OpeningRollPlayer {
  id: string;
  isConnected: boolean;
}

export interface OpeningRollState {
  /** Les jets de la manche en cours, par joueur. */
  rolls: Record<string, number>;
  /** Les joueurs encore en lice pour cette manche. */
  contenders: string[];
  /** Numéro de manche, à partir de 1. Au-delà de 1, on départage une égalité. */
  round: number;
  /** Renseigné dès qu'un seul joueur domine. */
  winnerId: string | null;
  /** Les joueurs à égalité de la manche précédente, pour l'annoncer à l'écran. */
  tiedIds: string[];
}

/**
 * Qui participe au lancé.
 *
 * En ligne, seuls les joueurs connectés : un absent ne doit pas retenir la
 * partie. En pass & play, tous les sièges, l'hôte lançant pour chacun à son
 * tour.
 */
export function openingContenders(
  players: readonly OpeningRollPlayer[],
  isLocalMode: boolean,
): string[] {
  const eligible = isLocalMode ? players : players.filter(player => player.isConnected);
  return eligible.map(player => player.id);
}

export function createOpeningRoll(contenders: readonly string[]): OpeningRollState {
  return { rolls: {}, contenders: [...contenders], round: 1, winnerId: null, tiedIds: [] };
}

/** Le prochain siège dont le jet est attendu, ou `null` si la manche est complète. */
export function pendingRollerId(state: OpeningRollState): string | null {
  return state.contenders.find(id => !(id in state.rolls)) ?? null;
}

/**
 * Enregistre un jet. Renvoie `false` — et ne touche à rien — pour un joueur qui
 * n'est pas en lice ou qui a déjà lancé : un double clic ne doit pas lui offrir
 * une seconde chance.
 */
export function recordOpeningRoll(
  state: OpeningRollState,
  playerId: string,
  value: number,
): boolean {
  if (state.winnerId) return false;
  if (!state.contenders.includes(playerId)) return false;
  if (playerId in state.rolls) return false;

  state.rolls[playerId] = value;
  return true;
}

/**
 * Écarte les joueurs partis en cours de lancé.
 *
 * Sans cela, une déconnexion pendant le lancé d'ouverture gèle la partie : on
 * attendrait indéfiniment le jet de quelqu'un qui ne reviendra pas.
 */
export function pruneOpeningRoll(
  state: OpeningRollState,
  isStillIn: (playerId: string) => boolean,
): void {
  if (state.winnerId) return;

  const remaining = state.contenders.filter(isStillIn);
  // Ne jamais vider la liste : un salon momentanément vide reprendrait le lancé
  // à zéro plutôt que d'attendre le retour des joueurs.
  if (remaining.length === 0) return;

  state.contenders = remaining;
  for (const id of Object.keys(state.rolls)) {
    if (!remaining.includes(id)) delete state.rolls[id];
  }
}

/**
 * Suit un joueur qui revient sous un nouvel identifiant.
 *
 * Le serveur réattribue `player.id` à la reconnexion — et iOS reconnecte au
 * moindre passage en arrière-plan. Sans ce report, le joueur revenu n'est plus
 * en lice, son jet est perdu, et si c'était le dernier jet attendu le lancé
 * n'aboutit jamais.
 */
export function remapOpeningRollId(
  state: OpeningRollState,
  oldId: string,
  newId: string,
): void {
  if (oldId === newId) return;

  state.contenders = state.contenders.map(id => (id === oldId ? newId : id));
  state.tiedIds = state.tiedIds.map(id => (id === oldId ? newId : id));
  if (state.winnerId === oldId) state.winnerId = newId;

  if (oldId in state.rolls) {
    state.rolls[newId] = state.rolls[oldId];
    delete state.rolls[oldId];
  }
}

/**
 * N'écarte les absents que si la manche ne peut plus avancer sans eux.
 *
 * Purger dès la déconnexion éliminait un joueur pour un simple rafraîchissement
 * de page — et iOS reconnecte au moindre passage en arrière-plan. On attend donc
 * qu'il ne reste plus que des absents à lancer : tant qu'un joueur présent doit
 * encore lancer, la place de l'absent lui est gardée, et son retour la récupère
 * via `remapOpeningRollId`.
 *
 * Renvoie `true` si des joueurs ont été écartés.
 */
export function unblockOpeningRoll(
  state: OpeningRollState,
  isPresent: (playerId: string) => boolean,
): boolean {
  if (state.winnerId) return false;

  const pending = state.contenders.filter(id => !(id in state.rolls));
  if (pending.length === 0) return false;
  // Quelqu'un de présent doit encore lancer : la manche avance d'elle-même.
  if (pending.some(isPresent)) return false;

  const before = state.contenders.length;
  pruneOpeningRoll(state, isPresent);
  return state.contenders.length !== before;
}

export type OpeningRollOutcome = 'waiting' | 'tie' | 'won';

/**
 * Clôt la manche dès que tout le monde a lancé.
 *
 * - `waiting` : il manque au moins un jet.
 * - `tie` : plusieurs meilleurs jets, une nouvelle manche démarre entre eux.
 * - `won` : `state.winnerId` est renseigné.
 */
export function settleOpeningRoll(state: OpeningRollState): OpeningRollOutcome {
  if (state.winnerId) return 'won';
  if (state.contenders.length === 0) return 'waiting';

  // Un seul joueur en lice — les autres ont quitté : il ouvre la partie, avec
  // son jet s'il en a un, sans attendre un lancé qui n'a plus d'adversaire.
  if (state.contenders.length === 1) {
    const [only] = state.contenders;
    if (!(only in state.rolls)) return 'waiting';
    state.winnerId = only;
    state.tiedIds = [];
    return 'won';
  }

  if (pendingRollerId(state) !== null) return 'waiting';

  const best = Math.max(...state.contenders.map(id => state.rolls[id]));
  const leaders = state.contenders.filter(id => state.rolls[id] === best);

  if (leaders.length === 1) {
    state.winnerId = leaders[0];
    state.tiedIds = [];
    return 'won';
  }

  state.tiedIds = leaders;
  state.contenders = leaders;
  state.rolls = {};
  state.round += 1;
  return 'tie';
}

/** Le classement de la manche, meilleur jet d'abord, pour l'affichage. */
export function openingRollStandings(
  state: OpeningRollState,
): { playerId: string; roll: number | null }[] {
  return state.contenders
    .map(playerId => ({ playerId, roll: state.rolls[playerId] ?? null }))
    .sort((a, b) => (b.roll ?? -1) - (a.roll ?? -1));
}
