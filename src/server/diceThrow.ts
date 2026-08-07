/**
 * Du geste de lancer au parcours du dé — et du hasard à la face obtenue.
 *
 * Deux choses sortent d'un lancer, et elles sont **séparées** : la face, que le
 * serveur tire, et le parcours du dé sur le plateau, que le geste dessine.
 * Cette séparation est ce qui permet à un dé d'être à la fois juste et vivant.
 *
 * La face a d'abord visé. La puissance du glissé désignait un couloir — geste
 * mou vers le 1, geste à fond vers le 6 — et pondérait le tirage autour. C'était
 * la réponse à un défaut réel : la jauge de puissance ne servait alors à rien du
 * tout, le dé sautait sur place et la face tombait d'un `Math.random()`. « La
 * puissance du glissé ne peut pas être décorative », demandait le propriétaire
 * du projet.
 *
 * Elle ne l'est plus, mais autrement : le dé **vole** désormais, et son vol tient
 * entièrement au geste — la distance parcourue, la direction, le nombre de
 * rebonds, la durée de la culbute. La visée, elle, est retirée sur demande du
 * propriétaire du projet — « plus de hasard dans le lancer du dé, mais en
 * gardant le mouvement de l'utilisateur ». Mesuré, elle ne laissait pas grand
 * hasard : un pouce de famille glisse autour de soixante-dix pixels, ce qui
 * concentrait 69 % des lancers sur les faces 2, 3 et 4 et ne sortait un 6 qu'une
 * fois sur seize. Et adoucir la pondération n'y changeait que deux points —
 * c'est la visée elle-même qui concentrait, pas sa dureté.
 *
 * La face est donc un sixième chacune, comme un dé de bois. Le geste garde tout
 * ce qui se voit ; il ne décide plus de ce qui se compte.
 *
 * Ce module est partagé : le serveur tranche, le client rejoue le parcours. Le
 * serveur reste seul juge — il ne reçoit qu'un geste, jamais un résultat.
 */

/** Nombre de faces du dé. */
export const DICE_FACES = 6;

/**
 * En deçà de ce glissé, il n'y a pas de geste : c'est un appui. Le lancer part
 * quand même — la face ne dépend de rien —, mais le dé ne reçoit aucune poussée
 * et se contente du plus court des vols. La puissance étant mesurée en pixels de
 * glissé, les deux partagent le même seuil.
 */
export const THROW_MIN_DRAG_PX = 8;

/**
 * Longueur du glissé, en pixels, qui vaut une poussée à fond.
 *
 * La puissance valait la distance parcourue **en pixels**, bornée à cent. Or un
 * pouce sur un téléphone parcourt naturellement trente à quatre-vingt-dix pixels :
 * toute la table poussait donc, sans le savoir, à mi-échelle, et la moitié haute
 * de la jauge ne servait jamais. L'échelle compte encore, même sans visée : c'est
 * elle qui décide de la distance du vol, du nombre de rebonds et de la durée de la
 * culbute. Cent quatre-vingts pixels, c'est un vrai geste franc de bas en haut de
 * l'écran, et le reste s'étale enfin sur des longueurs que la main distingue.
 */
export const DRAG_FULL_POWER_PX = 180;

/** La puissance d'un glissé, de 0 à 100, à partir de sa longueur en pixels. */
export function powerFromDrag(distancePx: number): number {
  const ratio = Math.max(0, distancePx) / DRAG_FULL_POWER_PX;
  return Math.min(100, Math.round(ratio * 100));
}

/**
 * La face obtenue : un sixième chacune, quoi qu'ait fait le doigt.
 *
 * La fonction ne prend **pas** le geste, et c'est le point : rien de ce qui
 * arrive du réseau ne peut infléchir la face. Un client bricolé n'a plus de
 * puissance à mentir puisque plus aucune puissance ne compte ici.
 *
 * Le geste n'est pas perdu pour autant, il est ailleurs — dans `describeFlight`,
 * qui décrit un vol dont la longueur, la direction, les rebonds et la culbute
 * viennent tous du glissé. C'est ce qu'on voit ; la face, elle, est ce qu'on
 * compte, et un dé juste ne se pilote pas.
 */
export function rollDie(random: () => number = Math.random): number {
  return 1 + Math.floor(random() * DICE_FACES);
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
