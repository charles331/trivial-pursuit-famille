import { GameState, Player } from '../types';
import { purgeFirstPlayerRoll, transferFirstPlayerRoll } from './firstPlayerDraw';
import { removePlayerFromGame } from './gameEngine';

/**
 * Le siège d'un joueur, et comment le lui rendre après une coupure.
 *
 * L'identité d'un joueur, ici, *est* son identifiant de socket. Une coupure de
 * réseau en donne un nouveau, et la seule passerelle entre l'ancien et le
 * nouveau est le jeton de session rangé dans le `localStorage` du navigateur
 * (voir `reconnect-session`). Ce jeton est un bon mécanisme, mais il est lié à un
 * navigateur : rouvrir le lien d'invitation depuis une autre application — le
 * navigateur intégré d'une messagerie, par exemple — ou depuis un onglet privé
 * arrive dans une page qui ne sait rien de la partie en cours.
 *
 * Il ne restait alors qu'une porte : `join-room`, qui créait un joueur neuf. Une
 * partie réelle s'est terminée avec deux « Christelle » — l'ancienne déconnectée
 * avec ses quatre camemberts, la nouvelle à zéro — sans aucun moyen de les
 * réunir. D'où les deux fonctions ci-dessous : reconnaître un siège abandonné
 * pour y ramener son occupant, et fusionner un doublon déjà créé.
 */

/**
 * Deux prénoms désignent la même personne s'ils ne diffèrent que par la casse,
 * les accents ou les espaces : au clavier d'un téléphone, « christelle » et
 * « Christelle » sont la même personne qui revient.
 */
export function normalizeSeatName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Le bandeau annonce à la table ce que la personne récupère. Une partie qui vient
 * de commencer n'a pas de camembert à annoncer : « et ses 0 camembert » se lit mal
 * et inquiète pour rien.
 */
export function describeRecoveredSeat(name: string, wedgeCount: number): string {
  if (wedgeCount === 0) return `${name} a retrouvé sa place.`;
  if (wedgeCount === 1) return `${name} a retrouvé sa place et son camembert.`;
  return `${name} a retrouvé sa place et ses ${wedgeCount} camemberts.`;
}

/**
 * Le siège laissé vacant par quelqu'un qui portait ce prénom, s'il n'y a pas
 * d'ambiguïté.
 *
 * Deux sièges déconnectés au même prénom ne se départagent pas tout seuls : on
 * préfère alors laisser l'organisateur trancher plutôt que de deviner et de
 * donner les camemberts de l'un à l'autre. Les joueurs du pass & play sont
 * exclus : ils partagent l'appareil de l'organisateur et ne se reconnectent pas.
 */
export function findAbandonedSeat(state: GameState, name: string): Player | null {
  const wanted = normalizeSeatName(name || '');
  if (!wanted) return null;

  const matches = state.players.filter(player => (
    !player.isConnected
    && !player.id.startsWith('local_')
    && normalizeSeatName(player.name) === wanted
  ));

  return matches.length === 1 ? matches[0] : null;
}

/**
 * Fusionne un doublon dans le siège qu'il aurait dû retrouver : l'appareil du
 * doublon reprend le siège d'origine — camemberts, pion, score, statistiques —
 * et le doublon disparaît de la table.
 *
 * C'est bien le siège d'origine qu'on garde, pas le nouveau : c'est lui qui
 * porte la partie déjà jouée. Le doublon n'apporte que son socket.
 *
 * Renvoie l'identifiant que portait le siège avant la fusion (utile à l'appelant
 * pour ses propres registres), ou `null` si la fusion n'a pas lieu d'être.
 */
export function mergeSeatInto(
  state: GameState,
  /** Le doublon connecté, dont on ne garde que l'appareil. */
  sourceId: string,
  /** Le siège déconnecté à rendre à la vie. */
  targetId: string,
): { seat: Player; previousSeatId: string } | null {
  if (!sourceId || !targetId || sourceId === targetId) return null;

  const source = state.players.find(player => player.id === sourceId);
  const seat = state.players.find(player => player.id === targetId);
  if (!source || !seat || seat.isConnected) return null;

  // Le lancer d'ouverture ne doit pas se retrouver compté deux fois : si le siège
  // d'origine a déjà lancé, c'est son lancer qui fait foi et celui du doublon
  // s'efface. Sinon le lancer du doublon reste attaché à son socket, donc au
  // siège fusionné, et vaut pour la personne — elle n'a pas à relancer.
  const seatAlreadyRolled = state.firstPlayerDraw?.rolls.some(roll => roll.playerId === targetId) ?? false;
  if (seatAlreadyRolled) purgeFirstPlayerRoll(state, sourceId);

  // Le retrait précède la réaffectation de l'identifiant : sinon les deux joueurs
  // porteraient un instant le même id et la recherche tomberait sur le mauvais.
  if (!removePlayerFromGame(state, sourceId)) return null;

  seat.id = sourceId;
  seat.isConnected = true;
  transferFirstPlayerRoll(state, targetId, sourceId);

  return { seat, previousSeatId: targetId };
}
