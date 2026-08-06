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
 * Rien de tout cela ne s'écrit à l'écran. Une jauge annonçait la face visée
 * pendant le geste ; retirée à la demande du propriétaire du projet — « je vois
 * pas pourquoi ça doit être écrit ». La poussée se sent au parcours du dé, pas
 * dans une étiquette : c'est le seul retour dont un dé ait besoin.
 *
 * Ce module est partagé : le serveur tranche, le client rejoue le parcours. Le
 * serveur reste seul juge — il ne reçoit qu'un geste, jamais un résultat.
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
 * qui sortirait du dé doit être redistribué et non replié : replié, une poussée
 * molle donnait un 2 plus souvent qu'un 1 — la face la plus probable n'était
 * plus celle visée ; tronqué, une poussée franche donnait le 6 deux fois sur
 * trois.
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

/* ==========================================================================
   La trajectoire du dé sur le plateau
   ========================================================================== */

/**
 * Le dé ne sautait sur place, dans son coin, que parce qu'il vivait dans un
 * cadre posé par-dessus le plateau. Demandé par le propriétaire du projet : il
 * doit rouler **sur** le plateau, comme les pions y circulent, et son parcours
 * doit venir de la poussée du joueur — pas d'un tirage indépendant.
 *
 * La trajectoire est donc calculée ici, à partir de trois nombres seulement :
 * la puissance et l'angle du geste, que le client envoie, et une graine que le
 * serveur tire. Elle est déterministe, donc **tous les écrans voient le dé
 * suivre le même parcours** — comme ils voient déjà le même pion se déplacer.
 */

/** Coordonnées dans le repère du plateau, le même que celui des cases (0 à 1000). */
export interface BoardPoint {
  x: number;
  y: number;
}

/** Le coin où le dé attend son tour, hors du feutre de la roue. */
export const DICE_REST: BoardPoint = { x: 886, y: 886 };

/** Centre et rayon utile du plateau : le dé rebondit sur ce bord. */
const BOARD_CENTER: BoardPoint = { x: 500, y: 500 };
const BOARD_RADIUS = 405;

/** Durées, en millisecondes : le premier vol, puis chaque rebond. */
const FIRST_HOP_MS = 460;
const BOUNCE_MS = [230, 165, 120];

export interface DiceFlight {
  /** Points de contact successifs, en coordonnées de plateau, départ compris. */
  contacts: BoardPoint[];
  /** Hauteur de chaque arc, en fraction de la taille du dé (0 = au sol). */
  lifts: number[];
  /** Durée de chaque arc, en millisecondes. */
  durations: number[];
  /** Tours complets de culbute, sur les deux axes. */
  spin: { x: number; y: number };
  durationMs: number;
}

/** Générateur reproductible : même graine, même parcours, sur tous les écrans. */
function seededRandom(seed: number): () => number {
  let state = (Math.floor(seed) || 1) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const distance = (a: BoardPoint, b: BoardPoint) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Un dé qui sortirait du plateau rebondit sur le bord au lieu d'être bloqué
 * contre lui : le joueur qui pousse vers le coin voit son dé revenir en jeu, et
 * le dé ne finit jamais collé à un bord où l'on ne le lirait pas.
 */
function advance(from: BoardPoint, direction: BoardPoint, span: number) {
  const target = { x: from.x + direction.x * span, y: from.y + direction.y * span };
  if (distance(target, BOARD_CENTER) <= BOARD_RADIUS) return { point: target, direction };

  // Normale au bord, au point de sortie.
  const nx = (target.x - BOARD_CENTER.x) / distance(target, BOARD_CENTER);
  const ny = (target.y - BOARD_CENTER.y) / distance(target, BOARD_CENTER);
  const dot = direction.x * nx + direction.y * ny;

  return {
    point: { x: BOARD_CENTER.x + nx * BOARD_RADIUS, y: BOARD_CENTER.y + ny * BOARD_RADIUS },
    direction: { x: direction.x - 2 * dot * nx, y: direction.y - 2 * dot * ny },
  };
}

/**
 * Le parcours du dé pour une poussée donnée.
 *
 * `power` (0 à 100) donne la distance parcourue, `angle` (en degrés, repère de
 * l'écran) la direction, et `seed` le grain d'imprévu : léger écart d'angle,
 * nombre de rebonds, tours de culbute. Deux poussées identiques ne donnent donc
 * pas exactement le même parcours, mais une poussée franche va toujours plus
 * loin qu'une poussée molle, et toujours dans la direction du doigt.
 */
export function describeFlight(power: number, angle: number, seed: number): DiceFlight {
  const random = seededRandom(seed);
  const force = Math.max(0, Math.min(100, Number.isFinite(power) ? power : 0)) / 100;

  // Un geste franc traverse le plateau, un geste mou pousse le dé de trois
  // cases : la distance se voit, c'est ce qui rend la poussée lisible.
  const span = 210 + force * 560;
  const wobble = (random() - 0.5) * 22; // l'écart d'angle, en degrés
  const radians = (((Number.isFinite(angle) ? angle : -135) + wobble) * Math.PI) / 180;

  let direction = { x: Math.cos(radians), y: Math.sin(radians) };
  let point: BoardPoint = { ...DICE_REST };

  const contacts: BoardPoint[] = [point];
  const lifts: number[] = [];
  const durations: number[] = [];

  // Un geste franc fait rebondir le dé plus longtemps qu'un geste mou.
  const bounces = force > 0.66 ? 3 : force > 0.33 ? 2 : 1;
  const hops = [span, ...BOUNCE_MS.slice(0, bounces).map((_, i) => span * 0.42 ** (i + 1))];

  hops.forEach((hop, index) => {
    const moved = advance(point, direction, hop);
    point = moved.point;
    direction = moved.direction;
    contacts.push(point);
    // Le premier vol est haut, chaque rebond retombe plus bas.
    lifts.push(index === 0 ? 1.5 + force * 1.3 : (1.5 + force * 1.3) * 0.4 ** index);
    durations.push(index === 0 ? FIRST_HOP_MS : BOUNCE_MS[index - 1]);
  });

  return {
    contacts,
    lifts,
    durations,
    // Deux à quatre tours par axe : la culbute doit brouiller la face de départ.
    spin: { x: 2 + Math.floor(random() * 3), y: 2 + Math.floor(random() * 3) },
    durationMs: durations.reduce((sum, d) => sum + d, 0),
  };
}

/** Le parcours converti en pixels pour un plateau donné, prêt à être animé. */
export interface DiceFlightPx {
  /** Décalages depuis la position de repos, au sol : l'ombre les suit. */
  x: number[];
  y: number[];
  /** Hauteur du dé au-dessus du sol, en pixels et négative vers le haut. */
  lift: number[];
  /** Échelle de l'ombre de contact : elle rétrécit quand le dé monte. */
  shadow: number[];
  /** Progression de chaque image, de 0 à 1. */
  times: number[];
  durationMs: number;
  spin: { x: number; y: number };
  /** Instants de contact avec le plateau, en millisecondes : un son par rebond. */
  bounces: number[];
}

/**
 * Du parcours en coordonnées de plateau aux images-clés en pixels.
 *
 * Chaque bond donne deux images : le sommet de l'arc, puis le contact. C'est la
 * façon dont les pions décrivent déjà leurs sauts de case en case, et le dé
 * partage ainsi leur langage d'animation.
 */
export function flightToPixels(flight: DiceFlight, boardPx: number, dieSize: number): DiceFlightPx {
  const toPx = (boardUnits: number) => (boardUnits / 1000) * boardPx;
  const x: number[] = [0];
  const y: number[] = [0];
  const lift: number[] = [0];
  const bornes: number[] = [0];
  const bounces: number[] = [];
  let ecoule = 0;

  flight.contacts.slice(1).forEach((contact, index) => {
    const depart = flight.contacts[index];
    const duree = flight.durations[index];
    const hauteur = flight.lifts[index] * dieSize;

    // Sommet de l'arc, à mi-parcours.
    x.push(toPx((depart.x + contact.x) / 2 - DICE_REST.x));
    y.push(toPx((depart.y + contact.y) / 2 - DICE_REST.y));
    lift.push(-hauteur);
    bornes.push(ecoule + duree / 2);

    // Contact.
    x.push(toPx(contact.x - DICE_REST.x));
    y.push(toPx(contact.y - DICE_REST.y));
    lift.push(0);
    ecoule += duree;
    bornes.push(ecoule);
    bounces.push(ecoule);
  });

  const plusHaut = Math.max(1, ...lift.map(Math.abs));
  return {
    x,
    y,
    lift,
    shadow: lift.map(value => 1 - 0.45 * (Math.abs(value) / plusHaut)),
    times: bornes.map(borne => borne / Math.max(1, ecoule)),
    durationMs: ecoule,
    spin: flight.spin,
    bounces,
  };
}
