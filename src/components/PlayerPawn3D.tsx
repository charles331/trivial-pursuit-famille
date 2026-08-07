import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BoardTile, CategoryId, Player } from '../types';
import { CATEGORIES } from '../data/categories';
import { AVATARS } from '../data/avatars';
import { resolveTilePath } from '../data/boards';
import { soundManager } from '../utils/sound';
import { EASE_OUT_SOFT, EASE_SPRING, PAWN_STEP_MS, shade, tint, withAlpha } from '../utils/motion';

/**
 * Les six parts du porte-camemberts, dans le sens horaire depuis midi.
 *
 * Ce n'est plus une constante : l'ordre est celui des catégories du plateau, et il
 * doit le suivre. Figé sur les six catégories de base, un camembert gagné en
 * gastronomie comptait pour la victoire sans jamais se dessiner sur le pion —
 * l'emplacement n'existait pas. La valeur ci-dessous ne sert que de repli, pour un
 * pion rendu hors partie (aperçu du salon, tests).
 */
export const PAWN_WEDGE_ORDER: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports'
];

interface PlayerPawn3DProps {
  player: Player;
  tiles: BoardTile[];
  /** Rendered size of the (square) board in CSS pixels. */
  boardPx: number;
  isActive: boolean;
  isSelf: boolean;
  diceValue: number | null;
  /** Horizontal fan offset in pawn widths, to spread pawns sharing a tile. */
  fanOffset: number;
  stackIndex: number;
  reducedMotion: boolean;
  /** Les six catégories du plateau, dans l'ordre des parts du porte-camemberts. */
  wedgeOrder?: CategoryId[];
}

/**
 * A physical-looking game token rendered with real CSS 3D transforms:
 * an extruded disc (the classic camembert holder) standing on the board,
 * with a contact shadow, a glossy cap and six wedge slots that fill up as the
 * player wins camemberts.
 *
 * The pawn owns its own travel animation: whenever the server moves the player
 * to a new tile, it rebuilds the walked path and hops across every intermediate
 * tile instead of teleporting.
 */
export const PlayerPawn3D: React.FC<PlayerPawn3DProps> = ({
  player,
  tiles,
  boardPx,
  isActive,
  isSelf,
  diceValue,
  fanOffset,
  stackIndex,
  reducedMotion,
  wedgeOrder = PAWN_WEDGE_ORDER
}) => {
  const [travelPath, setTravelPath] = useState<BoardTile[] | null>(null);
  const [impact, setImpact] = useState(false);
  const [wedgeFlash, setWedgeFlash] = useState(false);

  const prevTileIdRef = useRef(player.currentTileId);
  const prevWedgeCountRef = useRef(player.wedges.length);
  const lastDiceRef = useRef<number | null>(diceValue);
  const travelingRef = useRef(false);
  const stepTimersRef = useRef<number[]>([]);
  const impactTimerRef = useRef<number | null>(null);

  const avatar = AVATARS.find(a => a.id === player.avatarId) || AVATARS[0];

  // ---------------------------------------------------------------- geometry
  // A pawn is sized relative to the board so it stays proportionate at every
  // breakpoint, with a floor that keeps the avatar readable on small phones.
  const basePawn = Math.max(30, Math.min(68, boardPx * 0.1));
  const size = isActive ? basePawn * 1.08 : basePawn;

  const discD = size * 0.9;
  const discTop = size * 0.17;
  const groundY = size * 1.12; // distance from box top to the tile centre
  const boxH = size * 1.34;
  const thickness = Math.max(1.8, size * 0.07);
  // Four extrusion slices are enough at phone scale. Larger boards retain a
  // little more depth without paying for ten transformed/filter layers per pawn.
  const layerCount = boardPx < 520 ? 4 : 7;

  const toPx = (value: number) => (value / 1000) * boardPx;
  // Pawns sharing a tile fan out sideways, with a slight depth stagger so the
  // avatars never sit exactly on top of each other.
  const fanPx = fanOffset * size * 0.82;
  const stackLiftPx = stackIndex % 2 === 1 ? size * 0.1 : 0;

  const currentTile =
    tiles.find(tile => tile.id === player.currentTileId) || tiles[0] || { x: 500, y: 500 };

  const pathTiles = travelPath && travelPath.length > 1 ? travelPath : null;
  const framesX = (pathTiles || [currentTile as BoardTile]).map(tile => toPx(tile.x) - size / 2 + fanPx);
  const framesY = (pathTiles || [currentTile as BoardTile]).map(
    tile => toPx(tile.y) - groundY - stackLiftPx
  );
  const stepCount = pathTiles ? pathTiles.length - 1 : 0;
  const travelDuration = (stepCount * PAWN_STEP_MS) / 1000;
  const travelTimes = pathTiles
    ? framesX.map((_, index) => index / Math.max(1, stepCount))
    : undefined;

  // --------------------------------------------------------------- travelling
  const clearStepTimers = () => {
    stepTimersRef.current.forEach(id => window.clearTimeout(id));
    stepTimersRef.current = [];
  };

  useEffect(() => {
    const fromId = prevTileIdRef.current;
    const toId = player.currentTileId;
    if (fromId === toId) return;

    prevTileIdRef.current = toId;

    if (reducedMotion || boardPx <= 0) {
      setTravelPath(null);
      return;
    }

    // The dice value is cleared by the server on re-roll tiles, so keep the
    // last known roll around to rebuild the exact walk the player took.
    const steps = diceValue ?? lastDiceRef.current;
    const path = resolveTilePath(tiles, fromId, toId, steps);

    if (path.length < 2) {
      setTravelPath(null);
      return;
    }

    travelingRef.current = true;
    setTravelPath(path);

    // One soft tick per tile crossed makes the movement legible without sound.
    clearStepTimers();
    for (let step = 1; step < path.length; step++) {
      stepTimersRef.current.push(
        window.setTimeout(() => soundManager.playTick(), Math.max(0, step * PAWN_STEP_MS - 60))
      );
    }
  }, [player.currentTileId, boardPx, reducedMotion]);

  useEffect(() => {
    if (diceValue !== null) lastDiceRef.current = diceValue;
  }, [diceValue]);

  useEffect(
    () => () => {
      clearStepTimers();
      if (impactTimerRef.current) window.clearTimeout(impactTimerRef.current);
    },
    []
  );

  // Celebrate a freshly won camembert directly on the pawn.
  useEffect(() => {
    if (player.wedges.length > prevWedgeCountRef.current) {
      setWedgeFlash(true);
      const timer = window.setTimeout(() => setWedgeFlash(false), 1500);
      prevWedgeCountRef.current = player.wedges.length;
      return () => window.clearTimeout(timer);
    }
    prevWedgeCountRef.current = player.wedges.length;
  }, [player.wedges.length]);

  const handleTravelComplete = () => {
    if (!travelingRef.current) return;
    travelingRef.current = false;
    clearStepTimers();
    setTravelPath(null);
    setImpact(true);
    if (impactTimerRef.current) window.clearTimeout(impactTimerRef.current);
    impactTimerRef.current = window.setTimeout(() => setImpact(false), 560);
  };

  // ----------------------------------------------------------------- surfaces
  // Empty slots keep a hint of the player's colour: a fully dark holder reads
  // as a hole on the board instead of as that player's token.
  const emptySlot = shade(player.color, 0.68);

  const holderGradient = useMemo(() => {
    const stops = wedgeOrder.map((categoryId, index) => {
      const owned = player.wedges.includes(categoryId);
      const color = owned ? CATEGORIES[categoryId].color : emptySlot;
      return `${color} ${index * 60}deg ${(index + 1) * 60}deg`;
    }).join(', ');
    return `conic-gradient(${stops})`;
  }, [player.wedges, emptySlot, wedgeOrder]);

  const rimLight = tint(player.color, 0.4);
  const rimDark = shade(player.color, 0.45);

  // Hops are described as "up on odd frames, down on even frames", so a 4-tile
  // move produces four arcs that always land flat on the destination.
  const hopHeight = size * 0.36;
  const hopFrameCount = stepCount * 2 + 1;
  const hopFrames = pathTiles
    ? Array.from({ length: hopFrameCount }, (_, index) => (index % 2 === 1 ? -hopHeight : 0))
    : null;
  const wobbleFrames = pathTiles
    ? Array.from({ length: hopFrameCount }, (_, index) =>
        index % 2 === 1 ? (index % 4 === 1 ? -3.5 : 3.5) : 0
      )
    : null;
  const hopTimes = pathTiles
    ? Array.from({ length: hopFrameCount }, (_, index) => index / (hopFrameCount - 1))
    : undefined;
  const shadowScaleFrames = pathTiles
    ? Array.from({ length: hopFrameCount }, (_, index) => (index % 2 === 1 ? 0.62 : 1))
    : null;
  const shadowOpacityFrames = shadowScaleFrames
    ? shadowScaleFrames.map(value => 0.2 + value * 0.35)
    : null;

  const zIndex = 20 + Math.round((currentTile.y / 1000) * 40) + stackIndex + (pathTiles ? 120 : 0);

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: size, height: boxH, zIndex }}
      initial={false}
      animate={{ x: pathTiles ? framesX : framesX[0], y: pathTiles ? framesY : framesY[0] }}
      transition={
        pathTiles
          ? { duration: travelDuration, times: travelTimes, ease: 'easeInOut' }
          : { duration: reducedMotion ? 0 : 0.34, ease: EASE_OUT_SOFT }
      }
      onAnimationComplete={handleTravelComplete}
      aria-hidden="true"
    >
      {/* Active-player spotlight, laid flat on the tile so it is obvious which
          tile the pawn actually occupies. */}
      {isActive && !pathTiles && (
        <div
          className="absolute rounded-[50%]"
          style={{
            width: size * 1.15,
            height: size * 0.42,
            left: -size * 0.075,
            top: groundY - size * 0.21,
            background: `radial-gradient(closest-side, ${withAlpha('#FBBF24', 0.55)}, ${withAlpha(
              '#F59E0B',
              0.12
            )} 65%, transparent 100%)`,
            border: `2px solid ${withAlpha('#FBBF24', 0.75)}`
          }}
        />
      )}

      {/* Landing shockwave */}
      {impact && (
        <motion.div
          className="pointer-events-none absolute rounded-[50%] border-2"
          style={{
            width: size * 0.9,
            height: size * 0.3,
            left: size * 0.05,
            top: groundY - size * 0.15,
            borderColor: withAlpha(player.color, 0.9)
          }}
          initial={{ scale: 0.5, opacity: 0.95 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      )}

      {/* Contact shadow: squashes while the pawn is airborne */}
      <motion.div
        className="pointer-events-none absolute rounded-[50%] bg-slate-950/75"
        style={{
          width: size * 0.68,
          height: size * 0.19,
          left: size * 0.16,
          top: groundY - size * 0.095
        }}
        animate={{
          scale: shadowScaleFrames ?? 1,
          opacity: shadowOpacityFrames ?? 0.55
        }}
        transition={
          pathTiles ? { duration: travelDuration, times: hopTimes, ease: 'easeInOut' } : { duration: 0.3 }
        }
      />

      {/* Hop + landing pop */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: hopFrames ?? 0, rotate: wobbleFrames ?? 0 }}
        transition={
          pathTiles
            ? {
                y: { duration: travelDuration, times: hopTimes, ease: 'easeInOut' },
                rotate: { duration: travelDuration, times: hopTimes, ease: 'easeInOut' }
              }
            : { duration: 0.3, ease: EASE_OUT_SOFT }
        }
        style={{ transformOrigin: `50% ${groundY}px` }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ perspective: size * 3.4, transformOrigin: `50% ${groundY}px` }}
          animate={{ scale: impact ? [1, 1.13, 1] : 1 }}
          transition={{ duration: 0.45, ease: EASE_SPRING }}
        >
          {/* The token itself: an extruded disc seen in three-quarter view */}
          <div
            style={{
              position: 'absolute',
              left: (size - discD) / 2,
              top: discTop,
              width: discD,
              height: discD,
              transformStyle: 'preserve-3d',
              transform: 'rotateY(-24deg) rotateX(10deg)'
            }}
          >
            {/* Extrusion: stacked slices give the disc real thickness */}
            {Array.from({ length: layerCount }).map((_, index) => (
              <div
                key={`extrusion_${index}`}
                className="absolute inset-0 rounded-full"
                style={{
                  transform: `translateZ(${-(index + 1) * thickness}px)`,
                  background: `linear-gradient(145deg, ${rimLight}, ${rimDark})`,
                  filter: `brightness(${Math.max(0.42, 1 - index * 0.075)})`
                }}
              />
            ))}

            {/* Front face: player-coloured rim around the camembert holder */}
            <div
              className="absolute inset-0 overflow-hidden rounded-full"
              style={{
                background: `linear-gradient(150deg, ${rimLight} 0%, ${player.color} 45%, ${rimDark} 100%)`,
                padding: Math.max(2, discD * 0.09),
                boxShadow: `0 ${discD * 0.06}px ${discD * 0.18}px rgba(2, 6, 23, 0.65), inset 0 0 ${discD * 0.1}px rgba(255,255,255,0.35)`
              }}
            >
              {/* Six wedge slots */}
              <div className="relative h-full w-full rounded-full" style={{ background: holderGradient }}>
                {/* Slot dividers */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'repeating-conic-gradient(rgba(15,23,42,0) 0deg 58.6deg, rgba(15,23,42,0.65) 58.6deg 61.4deg)'
                  }}
                />

                {/* Glossy cap with the player's avatar */}
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: '46%',
                    height: '46%',
                    left: '27%',
                    top: '27%',
                    background: `radial-gradient(circle at 32% 28%, ${tint(player.color, 0.55)}, ${player.color} 62%, ${rimDark})`,
                    border: `${Math.max(1, discD * 0.028)}px solid rgba(255,255,255,0.92)`,
                    boxShadow: `0 ${discD * 0.03}px ${discD * 0.08}px rgba(2,6,23,0.55)`,
                    fontSize: discD * 0.24,
                    lineHeight: 1
                  }}
                >
                  <span style={{ transform: 'translateY(2%)' }}>{avatar.emoji}</span>
                </div>

                {/* Static specular highlight. A moving sheen kept the GPU busy
                    for the whole turn without adding gameplay information. */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.45), rgba(255,255,255,0) 55%)'
                  }}
                />
              </div>
            </div>

            {/* Camembert won: golden burst around the holder */}
            {wedgeFlash && (
              <motion.div
                className="pointer-events-none absolute rounded-full border-2 border-amber-300"
                style={{ inset: -discD * 0.12 }}
                initial={{ scale: 0.7, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut', repeat: 1 }}
              />
            )}
          </div>

          {/* "It is my turn" caret above the token */}
          {isActive && (
            <div
              className="absolute flex flex-col items-center"
              style={{ left: 0, right: 0, top: -size * 0.26 }}
            >
              <div
                className="rounded-full px-1.5 py-0.5 font-black text-slate-950 shadow-lg"
                style={{
                  fontSize: Math.max(7, size * 0.19),
                  background: 'linear-gradient(135deg, #FDE047, #F59E0B)',
                  lineHeight: 1.25
                }}
              >
                {isSelf ? 'VOUS' : '▼'}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
