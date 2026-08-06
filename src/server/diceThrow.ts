/**
 * Du geste de lancer à la face obtenue.
 *
 * Le glissé du doigt affichait une jauge de puissance qui ne servait à rien :
 * la face tombait d'un `Math.random()` côté serveur, quelle que soit la force
 * du geste. Signalé par le propriétaire du projet — « la puissance du glissé ne
 * peut pas être décorative ».
 *
 * Elle vise donc, mais elle ne décide pas. Un geste appuyé envoie le dé loin,
 * vers les grands nombres ; il rebondit quand même. La face visée ne sort qu'un
 * peu moins d'une fois sur trois, et l'écart d'un cran est plus fréquent
 * qu'elle. Un dé entièrement pilotable retirerait au jeu son hasard — sur un
 * plateau où l'on choisit déjà entre deux destinations, viser sa case à coup sûr
 * aurait vidé le lancer de tout enjeu, et la table l'aurait vu au deuxième tour.
 *
 * Ce module est partagé : le client s'en sert pour annoncer la face visée
 * pendant le glissé, le serveur pour trancher. Le serveur reste seul juge —
 * il ne reçoit que la puissance, jamais un résultat.
 */

/** Nombre de faces du dé. */
export const DICE_FACES = 6;

/**
 * En deçà de ce glissé, il n'y a pas de geste : c'est un appui. Le lancer part
 * quand même, mais au hasard — un simple contact ne peut pas vouloir dire
 * « je vise le 1 ». La puissance est justement mesurée en pixels de glissé,
 * d'où le même seuil pour les deux.
 */
export const AIM_MIN_DRAG_PX = 8;

/** La visée : un geste mou envoie sur le 1, un geste à fond sur le 6. */
export function aimedFace(power: number): number {
  const clamped = Math.max(0, Math.min(100, power));
  return 1 + Math.round((clamped / 100) * (DICE_FACES - 1));
}

/** La face visée à afficher pendant le geste, ou `null` si le geste ne vise pas. */
export function aimFromDrag(power: number): number | null {
  return power >= AIM_MIN_DRAG_PX ? aimedFace(power) : null;
}

/**
 * Le poids d'une face selon son écart, en crans, avec la face visée.
 *
 * C'est le réglage de la mécanique, et le seul. Plus de poids sur le premier
 * cran rend le dé docile ; une queue plus lourde le rend sourd au geste.
 *
 * Tel quel : la face visée sort 28 à 36 % du temps selon la visée, ses voisines
 * immédiates presque autant, et **aucune face n'est jamais impossible** — un
 * geste à fond peut encore donner un 1, comme un dé qui rebondit sur le bord de
 * la table. Espérance de 2,4 pour un geste au ras du seuil contre 4,6 pour un
 * geste à fond : le geste se sent, il ne commande pas.
 *
 * On pondère toutes les faces plutôt que de décaler la visée, parce qu'un écart
 * qui sortirait du dé doit être redistribué et non replié : replié, viser le 1
 * donnait un 2 plus souvent qu'un 1, et la jauge annonçait alors une visée
 * fausse ; tronqué, viser le 6 le donnait deux fois sur trois.
 */
const WEIGHT_BY_DISTANCE: readonly number[] = [5, 4, 2, 1, 1, 1];

/** Les poids des six faces pour une face visée donnée. */
function weightsForAim(target: number): number[] {
  return Array.from(
    { length: DICE_FACES },
    (_, index) => WEIGHT_BY_DISTANCE[Math.abs(index + 1 - target)]
  );
}

/**
 * La face obtenue pour une puissance de geste donnée.
 *
 * `power` absente, nulle, non numérique ou en dessous du seuil de geste : le
 * lancer reste un tirage au sort. C'est le cas de l'appui simple et celui d'un
 * client qui ne dit rien — la puissance arrive du réseau, donc on ne lui fait
 * pas confiance, on la borne.
 */
export function resolveThrow(
  power: number | null | undefined,
  random: () => number = Math.random
): number {
  if (typeof power !== 'number' || !Number.isFinite(power) || power < AIM_MIN_DRAG_PX) {
    return 1 + Math.floor(random() * DICE_FACES);
  }

  const weights = weightsForAim(aimedFace(power));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let ticket = random() * total;

  for (let face = 1; face <= DICE_FACES; face++) {
    ticket -= weights[face - 1];
    if (ticket < 0) return face;
  }

  return DICE_FACES;
}

/**
 * L'espérance du lancer pour une puissance donnée, utile aux tests et à qui
 * voudra régler `WEIGHT_BY_DISTANCE` sans lancer dix mille dés.
 */
export function expectedFace(power: number): number {
  // Sous le seuil, `resolveThrow` tire au hasard : l'espérance doit dire la même
  // chose que le lancer, sinon elle ne sert à rien pour régler la mécanique.
  if (power < AIM_MIN_DRAG_PX) return (1 + DICE_FACES) / 2;

  const weights = weightsForAim(aimedFace(power));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.reduce((sum, weight, index) => sum + weight * (index + 1), 0) / total;
}
