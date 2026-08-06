import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/sound';
import { Dices, Sparkles, Hand, RefreshCw } from 'lucide-react';
import { AIM_MIN_DRAG_PX, DiceFlightPx } from '../server/diceThrow';
import { EASE_OUT_SOFT } from '../utils/motion';

interface Dice3DProps {
  value: number | null; // 1 to 6 or null
  isRolling: boolean;
  /**
   * Reçoit la poussée : sa puissance (0 à 100) et son angle en degrés, dans le
   * repère de l'écran. `null` pour un lancer au hasard — un appui simple, ou le
   * bouton de repli, ne poussent dans aucune direction.
   */
  onRollRequest?: (push: { power: number; angle: number } | null) => void;
  disabled?: boolean;
  size?: number; // size in px, e.g. 88
  /** Drops the verbose helper text so the die fits a mobile action dock. */
  compact?: boolean;
  /**
   * Retire le bouton « Lancer le dé » : le dé lui-même se touche et se lance,
   * ce qui suffit lorsqu'il est posé sur le plateau et que la place manque.
   */
  hideTriggerButton?: boolean;
  /**
   * Le parcours du dé sur le plateau, en pixels et relativement à sa position de
   * repos. Absent, le dé saute sur place — c'est le cas du tirage du premier
   * joueur, qui se joue dans un modal et n'a pas de plateau sous lui.
   */
  flight?: DiceFlightPx | null;
  /**
   * Facteur appliqué au dé une fois qu'il quitte la main pour le plateau. Le dé
   * au repos se saisit au doigt et garde donc sa taille ; posé au milieu des
   * pions, il doit tenir dans leur échelle. `1` laisse tout inchangé.
   */
  boardScale?: number;
}

// Dot positions grid layout for dice faces 1..6
const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4], // center
  2: [0, 8], // top-left, bottom-right
  3: [0, 4, 8], // top-left, center, bottom-right
  4: [0, 2, 6, 8], // 4 corners
  5: [0, 2, 4, 6, 8], // 4 corners + center
  6: [0, 2, 3, 5, 6, 8] // 2 columns of 3
};

// Target rotation angles to present each face facing directly at camera
const FACE_ROTATIONS: Record<number, { rx: number; ry: number }> = {
  1: { rx: 0, ry: 0 },
  2: { rx: 0, ry: -90 },
  3: { rx: -90, ry: 0 },
  4: { rx: 90, ry: 0 },
  5: { rx: 0, ry: 90 },
  6: { rx: 0, ry: 180 },
};

/**
 * Le dé posé est basculé en arrière, et sur ce seul axe.
 *
 * Présentée pile de face, la face gagnante occupait tout le cube et les cinq
 * autres se voyaient exactement de profil : à l'écran, un carré et quatre traits
 * jaunes aux coins, aucun relief. Un basculement montre le dessus du dé, et c'est
 * ce qui fait lire un cube.
 *
 * Mais il doit se faire sur **un seul axe**. Incliné sur deux, le cube ne touche
 * plus le plateau que par un sommet : mesuré au banc, la ligne la plus basse de sa
 * silhouette ne faisait que 1 % de sa largeur, et s'élargissait de huit pixels par
 * ligne — un V, la silhouette d'un dé en équilibre sur un coin. Signalé par le
 * propriétaire du projet : « le dé ne termine pas complètement à plat sur le
 * plateau, je pense pas que c'est normal ». Sur un seul axe, l'arête du bas reste
 * horizontale et large : le dé est posé.
 *
 * L'angle vient du repère implicite du plateau, celui des pions : leur disque du
 * dessus est une ellipse de rapport 0,19, soit une caméra à onze degrés au-dessus
 * de la surface. Le dé adopte le même point de vue, à un degré près.
 */
const REST_TILT = { rx: -12, ry: 0 };

/**
 * L'angle à viser pour présenter une orientation donnée, par le plus court
 * chemin depuis l'angle courant.
 *
 * Les rotations s'accumulent — le dé a pu faire six tours — et l'orientation
 * voulue n'est définie qu'à 360° près. L'ancien calcul ramenait l'angle au
 * multiple de 360 inférieur, ce qui supposait une orientation cible entre 0 et
 * 360°. L'inclinaison de repos étant négative (−17°), cette hypothèse tombait :
 * le dé posé repartait d'un tour complet en arrière, et mettait une seconde de
 * plus à s'immobiliser — mesuré en situation, le dé tournait encore à 1 250 ms.
 */
function settleTo(current: number, orientation: number): number {
  const delta = ((((orientation - current) % 360) + 540) % 360) - 180;
  return current + delta;
}

/**
 * L'orientation de chaque face dans le cube, dans l'ordre du rendu. Sert au
 * noyau opaque, qui doit se placer exactement sous les six faces.
 */
const FACE_PLACEMENTS: ReadonlyArray<{ face: number; rotate: string }> = [
  { face: 1, rotate: 'rotateY(0deg)' },
  { face: 2, rotate: 'rotateY(90deg)' },
  { face: 3, rotate: 'rotateX(90deg)' },
  { face: 4, rotate: 'rotateX(-90deg)' },
  { face: 5, rotate: 'rotateY(-90deg)' },
  { face: 6, rotate: 'rotateY(180deg)' },
];

/** L'orientation sous laquelle on présente une face donnée. */
function presentFace(face: number): { rx: number; ry: number } {
  const base = FACE_ROTATIONS[face] || FACE_ROTATIONS[1];
  return { rx: base.rx + REST_TILT.rx, ry: base.ry + REST_TILT.ry };
}

/**
 * Normale de chaque face dans le repère du cube, pour l'éclairer.
 * L'ordre suit celui des faces dans le rendu : avant, droite, dessus, dessous,
 * gauche, arrière.
 */
const FACE_NORMALS: Record<number, [number, number, number]> = {
  1: [0, 0, 1],
  2: [1, 0, 0],
  3: [0, -1, 0],
  4: [0, 1, 0],
  5: [-1, 0, 0],
  6: [0, 0, -1],
};

/**
 * La lumière, fixe dans le repère de l'écran.
 *
 * Elle vient surtout **de face**, et non d'en haut : le plateau est horizontal et
 * on le regarde de dessus, donc la face qui porte la valeur est celle tournée
 * vers le ciel. Une lumière verticale rendait le dessus du dé plus clair que sa
 * valeur — mesuré au banc, voile de 0,08 contre 0,27 —, ce qui revenait à
 * éclairer un dé posé à plat comme s'il était debout contre un mur. Le léger
 * biais vers le haut et la gauche suffit à séparer les faces latérales.
 */
const LIGHT: [number, number, number] = [-0.26, -0.32, 0.91];

/**
 * L'assombrissement d'une face, entre 0 et 1, pour une rotation donnée du cube.
 *
 * Les six faces partagent un seul matériau : sans cela, trois faces de même
 * teinte se rejoignant à un coin se lisent comme un hexagone plat, et non comme
 * un cube. On ne peut pas éclairer en CSS une face dont l'orientation change :
 * on calcule donc l'angle avec la lumière à partir de la rotation, et on pose un
 * voile sombre par-dessus.
 */
function faceShade(face: number, rotation: { rx: number; ry: number; rz: number }): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const [nx, ny, nz] = FACE_NORMALS[face];
  const cx = Math.cos(rad(rotation.rx)), sx = Math.sin(rad(rotation.rx));
  const cy = Math.cos(rad(rotation.ry)), sy = Math.sin(rad(rotation.ry));
  const cz = Math.cos(rad(rotation.rz)), sz = Math.sin(rad(rotation.rz));

  // Rotation Z, puis Y, puis X — l'ordre dans lequel CSS les compose.
  let x = nx * cz - ny * sz;
  let y = nx * sz + ny * cz;
  let z = nz;
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  [y, z] = [y * cx - z * sx, y * sx + z * cx];

  const eclairement = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
  // Un voile de 0 (pleine lumière) à 0,42 (face rasante) : assez pour séparer
  // trois faces voisines, pas assez pour noircir un dé en ivoire.
  return 0.42 * (1 - eclairement);
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  onRollRequest,
  disabled = false,
  size = 88,
  compact = false,
  hideTriggerButton = false,
  flight = null,
  boardScale = 1
}) => {
  // Store cumulative rotation angles so die spins forward smoothly without snapping
  const [rotation, setRotation] = useState({
    ...presentFace(1),
    rz: 0,
  });
  const [impactRipple, setImpactRipple] = useState(false);
  
  // Interactive gesture drag state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Track previous rolling state and roll spin animation lock to prevent multiple spin loops
  const prevIsRollingRef = useRef(false);
  const currentTurnSpinRef = useRef<{ extraX: number; extraY: number } | null>(null);

  const halfSize = size / 2;
  /**
   * Les arêtes du dé sont vives, et ce n'est pas un choix esthétique.
   *
   * Six faces **arrondies** ne forment pas une surface fermée : le congé de
   * l'arête manque. De face, cela ne fait qu'une échancrure de quelques pixels
   * aux sommets ; mais dès que le dé se présente dans le plan d'une arête —
   * ce qui arrive à chaque culbute — le congé absent devient une large bande, et
   * l'on voit le plateau à travers le dé. Signalé par le propriétaire du projet :
   * « ce n'est pas le but qu'on puisse voir à travers le cube ».
   *
   * Mesuré sur fond magenta, en comptant les pixels de fond enfermés dans la
   * silhouette : 11 718 sur les seize images d'une culbute avec des coins
   * arrondis, dont 850 sur une seule image ; **1 pixel** avec des arêtes vives.
   * Aucun noyau, aucun débord ne rattrape cela — seule une surface réellement
   * fermée y parvient. Le liseré doré des faces et l'ombre interne suffisent à
   * suggérer le biseau.
   */
  const faceRadius = 0;
  /**
   * Un noyau opaque d'un demi-pixel sous les faces.
   *
   * Même à arêtes vives, deux faces voisines laissent par endroits un pixel
   * d'anticrénelage à leur couture. Ce cube intérieur le comble : ce qu'on aperçoit
   * alors est l'intérieur du dé, dans l'ombre, jamais le plateau derrière.
   */
  const coreInset = 0.5;
  /**
   * Mais ce noyau doit être franchement **derrière** les faces, et un demi-pixel
   * ne suffit pas.
   *
   * À un demi-pixel, le noyau et la face qui le couvre sont à la même profondeur
   * pour le compositeur : il en choisit un, et c'était le noyau. Le dé posé
   * montrait alors un carré beige uni — mesuré au banc, aucun point visible sur
   * la face tournée vers la caméra, aux six valeurs, tandis qu'en masquant le
   * noyau les points réapparaissaient. Un dé qui ne montre pas sa valeur ne sert
   * à rien. À un pixel et demi, l'ordre n'est plus ambigu.
   *
   * La profondeur se règle **séparément** du retrait latéral : le noyau reste
   * presque aussi large que les faces, sans quoi il ne comblerait plus les
   * coutures qu'on aperçoit précisément près des arêtes.
   */
  const coreDepth = 1.5;
  /**
   * Les faces débordent d'une fraction de pixel.
   *
   * Deux faces voisines se touchent exactement le long de leur arête commune, et
   * le navigateur y laisse un liseré d'anticrénelage : mesuré sur fond magenta,
   * un pixel de fond toutes les trois lignes le long de l'arête gauche. Le noyau
   * ne peut pas le combler puisque le liseré est sur la silhouette elle-même. En
   * agrandissant chaque face d'un demi-pixel, les voisines se recouvrent et la
   * couture disparaît.
   */
  const faceBleed = 0.6;
  // Le dé voyage sur le plateau dès qu'un parcours accompagne le lancer ; sinon
  // il saute sur place, comme dans le modal du tirage au sort.
  const voyage = Boolean(flight) && isRolling;
  // Le vol fini, le dé reste où il est tombé : il revenait dans son coin comme
  // aspiré, ce qui effaçait le lancer qu'on venait de voir.
  const pose = Boolean(flight) && !isRolling;
  const chute = flight
    ? { x: flight.x[flight.x.length - 1], y: flight.y[flight.y.length - 1] }
    : { x: 0, y: 0 };
  // La rotation dure le temps du vol : une culbute qui s'arrête avant que le dé
  // ne touche le sol se voit tout de suite.
  const rouleMs = flight?.durationMs ?? 1250;

  /**
   * L'ombre d'une face à l'instant présent.
   *
   * `rotation` est l'orientation **visée**, pas celle affichée : pendant la
   * culbute, le cube tourne alors que le calcul, lui, resterait figé sur
   * l'arrivée — la lumière semblerait tourner avec le dé. Recalculer à chaque
   * image coûterait soixante rendus par seconde et six voiles à repeindre, sur
   * un téléphone, pour un cube qui file. Le temps du vol, les faces prennent donc
   * un ton unique ; les arêtes suffisent à les séparer, et l'éclairage juste
   * revient en fondu dès que le dé se pose.
   */
  const TUMBLE_SHADE = 0.2;
  const shadeOf = (face: number) => (isRolling ? TUMBLE_SHADE : faceShade(face, rotation));

  const triggerRoll = (push: { power: number; angle: number } | null) => {
    if (disabled || isRolling) return;
    onRollRequest?.(push);
  };

  // Whenever isRolling transitions from false -> true, initiate ONE single clean roll turn
  useEffect(() => {
    const isNowRolling = isRolling;
    const wasRolling = prevIsRollingRef.current;
    prevIsRollingRef.current = isNowRolling;

    const targetFace = value && value >= 1 && value <= 6 ? value : 1;
    const baseRot = presentFace(targetFace);

    if (isNowRolling && !wasRolling) {
      // Rolling started: play sound and pick fixed extra spin turns for THIS roll sequence
      soundManager.playDiceRoll();

      // Avec un parcours, les tours viennent de la graine du serveur : tous les
      // écrans voient la même culbute, comme ils voient le même déplacement.
      const extraX = (flight?.spin.x ?? Math.floor(Math.random() * 2) + 2) * 360;
      const extraY = (flight?.spin.y ?? Math.floor(Math.random() * 2) + 2) * 360;
      currentTurnSpinRef.current = { extraX, extraY };

      setRotation((prev) => ({
        rx: settleTo(prev.rx + extraX, baseRot.rx),
        ry: settleTo(prev.ry + extraY, baseRot.ry),
        rz: 0,
      }));
    } else if (isNowRolling && wasRolling && value) {
      // Value arrived while rolling: update target face orientation WITHOUT adding extra turns
      setRotation((prev) => ({
        rx: settleTo(prev.rx, baseRot.rx),
        ry: settleTo(prev.ry, baseRot.ry),
        rz: 0,
      }));
    } else if (!isNowRolling && wasRolling) {
      // Rolling ended: land cleanly on final face and trigger impact shockwave
      currentTurnSpinRef.current = null;
      setRotation((prev) => ({
        rx: settleTo(prev.rx, baseRot.rx),
        ry: settleTo(prev.ry, baseRot.ry),
        rz: 0,
      }));

      setImpactRipple(true);
      soundManager.playClick();
      const timer = setTimeout(() => setImpactRipple(false), 500);
      return () => clearTimeout(timer);
    } else if (!isNowRolling && value && value >= 1 && value <= 6) {
      // Idle state update (e.g. initial render or value display)
      setRotation((prev) => ({
        rx: settleTo(prev.rx, baseRot.rx),
        ry: settleTo(prev.ry, baseRot.ry),
        rz: 0,
      }));
    }
  }, [isRolling, value]);

  // Pointer / Finger Drag Handlers for realistic tactile swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isRolling) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touchStartRef.current || disabled || isRolling) return;

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    // Dynamic drag resistance clamping
    const clampedX = Math.max(-80, Math.min(80, dx));
    const clampedY = Math.max(-80, Math.min(80, dy));
    setDragOffset({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;

    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    // La poussée se mesure sur le geste complet, pas sur l'état de rendu : un
    // coup sec peut se relever avant que React ait repeint quoi que ce soit.
    const power = Math.min(100, Math.round(Math.hypot(dx, dy)));
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    touchStartRef.current = null;
    setDragOffset(null);

    // Relâcher le dé le lance, toujours. Le seuil précédent (8 px de glissé, ou
    // 80 px/s, ou moins de 350 ms) laissait un doigt hésitant — posé sans bouger
    // puis relevé après une seconde — sans aucun effet ; le bouton de repli
    // rattrapait le coup. Posé sur le plateau, le dé n'a plus ce bouton, et il
    // n'y a rien à protéger contre un appui involontaire : la cible ne s'affiche
    // que pendant son propre tour de lancer.
    //
    // En dessous du seuil, le geste ne vise rien : le dé part au hasard.
    if (!disabled && !isRolling) triggerRoll(power >= AIM_MIN_DRAG_PX ? { power, angle } : null);
  };

  // Helper to render pips/dots on each face
  const renderFacePips = (faceNumber: number) => {
    const activeIndices = PIP_LAYOUTS[faceNumber] || [];
    return (
      // Marge proportionnelle et non fixe : avec `p-2.5` (10 px), un dé de 44 px
      // ne laissait que 8 px par case pour des points de 8,4 px. Ils se
      // touchaient et la face se lisait comme quatre capsules au lieu de cinq
      // points — le dé annonçait une face fausse.
      <div
        className="grid h-full w-full grid-cols-3 grid-rows-3 items-center justify-items-center"
        style={{ padding: `${size * 0.13}px` }}
      >
        {Array.from({ length: 9 }).map((_, idx) => {
          const hasPip = activeIndices.includes(idx);
          const isCenterPip = idx === 4 && faceNumber === 1;

          return (
            <div key={idx} className="w-full h-full flex items-center justify-center">
              {hasPip && (
                <div
                  className={`rounded-full transition-all duration-300 shadow-inner ${
                    isCenterPip
                      ? 'bg-gradient-to-br from-red-500 via-red-600 to-amber-700 shadow-red-950/80 ring-1 ring-red-300/60'
                      : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 shadow-slate-950/90 ring-1 ring-slate-700/60'
                  }`}
                  style={{
                    // 0,17 et non 0,19 : la case fait 0,247 × la taille du dé
                    // (marge de 0,13 de part et d'autre), il faut de l'air entre
                    // deux points voisins pour qu'on les compte d'un coup d'œil.
                    width: `${size * 0.17}px`,
                    height: `${size * 0.17}px`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2 w-full touch-none">
      {/* Zone de préhension, qui porte aussi le déplacement au sol.
          C'est elle et non le cube qui voyage : la perspective se déplace avec le
          dé, donc sa projection reste la même d'un bout à l'autre du parcours. */}
      <motion.div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing rounded-3xl select-none touch-none ${
          !disabled && !isRolling ? 'hover:bg-amber-500/10 active:bg-amber-500/20' : ''
        }`}
        style={{
          width: `${size * (compact ? 1.6 : 1.9)}px`,
          height: `${size * (compact ? 1.6 : 1.9)}px`,
          // Rembourrage proportionnel, et non `p-4`. Seize pixels fixes ne
          // laissaient que 30 px de contenu à un dé de 39 : le flex comprimait le
          // cube alors que `translateZ` continuait de placer ses faces à 19,5 px.
          // Les faces latérales sortaient donc de la face avant, et l'on voyait le
          // plateau par la fente — mesuré au banc, 4,7 px d'écart à 39 px, contre
          // un recouvrement de 3 px à 200 px.
          padding: `${size * (compact ? 0.3 : 0.45)}px`,
          perspective: `${size * 9}px`,
          touchAction: 'none'
        }}
        animate={
          voyage
            ? { x: flight.x, y: flight.y, scale: boardScale }
            : pose
            ? { x: chute.x, y: chute.y, scale: boardScale }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={
          voyage
            ? {
                duration: flight.durationMs / 1000,
                times: flight.times,
                ease: 'linear',
                // Le dé rétrécit pendant qu'il descend vers le plateau, le temps
                // du premier arc : il quitte une main et arrive chez les pions.
                scale: { duration: (flight.durationMs * flight.times[1]) / 1000, ease: EASE_OUT_SOFT },
              }
            : { duration: pose ? 0 : 0.25, ease: EASE_OUT_SOFT }
        }
      >
        {/* Dynamic Shadow on Felt Table Surface */}
        <motion.div
          className="absolute rounded-full bg-slate-950/80 blur-md pointer-events-none"
          style={{
            width: `${size * 1.25}px`,
            height: `${size * 0.4}px`,
            bottom: `${size * 0.12}px`
          }}
          animate={
            voyage
              ? { scale: flight.shadow, opacity: flight.shadow.map(v => 0.25 + v * 0.4) }
              : {
                  scale: isRolling ? [1, 0.3, 1.3, 0.8, 1] : dragOffset ? 0.75 : 1,
                  opacity: isRolling ? [0.8, 0.2, 0.9, 0.5, 0.8] : 0.65,
                }
          }
          transition={
            voyage
              ? { duration: flight.durationMs / 1000, times: flight.times, ease: 'linear' }
              : { duration: 1.25, ease: 'easeInOut' }
          }
        />

        {/* Impact Shockwave Ring */}
        <AnimatePresence>
          {impactRipple && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute rounded-full border-2 border-amber-400/90 pointer-events-none shadow-lg"
              style={{
                width: `${size * 1.25}px`,
                height: `${size * 0.5}px`,
                bottom: `${size * 0.12}px`
              }}
            />
          )}
        </AnimatePresence>

        {/* 3D Dice Cube */}
        <motion.div
          className="relative shrink-0 transform-gpu pointer-events-none"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: dragOffset ? rotation.rx - dragOffset.y * 0.8 : rotation.rx,
            rotateY: dragOffset ? rotation.ry + dragOffset.x * 0.8 : rotation.ry,
            rotateZ: rotation.rz,
            x: dragOffset ? dragOffset.x * 0.5 : 0,
            y: voyage
              ? flight.lift
              : isRolling
              ? [-90, -110, -15, -35, 0]
              : dragOffset
              ? dragOffset.y * 0.5
              : 0,
          }}
          transition={{
            y: voyage
              ? { duration: flight.durationMs / 1000, times: flight.times, ease: 'linear' }
              : isRolling
              ? { duration: 1.25, times: [0, 0.3, 0.7, 0.85, 1], ease: [0.22, 1, 0.36, 1] }
              : dragOffset
              ? { duration: 0 }
              : { duration: 0.2 },
            rotateX: dragOffset ? { duration: 0 } : { duration: rouleMs / 1000, ease: [0.15, 0.85, 0.35, 1] },
            rotateY: dragOffset ? { duration: 0 } : { duration: rouleMs / 1000, ease: [0.15, 0.85, 0.35, 1] },
            rotateZ: { duration: rouleMs / 1000, ease: [0.15, 0.85, 0.35, 1] },
          }}
        >
          {/* Le noyau opaque, sous les six faces.

              Les faces du dé sont des rectangles **arrondis** : le long d'une
              arête, leurs coins s'écartent près des sommets, et à la couture le
              navigateur laisse un liseré d'anticrénelage. On voyait donc le fond
              au travers du cube — mesuré au banc sur fond magenta, 675 à 706
              pixels de fond enfermés dans la silhouette selon la valeur.

              Ce cube intérieur, à coins vifs et légèrement rentré, bouche les
              deux : il est trop petit pour dépasser de la silhouette arrondie,
              et assez grand pour se montrer dans les échancrures. Ce qu'on y voit
              est l'arête du dé, dans l'ombre — pas le plateau derrière. */}
          {FACE_PLACEMENTS.map(({ face, rotate }) => (
            <div
              key={`core_${face}`}
              className="absolute backface-hidden"
              style={{
                inset: coreInset,
                transform: `${rotate} translateZ(${halfSize - coreDepth}px)`,
                backgroundColor: '#EBC98E',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundColor: `rgba(2, 6, 23, ${shadeOf(face)})`,
                  transition: 'background-color 240ms linear',
                }}
              />
            </div>
          ))}

          {/* FACE 1 (Front) */}
          <div
            className="absolute bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-hidden"
            style={{ inset: -faceBleed, borderRadius: faceRadius, transform: `rotateY(0deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(1)}
            {/* Le voile d'éclairage : il assombrit la face à mesure qu'elle
                s'écarte de la lumière. Posé au-dessus des points, parce qu'un
                point sur une face dans l'ombre est dans l'ombre aussi. */}
            <div
              className="pointer-events-none absolute"
              style={{ inset: -2, borderRadius: faceRadius + 2, backgroundColor: `rgba(2, 6, 23, ${shadeOf(1)})`,
                transition: 'background-color 240ms linear' }}
            />
          </div>

          {/* FACE 2 (Right) */}
          <div
            className="absolute bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-hidden"
            style={{ inset: -faceBleed, borderRadius: faceRadius, transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(2)}
            {/* Le voile d'éclairage : il assombrit la face à mesure qu'elle
                s'écarte de la lumière. Posé au-dessus des points, parce qu'un
                point sur une face dans l'ombre est dans l'ombre aussi. */}
            <div
              className="pointer-events-none absolute"
              style={{ inset: -2, borderRadius: faceRadius + 2, backgroundColor: `rgba(2, 6, 23, ${shadeOf(2)})`,
                transition: 'background-color 240ms linear' }}
            />
          </div>

          {/* FACE 3 (Top) */}
          <div
            className="absolute bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-hidden"
            style={{ inset: -faceBleed, borderRadius: faceRadius, transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(3)}
            {/* Le voile d'éclairage : il assombrit la face à mesure qu'elle
                s'écarte de la lumière. Posé au-dessus des points, parce qu'un
                point sur une face dans l'ombre est dans l'ombre aussi. */}
            <div
              className="pointer-events-none absolute"
              style={{ inset: -2, borderRadius: faceRadius + 2, backgroundColor: `rgba(2, 6, 23, ${shadeOf(3)})`,
                transition: 'background-color 240ms linear' }}
            />
          </div>

          {/* FACE 4 (Bottom) */}
          <div
            className="absolute bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-hidden"
            style={{ inset: -faceBleed, borderRadius: faceRadius, transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(4)}
            {/* Le voile d'éclairage : il assombrit la face à mesure qu'elle
                s'écarte de la lumière. Posé au-dessus des points, parce qu'un
                point sur une face dans l'ombre est dans l'ombre aussi. */}
            <div
              className="pointer-events-none absolute"
              style={{ inset: -2, borderRadius: faceRadius + 2, backgroundColor: `rgba(2, 6, 23, ${shadeOf(4)})`,
                transition: 'background-color 240ms linear' }}
            />
          </div>

          {/* FACE 5 (Left) */}
          <div
            className="absolute bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-hidden"
            style={{ inset: -faceBleed, borderRadius: faceRadius, transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(5)}
            {/* Le voile d'éclairage : il assombrit la face à mesure qu'elle
                s'écarte de la lumière. Posé au-dessus des points, parce qu'un
                point sur une face dans l'ombre est dans l'ombre aussi. */}
            <div
              className="pointer-events-none absolute"
              style={{ inset: -2, borderRadius: faceRadius + 2, backgroundColor: `rgba(2, 6, 23, ${shadeOf(5)})`,
                transition: 'background-color 240ms linear' }}
            />
          </div>

          {/* FACE 6 (Back) */}
          <div
            className="absolute bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-hidden"
            style={{ inset: -faceBleed, borderRadius: faceRadius, transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(6)}
            {/* Le voile d'éclairage : il assombrit la face à mesure qu'elle
                s'écarte de la lumière. Posé au-dessus des points, parce qu'un
                point sur une face dans l'ombre est dans l'ombre aussi. */}
            <div
              className="pointer-events-none absolute"
              style={{ inset: -2, borderRadius: faceRadius + 2, backgroundColor: `rgba(2, 6, 23, ${shadeOf(6)})`,
                transition: 'background-color 240ms linear' }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Tactile Guidance Label & Fallback Trigger Button */}
      {onRollRequest && !hideTriggerButton && (
        <div className="flex flex-col items-center gap-2 mt-1">
          {!compact && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 animate-pulse bg-amber-950/70 border border-amber-500/40 px-3.5 py-1 rounded-full shadow-md">
              <Hand className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Glissez le dé avec votre doigt pour le lancer ! 👆💨</span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Le bouton ne pousse dans aucune direction : c'est le repli, il
              // lance au hasard et le dé saute sur place.
              triggerRoll(null);
            }}
            disabled={disabled || isRolling}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-2xl transition-all transform active:scale-95 ${
              !disabled && !isRolling
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 ring-2 ring-amber-300/50 shadow-amber-500/30'
                : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            {isRolling
              ? compact
                ? 'Lancement…'
                : 'Lancement du dé en cours...'
              : compact
              ? 'Lancer le dé 🎲'
              : 'Touchez ici pour lancer 🎲'}
            {!disabled && !isRolling && <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
          </button>
        </div>
      )}
    </div>
  );
};
