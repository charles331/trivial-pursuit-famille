import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../utils/sound';
import { Dices, Sparkles, Hand, ArrowUp, RefreshCw } from 'lucide-react';

interface Dice3DProps {
  value: number | null; // 1 to 6 or null
  isRolling: boolean;
  onRollRequest?: () => void;
  disabled?: boolean;
  size?: number; // size in px, e.g. 88
  /** Drops the verbose helper text so the die fits a mobile action dock. */
  compact?: boolean;
  /**
   * Retire le bouton « Lancer le dé » : le dé lui-même se touche et se lance,
   * ce qui suffit lorsqu'il est posé sur le plateau et que la place manque.
   */
  hideTriggerButton?: boolean;
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
  hideTriggerButton = false
}) => {
  // Store cumulative rotation angles so die spins forward smoothly without snapping
  const [rotation, setRotation] = useState({ rx: 15, ry: -25, rz: 0 });
  const [impactRipple, setImpactRipple] = useState(false);
  
  // Interactive gesture drag state
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [swipePower, setSwipePower] = useState(0); // 0 to 100%
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Track previous rolling state and roll spin animation lock to prevent multiple spin loops
  const prevIsRollingRef = useRef(false);
  const currentTurnSpinRef = useRef<{ extraX: number; extraY: number } | null>(null);

  const halfSize = size / 2;

  const triggerRoll = () => {
    if (disabled || isRolling) return;
    onRollRequest?.();
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

      const extraX = (Math.floor(Math.random() * 2) + 2) * 360; // 720 or 1080 deg
      const extraY = (Math.floor(Math.random() * 2) + 2) * 360;
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
    setSwipePower(0);
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

    // Calculate dynamic power percentage (0 to 100%)
    const power = Math.min(100, Math.round((dist / 100) * 100));
    setSwipePower(power);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) return;

    const dt = Math.max(10, Date.now() - touchStartRef.current.time);
    const dx = e.clientX - touchStartRef.current.x;
    const dy = e.clientY - touchStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    const velocity = (dist / dt) * 1000; // px/sec

    touchStartRef.current = null;
    setDragOffset(null);

    // Trigger roll request if swiped (>10px or velocity > 100) OR simple tap/click
    if (!disabled && !isRolling) {
      if (dist >= 8 || velocity >= 80 || dt < 350) {
        triggerRoll();
      }
    }
  };

  // Helper to render pips/dots on each face
  const renderFacePips = (faceNumber: number) => {
    const activeIndices = PIP_LAYOUTS[faceNumber] || [];
    return (
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-2.5 items-center justify-items-center">
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
                    width: `${size * 0.19}px`,
                    height: `${size * 0.19}px`,
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
      {/* Swipe Power Gauge Header when dragging */}
      <AnimatePresence>
        {dragOffset && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-11 z-30 flex items-center gap-2 bg-slate-900/95 border border-amber-400/80 px-4 py-1.5 rounded-full shadow-2xl text-xs font-black text-amber-300"
          >
            <ArrowUp className="w-4 h-4 animate-bounce text-amber-400" />
            <span>Puissance : {swipePower}%</span>
            <div className="w-20 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-75"
                style={{ width: `${Math.max(8, swipePower)}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch & Drag Target Area */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing p-4 rounded-3xl transition-all select-none touch-none ${
          !disabled && !isRolling ? 'hover:bg-amber-500/10 active:bg-amber-500/20' : ''
        }`}
        style={{
          width: `${size * (compact ? 1.6 : 1.9)}px`,
          height: `${size * (compact ? 1.6 : 1.9)}px`,
          perspective: `${size * 9}px`,
          touchAction: 'none'
        }}
      >
        {/* Dynamic Shadow on Felt Table Surface */}
        <motion.div
          className="absolute rounded-full bg-slate-950/80 blur-md pointer-events-none"
          style={{
            width: `${size * 1.25}px`,
            height: `${size * 0.4}px`,
            bottom: `${size * 0.12}px`
          }}
          animate={{
            scale: isRolling ? [1, 0.3, 1.3, 0.8, 1] : dragOffset ? 0.75 : 1,
            opacity: isRolling ? [0.8, 0.2, 0.9, 0.5, 0.8] : 0.65,
          }}
          transition={{ duration: 1.25, ease: "easeInOut" }}
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
            y: isRolling
              ? [-90, -110, -15, -35, 0]
              : dragOffset
              ? dragOffset.y * 0.5
              : 0,
          }}
          transition={{
            y: isRolling
              ? { duration: 1.25, times: [0, 0.3, 0.7, 0.85, 1], ease: [0.22, 1, 0.36, 1] }
              : dragOffset
              ? { duration: 0 }
              : { duration: 0.2 },
            rotateX: dragOffset ? { duration: 0 } : { duration: 1.25, ease: [0.15, 0.85, 0.35, 1] },
            rotateY: dragOffset ? { duration: 0 } : { duration: 1.25, ease: [0.15, 0.85, 0.35, 1] },
            rotateZ: { duration: 1.25, ease: [0.15, 0.85, 0.35, 1] },
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
      </div>

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
              triggerRoll();
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
