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

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  onRollRequest,
  disabled = false,
  size = 88,
  compact = false,
  hideTriggerButton = false,
  flight = null
}) => {
  // Store cumulative rotation angles so die spins forward smoothly without snapping
  const [rotation, setRotation] = useState({ rx: 15, ry: -25, rz: 0 });
  const [impactRipple, setImpactRipple] = useState(false);
  
  // Interactive gesture drag state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Track previous rolling state and roll spin animation lock to prevent multiple spin loops
  const prevIsRollingRef = useRef(false);
  const currentTurnSpinRef = useRef<{ extraX: number; extraY: number } | null>(null);

  const halfSize = size / 2;
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
    const baseRot = FACE_ROTATIONS[targetFace] || FACE_ROTATIONS[1];

    if (isNowRolling && !wasRolling) {
      // Rolling started: play sound and pick fixed extra spin turns for THIS roll sequence
      soundManager.playDiceRoll();

      // Avec un parcours, les tours viennent de la graine du serveur : tous les
      // écrans voient la même culbute, comme ils voient le même déplacement.
      const extraX = (flight?.spin.x ?? Math.floor(Math.random() * 2) + 2) * 360;
      const extraY = (flight?.spin.y ?? Math.floor(Math.random() * 2) + 2) * 360;
      currentTurnSpinRef.current = { extraX, extraY };

      setRotation((prev) => {
        const nextRx = Math.ceil(prev.rx / 360) * 360 + extraX + baseRot.rx;
        const nextRy = Math.ceil(prev.ry / 360) * 360 + extraY + baseRot.ry;
        return { rx: nextRx, ry: nextRy, rz: 0 };
      });
    } else if (isNowRolling && wasRolling && value) {
      // Value arrived while rolling: update target face orientation WITHOUT adding extra turns
      setRotation((prev) => {
        const currentTurnsX = Math.floor(prev.rx / 360) * 360;
        const currentTurnsY = Math.floor(prev.ry / 360) * 360;
        return {
          rx: currentTurnsX + baseRot.rx,
          ry: currentTurnsY + baseRot.ry,
          rz: 0
        };
      });
    } else if (!isNowRolling && wasRolling) {
      // Rolling ended: land cleanly on final face and trigger impact shockwave
      currentTurnSpinRef.current = null;
      setRotation((prev) => {
        const currentTurnsX = Math.floor(prev.rx / 360) * 360;
        const currentTurnsY = Math.floor(prev.ry / 360) * 360;
        return {
          rx: currentTurnsX + baseRot.rx,
          ry: currentTurnsY + baseRot.ry,
          rz: 0
        };
      });

      setImpactRipple(true);
      soundManager.playClick();
      const timer = setTimeout(() => setImpactRipple(false), 500);
      return () => clearTimeout(timer);
    } else if (!isNowRolling && value && value >= 1 && value <= 6) {
      // Idle state update (e.g. initial render or value display)
      setRotation((prev) => {
        const currentTurnsX = Math.floor(prev.rx / 360) * 360;
        const currentTurnsY = Math.floor(prev.ry / 360) * 360;
        return {
          rx: currentTurnsX + baseRot.rx,
          ry: currentTurnsY + baseRot.ry,
          rz: 0
        };
      });
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
        className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing p-4 rounded-3xl select-none touch-none ${
          !disabled && !isRolling ? 'hover:bg-amber-500/10 active:bg-amber-500/20' : ''
        }`}
        style={{
          width: `${size * (compact ? 1.6 : 1.9)}px`,
          height: `${size * (compact ? 1.6 : 1.9)}px`,
          perspective: `${size * 9}px`,
          touchAction: 'none'
        }}
        animate={
          voyage
            ? { x: flight.x, y: flight.y }
            : pose
            ? { x: chute.x, y: chute.y }
            : { x: 0, y: 0 }
        }
        transition={
          voyage
            ? { duration: flight.durationMs / 1000, times: flight.times, ease: 'linear' }
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
          className="relative transform-gpu pointer-events-none"
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
          {/* FACE 1 (Front) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-visible"
            style={{ transform: `rotateY(0deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(1)}
          </div>

          {/* FACE 2 (Right) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-visible"
            style={{ transform: `rotateY(90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(2)}
          </div>

          {/* FACE 3 (Top) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-visible"
            style={{ transform: `rotateX(90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(3)}
          </div>

          {/* FACE 4 (Bottom) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-visible"
            style={{ transform: `rotateX(-90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(4)}
          </div>

          {/* FACE 5 (Left) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-visible"
            style={{ transform: `rotateY(-90deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(5)}
          </div>

          {/* FACE 6 (Back) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[inset_0_0_14px_rgba(217,119,6,0.3)] flex items-center justify-center backface-visible"
            style={{ transform: `rotateY(180deg) translateZ(${halfSize}px)` }}
          >
            {renderFacePips(6)}
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
