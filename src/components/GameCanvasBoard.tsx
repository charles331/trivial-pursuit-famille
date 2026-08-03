import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, BoardTile, CategoryId, BoardConfig } from '../types';
import { BOARD_PRESETS, resolveTilePath } from '../data/boards';
import { CATEGORIES } from '../data/categories';
import { AVATARS } from '../data/avatars';
import { PlayerWedgeBadge } from './PlayerWedgeBadge';
import { PlayerPawn3D } from './PlayerPawn3D';
import { Dice3D } from './Dice3D';
import {
  Dices,
  Crown,
  Landmark,
  Globe,
  Film,
  Microscope,
  Palette,
  Music,
  Utensils,
  Star,
  RefreshCw,
  Gift,
  Trophy,
  Maximize2,
  Minimize2,
  Hourglass,
  MoveRight
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { isCardReadAloud } from '../server/turnRoles';
import { EASE_OUT_SOFT, readableInk, useMediaQuery, usePrefersReducedMotion, withAlpha } from '../utils/motion';

interface GameCanvasBoardProps {
  gameState: GameState;
  currentUserId: string;
  onRollDice: () => void;
  onSelectTile: (tileId: number) => void;
}

/** Order of the 6 scoring categories around the wheel and inside the pawns. */
const MAIN_CATEGORIES: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports'
];

const CATEGORY_ICONS: Record<CategoryId, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  histoire: Landmark,
  geographie: Globe,
  cinema: Film,
  sciences: Microscope,
  art: Palette,
  sports: Trophy,
  popculture: Music,
  gastronomie: Utensils
};

const SPECIAL_TILES = {
  reroll: { color: '#06B6D4', label: 'Re-lance', icon: RefreshCw },
  surprise: { color: '#EC4899', label: 'Surprise', icon: Gift },
  hub: { color: '#F59E0B', label: 'Centre', icon: Star }
} as const;

function tileColor(tile: BoardTile): string {
  if (tile.type === 'reroll') return SPECIAL_TILES.reroll.color;
  if (tile.type === 'surprise') return SPECIAL_TILES.surprise.color;
  if (tile.type === 'hub') return SPECIAL_TILES.hub.color;
  return tile.categoryId ? CATEGORIES[tile.categoryId].color : '#475569';
}

function tileIconOf(tile: BoardTile) {
  if (tile.type === 'reroll') return SPECIAL_TILES.reroll.icon;
  if (tile.type === 'surprise') return SPECIAL_TILES.surprise.icon;
  if (tile.type === 'hub') return SPECIAL_TILES.hub.icon;
  return tile.categoryId ? CATEGORY_ICONS[tile.categoryId] : Star;
}

function tileShortLabel(tile: BoardTile): string {
  if (tile.type === 'hub') return 'Centre · Victoire';
  if (tile.type === 'reroll') return 'Re-lance';
  if (tile.type === 'surprise') return 'Surprise';
  const category = tile.categoryId ? CATEGORIES[tile.categoryId].name : tile.label;
  return tile.type === 'camembert' || tile.isCamembert ? `Q.G. ${category}` : category;
}

/** Vector glyph placed at the centre of a tile, with contrast-aware ink. */
const TileGlyph: React.FC<{ tile: BoardTile; size: number; ink: string }> = ({ tile, size, ink }) => {
  const Icon = tileIconOf(tile);
  return (
    <g transform={`translate(${-size / 2}, ${-size / 2})`}>
      <Icon size={size} color={ink} strokeWidth={2.3} />
    </g>
  );
};

/** Rounded polyline through a list of points, used for tracks and previews. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/**
 * Frames a set of board points inside the viewport.
 * Returned translation is expressed in percentages of the board box, and
 * clamped so zooming never reveals empty space around the board.
 */
function computeCamera(
  points: { x: number; y: number }[],
  enabled: boolean,
  maxScale: number
): { scale: number; x: string; y: string } {
  if (!enabled || points.length === 0) return { scale: 1, x: '0%', y: '0%' };

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 170;
  const span = Math.max(maxX - minX, maxY - minY) + padding * 2;
  const scale = Math.max(1, Math.min(maxScale, 1000 / span));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const limit = (scale - 1) * 50;
  const clamp = (value: number) => Math.max(-limit, Math.min(limit, value));

  return {
    scale,
    x: `${clamp((-scale * (centerX - 500)) / 10)}%`,
    y: `${clamp((-scale * (centerY - 500)) / 10)}%`
  };
}

/** Static artwork of the board: felt, sectors, rails and central medallion. */
const BoardBackdrop: React.FC<{ config: BoardConfig }> = ({ config }) => {
  if (config.layout === 'grid') {
    const ordered = [...config.tiles].sort((a, b) => a.id - b.id);
    return (
      <g>
        <rect x="18" y="18" width="964" height="964" rx="72" fill="url(#boardFelt)" stroke="#1E293B" strokeWidth="6" />
        <rect x="46" y="46" width="908" height="908" rx="56" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.07" />
        <path
          d={smoothPath(ordered)}
          fill="none"
          stroke="#0B1220"
          strokeWidth="76"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smoothPath(ordered)}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="72"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.06"
        />
      </g>
    );
  }

  return (
    <g>
      {/* Felt surface */}
      <circle cx="500" cy="500" r="492" fill="url(#boardFelt)" />
      <circle cx="500" cy="500" r="492" fill="none" stroke="#1E293B" strokeWidth="8" />
      <circle cx="500" cy="500" r="474" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.08" />

      {/* Six 60° category sectors: each branch of the wheel gets its own
          coloured region, which is what makes the board readable at a glance
          once it is scaled down to a phone screen. */}
      {MAIN_CATEGORIES.map((categoryId, index) => {
        const color = CATEGORIES[categoryId].color;
        const start = ((index * 60 - 30) - 90) * (Math.PI / 180);
        const end = ((index * 60 + 30) - 90) * (Math.PI / 180);
        const inner = 112;
        const outer = 470;
        const d = [
          `M ${500 + inner * Math.cos(start)} ${500 + inner * Math.sin(start)}`,
          `L ${500 + outer * Math.cos(start)} ${500 + outer * Math.sin(start)}`,
          `A ${outer} ${outer} 0 0 1 ${500 + outer * Math.cos(end)} ${500 + outer * Math.sin(end)}`,
          `L ${500 + inner * Math.cos(end)} ${500 + inner * Math.sin(end)}`,
          `A ${inner} ${inner} 0 0 0 ${500 + inner * Math.cos(start)} ${500 + inner * Math.sin(start)}`,
          'Z'
        ].join(' ');

        return (
          <g key={`sector_${categoryId}`}>
            <path d={d} fill={color} opacity={index % 2 === 0 ? 0.16 : 0.11} />
            <path
              d={`M ${500 + 466 * Math.cos(start)} ${500 + 466 * Math.sin(start)} A 466 466 0 0 1 ${
                500 + 466 * Math.cos(end)
              } ${500 + 466 * Math.sin(end)}`}
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeLinecap="butt"
              opacity="0.85"
            />
          </g>
        );
      })}

      {/* Spoke tracks */}
      {MAIN_CATEGORIES.map((_, index) => {
        const rad = (index * 60 - 90) * (Math.PI / 180);
        return (
          <line
            key={`spoke_track_${index}`}
            x1={500 + 105 * Math.cos(rad)}
            y1={500 + 105 * Math.sin(rad)}
            x2={500 + 384 * Math.cos(rad)}
            y2={500 + 384 * Math.sin(rad)}
            stroke="#0B1220"
            strokeWidth="72"
            strokeLinecap="round"
            opacity="0.92"
          />
        );
      })}

      {/* Outer ring track */}
      <circle cx="500" cy="500" r="380" fill="none" stroke="#0B1220" strokeWidth="76" opacity="0.92" />
      <circle cx="500" cy="500" r="418" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.12" />
      <circle cx="500" cy="500" r="342" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.12" />

      {/* Central hub: wedge ring + gold medallion */}
      <g>
        {MAIN_CATEGORIES.map((categoryId, index) => {
          const outer = 104;
          const inner = 62;
          const start = (index * 60 - 90) * (Math.PI / 180);
          const end = ((index + 1) * 60 - 90) * (Math.PI / 180);
          const d = [
            `M ${500 + inner * Math.cos(start)} ${500 + inner * Math.sin(start)}`,
            `L ${500 + outer * Math.cos(start)} ${500 + outer * Math.sin(start)}`,
            `A ${outer} ${outer} 0 0 1 ${500 + outer * Math.cos(end)} ${500 + outer * Math.sin(end)}`,
            `L ${500 + inner * Math.cos(end)} ${500 + inner * Math.sin(end)}`,
            `A ${inner} ${inner} 0 0 0 ${500 + inner * Math.cos(start)} ${500 + inner * Math.sin(start)}`,
            'Z'
          ].join(' ');
          return <path key={`hub_slice_${categoryId}`} d={d} fill={CATEGORIES[categoryId].color} opacity="0.95" />;
        })}
        <circle cx="500" cy="500" r="104" fill="none" stroke="#0B1220" strokeWidth="4" />
        <circle cx="500" cy="500" r="60" fill="url(#hubGold)" stroke="#0B1220" strokeWidth="4" />
        <circle cx="500" cy="500" r="48" fill="#0B1220" opacity="0.92" />
        <text x="500" y="494" textAnchor="middle" fontSize="26">
          🏆
        </text>
        <text x="500" y="520" textAnchor="middle" fill="#FDE047" fontSize="13" fontWeight="900" letterSpacing="1.5">
          CENTRE
        </text>
      </g>
    </g>
  );
};

const GameCanvasBoardComponent: React.FC<GameCanvasBoardProps> = ({
  gameState,
  currentUserId,
  onRollDice,
  onSelectTile
}) => {
  const [isRollingLocally, setIsRollingLocally] = useState(false);
  const [showingResultPause, setShowingResultPause] = useState<number | null>(null);
  const [showTurnIntro, setShowTurnIntro] = useState(true);
  const [hasRequestedRoll, setHasRequestedRoll] = useState(false);
  const [previewTileId, setPreviewTileId] = useState<number | null>(null);
  const [boardPx, setBoardPx] = useState(0);

  const prevDiceValRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<GameState['phase'] | null>(null);
  const prevActiveIndexRef = useRef<number | null>(null);
  const resultPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollGuardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardBoxRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = usePrefersReducedMotion();
  const isCompact = !useMediaQuery('(min-width: 640px)');
  const [autoFocus, setAutoFocus] = useState(true);

  // Sync userId from localStorage fallback if missing
  const storedSessionStr = typeof window !== 'undefined' ? localStorage.getItem('tp_fam_session') : null;
  const storedPlayerId = storedSessionStr
    ? (function () {
        try {
          return JSON.parse(storedSessionStr)?.playerId;
        } catch (e) {
          return null;
        }
      })()
    : null;
  const effectiveUserId = currentUserId || storedPlayerId;

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.players[0];
  const isMyTurn =
    activePlayer?.id === effectiveUserId || gameState.settings.isLocalMode || gameState.players.length === 1;
  const boardConfig = BOARD_PRESETS[gameState.settings.boardType] || BOARD_PRESETS.wheel;
  const tiles = boardConfig.tiles;

  const isChoosing = gameState.phase === 'moving';
  const possibleDestinationTiles = gameState.possibleMoves
    .map(tileId => tiles.find(tile => tile.id === tileId))
    .filter((tile): tile is BoardTile => Boolean(tile));

  const originTile = tiles.find(tile => tile.id === activePlayer?.currentTileId) || tiles[0];

  const destinationLabel = (tile: BoardTile) => {
    if (tile.type === 'hub') return 'Centre du plateau (Victoire)';
    if (tile.type === 'reroll') return 'Case Re-lance (Rejouer)';
    if (tile.type === 'surprise') return 'Case Surprise (Joker)';
    const category = tile.categoryId ? CATEGORIES[tile.categoryId]?.name : null;
    return `${category || tile.label}${tile.type === 'camembert' || tile.isCamembert ? ' · 🏆 Q.G. Camembert' : ''}`;
  };

  // ------------------------------------------------------------- measurements
  useEffect(() => {
    const element = boardBoxRef.current;
    if (!element) return;

    // clientWidth (not the bounding rect) matches the inner box the pawn layer
    // and the SVG are stretched to, so pawn coordinates stay pixel-aligned with
    // the tiles even though the stage has a border.
    const update = () => setBoardPx(element.clientWidth);
    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ------------------------------------------------------------- turn plumbing
  // Reset roll guard state whenever phase returns to rolling or player turn switches
  useEffect(() => {
    const cameFromPhase = prevPhaseRef.current;
    const playerChanged = prevActiveIndexRef.current !== gameState.activePlayerIndex;
    prevPhaseRef.current = gameState.phase;
    prevActiveIndexRef.current = gameState.activePlayerIndex;

    setPreviewTileId(null);
    if (rollGuardTimerRef.current) {
      clearTimeout(rollGuardTimerRef.current);
      rollGuardTimerRef.current = null;
    }
    if (gameState.phase === 'rolling') {
      // L'écran « passez l'appareil » n'a de sens que si l'appareil doit
      // changer de mains : nouveau joueur, ou retour de l'appareil après une
      // carte lue à voix haute par le voisin (mode lecteur). Une case
      // Re-lance ou une bonne réponse sans lecteur gardent le même joueur et
      // le même appareil : le lui redemander serait une interruption.
      setShowTurnIntro(
        playerChanged
        || cameFromPhase === null
        || cameFromPhase === 'first_player_roll'
        || (cameFromPhase === 'evaluating' && isCardReadAloud(gameState.settings))
      );
      // This must be React state rather than a ref: a correct answer can return
      // to "rolling" without changing the active player, and refs do not render
      // the newly enabled die/button on their own.
      setHasRequestedRoll(false);
      setIsRollingLocally(false);
      setShowingResultPause(null);
      prevDiceValRef.current = null;
    }
  }, [gameState.phase, gameState.activePlayerIndex]);

  // Handle dice roll result arriving from server cleanly
  useEffect(() => {
    if (
      gameState.diceValue !== null &&
      gameState.diceValue !== prevDiceValRef.current &&
      gameState.phase === 'moving'
    ) {
      prevDiceValRef.current = gameState.diceValue;
      const resultVal = gameState.diceValue;

      // Allow 3D tumble animation to complete cleanly for 0.85s
      setIsRollingLocally(true);

      const tumbleTimer = setTimeout(() => {
        setIsRollingLocally(false);
        setShowingResultPause(resultVal);

        resultPauseTimerRef.current = setTimeout(() => {
          setShowingResultPause(null);
          resultPauseTimerRef.current = null;
        }, 1200);
      }, 850);

      return () => {
        clearTimeout(tumbleTimer);
        if (resultPauseTimerRef.current) {
          clearTimeout(resultPauseTimerRef.current);
          resultPauseTimerRef.current = null;
        }
      };
    }
  }, [gameState.diceValue, gameState.phase]);

  useEffect(
    () => () => {
      if (resultPauseTimerRef.current) clearTimeout(resultPauseTimerRef.current);
      if (rollGuardTimerRef.current) clearTimeout(rollGuardTimerRef.current);
    },
    []
  );

  const handleRollClick = () => {
    if (!isMyTurn || gameState.phase !== 'rolling' || hasRequestedRoll) return;

    setHasRequestedRoll(true);
    setIsRollingLocally(true);

    // Request roll from server
    onRollDice();

    // Auto-release guard safety timeout after 2.5s if server state doesn't update phase
    rollGuardTimerRef.current = setTimeout(() => {
      setHasRequestedRoll(false);
      setIsRollingLocally(false);
      rollGuardTimerRef.current = null;
    }, 2500);
  };

  const handleChooseTile = (tileId: number) => {
    if (!isMyTurn || !isChoosing) return;
    soundManager.playClick();
    setPreviewTileId(null);
    onSelectTile(tileId);
  };

  // --------------------------------------------------------------- move preview
  const previewTargetId =
    previewTileId ?? (possibleDestinationTiles.length === 1 ? possibleDestinationTiles[0].id : null);

  // ------------------------------------------------------------------- camera
  const focusPoints = useMemo(() => {
    if (!originTile) return [];
    // Highlighting one destination zooms onto that single trip, which is what
    // makes "where would I land?" readable on a phone.
    if (isChoosing && previewTileId !== null) {
      const target = tiles.find(tile => tile.id === previewTileId);
      if (target) return [originTile, target];
    }
    if (isChoosing && possibleDestinationTiles.length > 0) {
      return [originTile, ...possibleDestinationTiles];
    }
    return [originTile];
  }, [originTile, isChoosing, previewTileId, gameState.possibleMoves.join(','), gameState.phase]);

  const cameraEnabled = autoFocus && isCompact && boardConfig.layout !== 'grid';
  const camera = computeCamera(focusPoints, cameraEnabled, isChoosing ? 1.7 : 1.45);

  const previewPath = useMemo(() => {
    if (!isChoosing || !originTile || previewTargetId === null) return null;
    const path = resolveTilePath(tiles, originTile.id, previewTargetId, gameState.diceValue);
    return path.length > 1 ? path : null;
  }, [isChoosing, originTile?.id, previewTargetId, gameState.diceValue, tiles]);

  // ---------------------------------------------------------------- pawn stacks
  const pawnStacks = useMemo(() => {
    const stacks = new Map<number, string[]>();
    gameState.players.forEach(player => {
      const ids = stacks.get(player.currentTileId) || [];
      ids.push(player.id);
      stacks.set(player.currentTileId, ids);
    });
    return stacks;
  }, [gameState.players]);

  // The dock shows exactly one thing at a time. Deriving a single mode keeps
  // AnimatePresence in charge of one child and avoids the die and the
  // destination list fighting over the same slot while the die still tumbles.
  const dockMode: 'roll' | 'move' | 'question' | 'idle' =
    gameState.phase === 'rolling' || isRollingLocally || showingResultPause !== null
      ? 'roll'
      : isChoosing
      ? 'move'
      : gameState.phase === 'question' || gameState.phase === 'evaluating'
      ? 'question'
      : 'idle';

  const phaseHint = () => {
    if (gameState.phase === 'rolling') return isMyTurn ? 'Lancez le dé pour avancer' : 'En attente du lancer…';
    if (gameState.phase === 'moving') return isMyTurn ? 'Choisissez votre case d’arrivée' : 'Choix de la destination…';
    if (gameState.phase === 'question') return 'Question en cours';
    if (gameState.phase === 'evaluating') return 'Résultat de la réponse';
    return '';
  };

  return (
    <section className="relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-2 shadow-2xl sm:p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.10),_transparent_60%)]" />

      <p className="sr-only" aria-live="polite">
        Tour de {activePlayer?.name}. {phaseHint()}.
      </p>

      {/* ------------------------------------------------------------ status bar */}
      <header className="z-10 flex w-full items-center justify-between gap-2 px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <motion.div
            key={activePlayer?.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: EASE_OUT_SOFT }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-400/80 text-2xl shadow-lg"
            style={{ backgroundColor: activePlayer?.color || '#3B82F6' }}
          >
            {AVATARS.find(a => a.id === activePlayer?.avatarId)?.emoji || '🦁'}
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 sm:text-sm">
              <Crown className="h-4 w-4 shrink-0" />
              <span className="truncate">{activePlayer?.name}</span>
              {isMyTurn && !gameState.settings.isLocalMode && (
                <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950">
                  VOUS
                </span>
              )}
            </div>
            <div className="truncate text-[11px] font-medium text-slate-300 sm:text-xs">{phaseHint()}</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <AnimatePresence>
            {gameState.diceValue !== null && (
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT_SOFT }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-black text-slate-950 shadow-lg"
                title={`Résultat du dé : ${gameState.diceValue}`}
              >
                {gameState.diceValue}
              </motion.div>
            )}
          </AnimatePresence>

          {isCompact && boardConfig.layout !== 'grid' && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setAutoFocus(value => !value);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 transition-colors active:bg-slate-800"
              aria-pressed={autoFocus}
              title={autoFocus ? 'Voir tout le plateau' : 'Zoom automatique sur votre pion'}
            >
              {autoFocus ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      </header>

      {/* ---------------------------------------------------------- board stage */}
      <div
        ref={boardBoxRef}
        className="relative z-10 aspect-square w-full max-w-[680px] overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950"
      >
        <motion.div
          className="absolute inset-0 origin-center"
          animate={camera}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: EASE_OUT_SOFT }}
        >
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" role="presentation">
            <defs>
              <radialGradient id="boardFelt" cx="48%" cy="38%" r="72%">
                <stop offset="0%" stopColor="#1B2A4A" />
                <stop offset="58%" stopColor="#101C33" />
                <stop offset="100%" stopColor="#060B16" />
              </radialGradient>

              <linearGradient id="hubGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="48%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>

              <marker
                id="pathArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="4.5"
                markerHeight="4.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#FDE047" />
              </marker>
            </defs>

            <BoardBackdrop config={boardConfig} />

            {/* Glow bed of the previewed trajectory, under the tiles */}
            {previewPath && (
              <path
                d={smoothPath(previewPath)}
                fill="none"
                stroke={withAlpha(tileColor(previewPath[previewPath.length - 1]), 0.55)}
                strokeWidth="30"
                strokeLinecap="round"
              />
            )}

            {/* ------------------------------------------------------ board tiles */}
            {tiles.map(tile => {
              if (tile.type === 'hub' && boardConfig.layout !== 'grid') return null;

              const isCamembert = tile.type === 'camembert' || tile.isCamembert;
              const radius = isCamembert ? 44 : 33;
              const color = tileColor(tile);
              const ink = readableInk(color);
              const isDestination = isChoosing && gameState.possibleMoves.includes(tile.id);
              const isDimmed = isChoosing && !isDestination && tile.id !== originTile?.id;

              return (
                <g key={`tile_${tile.id}`} opacity={isDimmed ? 0.55 : 1} className="transition-opacity duration-300">
                  <g>
                    {/* Q.G. tiles wear a static golden crown ring. Keeping this
                        static avoids continuously repainting SVG on mobile. */}
                    {isCamembert && (
                      <circle
                        cx={tile.x}
                        cy={tile.y}
                        r={radius + 9}
                        fill="none"
                        stroke="#FDE047"
                        strokeWidth="4"
                        strokeDasharray="10 7"
                        style={{ transformOrigin: `${tile.x}px ${tile.y}px` }}
                      />
                    )}

                    <circle cx={tile.x} cy={tile.y} r={radius} fill={color} />
                    {/* Bevel: light catches the top of every tile */}
                    <circle
                      cx={tile.x}
                      cy={tile.y - radius * 0.16}
                      r={radius * 0.82}
                      fill="#FFFFFF"
                      opacity="0.14"
                    />
                    <circle
                      cx={tile.x}
                      cy={tile.y}
                      r={radius}
                      fill="none"
                      stroke="#050B18"
                      strokeWidth={isCamembert ? 5 : 4}
                    />
                    <circle
                      cx={tile.x}
                      cy={tile.y}
                      r={radius - 4}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  </g>

                  <g transform={`translate(${tile.x}, ${tile.y})`}>
                    <TileGlyph tile={tile} size={radius * (isCamembert ? 1.05 : 1.15)} ink={ink} />
                  </g>

                  {isCamembert && (
                    <g transform={`translate(${tile.x + radius * 0.72}, ${tile.y + radius * 0.72})`}>
                      <circle r="13" fill="#FDE047" stroke="#050B18" strokeWidth="3" />
                      <text y="5" textAnchor="middle" fontSize="14">
                        🍰
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Animated trajectory on top of the tiles: the pawn will hop along
                exactly these tiles once the destination is confirmed. */}
            {previewPath && (
              <g>
                <path
                  d={smoothPath(previewPath)}
                  fill="none"
                  stroke="#0B1120"
                  strokeWidth="13"
                  strokeLinecap="round"
                  opacity="0.55"
                />
                <path
                  d={smoothPath(previewPath)}
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="14 16"
                  markerEnd="url(#pathArrow)"
                />
                {previewPath.slice(1, -1).map((tile, index) => (
                  <circle
                    key={`preview_step_${tile.id}_${index}`}
                    cx={tile.x}
                    cy={tile.y}
                    r="10"
                    fill="#FDE047"
                    stroke="#0B1120"
                    strokeWidth="3"
                  />
                ))}
              </g>
            )}

            {/* ------------------------------------------- destination markers */}
            {isChoosing &&
              possibleDestinationTiles.map((tile, index) => {
                const color = tileColor(tile);
                const isPreview = previewTargetId === tile.id;
                const radius = tile.type === 'camembert' || tile.isCamembert ? 44 : tile.type === 'hub' ? 60 : 33;

                return (
                  <g
                    key={`destination_marker_${tile.id}`}
                    className={isMyTurn ? 'cursor-pointer' : undefined}
                    onClick={() => handleChooseTile(tile.id)}
                    // Hover preview is mouse-only: on touch, pointerenter fires
                    // on tap and the resulting camera move would slide the tile
                    // out from under the finger before the tap completes.
                    onPointerEnter={event => {
                      if (event.pointerType === 'mouse') setPreviewTileId(tile.id);
                    }}
                    onPointerLeave={event => {
                      if (event.pointerType !== 'mouse') return;
                      setPreviewTileId(current => (current === tile.id ? null : current));
                    }}
                  >
                    {/* Generous invisible tap target */}
                    <circle cx={tile.x} cy={tile.y} r={radius + 26} fill="transparent" />

                    <circle
                      cx={tile.x}
                      cy={tile.y}
                      r={radius + 12}
                      fill={withAlpha(color, isPreview ? 0.3 : 0.14)}
                      stroke="#FDE047"
                      strokeWidth={isPreview ? 7 : 4}
                      style={{ transformOrigin: `${tile.x}px ${tile.y}px` }}
                    />

                    {/* Numbered badge matching the chips in the dock */}
                    <g transform={`translate(${tile.x}, ${tile.y - radius - 30})`}>
                      <circle r="20" fill="#FDE047" stroke="#050B18" strokeWidth="3.5" />
                      <text y="7" textAnchor="middle" fontSize="22" fontWeight="900" fill="#0B1120">
                        {index + 1}
                      </text>
                    </g>
                  </g>
                );
              })}
          </svg>

          {/* -------------------------------------------------------- 3D pawns */}
          <div className="pointer-events-none absolute inset-0">
            {boardPx > 0 &&
              gameState.players.map((player, index) => {
                const stack = pawnStacks.get(player.currentTileId) || [player.id];
                const positionInStack = Math.max(0, stack.indexOf(player.id));
                const fanOffset = stack.length > 1 ? positionInStack - (stack.length - 1) / 2 : 0;

                return (
                  <PlayerPawn3D
                    key={`pawn_${player.id}`}
                    player={player}
                    tiles={tiles}
                    boardPx={boardPx}
                    isActive={index === gameState.activePlayerIndex}
                    isSelf={player.id === effectiveUserId}
                    diceValue={gameState.diceValue}
                    fanOffset={fanOffset}
                    stackIndex={positionInStack}
                    reducedMotion={reducedMotion}
                  />
                );
              })}
          </div>
        </motion.div>

        {/* --------------------------------------------------- board overlays */}
        {/* Dim while the die tumbles, without hiding the board */}
        <AnimatePresence>
          {isRollingLocally && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-none absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
            />
          )}
        </AnimatePresence>

        {/* Dice result flash */}
        <AnimatePresence>
          {showingResultPause !== null && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.25, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_SOFT }}
              className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center"
            >
              <div className="flex items-center gap-3 rounded-3xl border border-amber-400/70 bg-slate-950/85 px-5 py-3 shadow-2xl backdrop-blur-md">
                <Dices className="h-6 w-6 text-amber-400" />
                <span className="text-sm font-bold text-slate-200">
                  {/* Le flash s'affiche sur tous les appareils : « vous » n'est
                      juste que sur celui du joueur qui a lancé. */}
                  {isMyTurn ? 'Vous avancez de' : `${activePlayer?.name} avance de`}{' '}
                  <strong className="text-3xl font-black text-amber-300">{showingResultPause}</strong>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pass-the-device screen (local mode) */}
        <AnimatePresence>
          {showTurnIntro && gameState.settings.isLocalMode && gameState.phase === 'rolling' && isMyTurn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/95 p-5"
            >
              <motion.div
                initial={{ scale: 0.9, y: 16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: EASE_OUT_SOFT }}
                className="max-w-sm space-y-5 text-center"
              >
                <div
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 text-5xl shadow-2xl"
                  style={{ backgroundColor: activePlayer?.color }}
                >
                  {AVATARS.find(a => a.id === activePlayer?.avatarId)?.emoji || '🦁'}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-amber-400 sm:text-sm">
                    Nouveau tour (Mode Local)
                  </p>
                  <h2 className="text-3xl font-black text-white sm:text-4xl">Au tour de {activePlayer?.name}</h2>
                  <p className="mt-2 text-sm text-slate-300">Passez-lui l’appareil avant de continuer.</p>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setShowTurnIntro(false);
                  }}
                  className="tap-target w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-4 text-lg font-black text-slate-950 shadow-xl transition-transform hover:from-amber-400 hover:to-orange-400 active:scale-[0.98]"
                >
                  J’ai l’appareil, commencer !
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- act dock */}
      <div className="z-10 flex min-h-[92px] w-full items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/80 p-3 shadow-xl backdrop-blur-sm">
        <AnimatePresence mode="wait" initial={false}>
          {/* Roll the die */}
          {dockMode === 'roll' && (
            <motion.div
              key="dock-roll"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
              transition={{ duration: 0.24, ease: EASE_OUT_SOFT }}
              className="flex w-full flex-col items-center gap-1"
            >
              {gameState.lastTurnEventMessage && showingResultPause === null && (
                <div className="mb-1 rounded-xl border border-amber-500/60 bg-amber-950/80 px-3 py-1.5 text-center text-xs font-black text-amber-300 shadow-lg">
                  {gameState.lastTurnEventMessage}
                </div>
              )}

              {isMyTurn ? (
                <Dice3D
                  value={showingResultPause || gameState.diceValue}
                  isRolling={isRollingLocally}
                  onRollRequest={handleRollClick}
                  disabled={!isMyTurn || hasRequestedRoll}
                  size={isCompact ? 62 : 82}
                  compact={isCompact}
                />
              ) : (
                <div className="flex items-center gap-3 px-2 py-4">
                  <Hourglass className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-bold text-slate-300">
                    {activePlayer?.name} lance le dé…
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Choose a destination */}
          {dockMode === 'move' && (
            <motion.div
              key="dock-move"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
              transition={{ duration: 0.24, ease: EASE_OUT_SOFT }}
              className="w-full space-y-2"
            >
              <p className="text-center text-xs font-black uppercase tracking-wide text-amber-400">
                {isMyTurn ? 'Où déplacer votre pion ?' : `${activePlayer?.name} choisit sa destination`}
                {possibleDestinationTiles.length > 2 && (
                  <span className="ml-1.5 font-bold normal-case text-slate-400">
                    {possibleDestinationTiles.length} choix · faites défiler
                  </span>
                )}
              </p>

              <div className="no-scrollbar stagger-children flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible">
                {possibleDestinationTiles.map((tile, index) => {
                  const color = tileColor(tile);
                  const Icon = tileIconOf(tile);
                  const isPreview = previewTargetId === tile.id;

                  return (
                    <button
                      key={`destination_chip_${tile.id}`}
                      type="button"
                      disabled={!isMyTurn}
                      onClick={() => handleChooseTile(tile.id)}
                      onPointerEnter={event => {
                        if (event.pointerType === 'mouse') setPreviewTileId(tile.id);
                      }}
                      onPointerLeave={event => {
                        if (event.pointerType !== 'mouse') return;
                        setPreviewTileId(current => (current === tile.id ? null : current));
                      }}
                      onFocus={() => setPreviewTileId(tile.id)}
                      onBlur={() => setPreviewTileId(current => (current === tile.id ? null : current))}
                      className={`tap-target flex min-w-[62%] shrink-0 snap-start items-center gap-2 rounded-2xl border-2 bg-slate-800/90 px-2.5 py-2.5 text-left transition-all active:scale-[0.98] disabled:opacity-50 sm:min-w-0 sm:gap-2.5 sm:px-3 ${
                        isPreview ? 'bg-slate-700 shadow-lg ring-2 ring-amber-400/70' : ''
                      }`}
                      style={{ borderColor: color }}
                      aria-label={`Destination ${index + 1} : ${destinationLabel(tile)}`}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                        style={{ backgroundColor: '#FDE047', color: '#0B1120' }}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: color }}
                      >
                        <Icon size={17} color={readableInk(color)} strokeWidth={2.4} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-white sm:text-sm">
                          {tileShortLabel(tile)}
                        </span>
                        {(tile.type === 'camembert' || tile.isCamembert) && (
                          <span className="block text-[10px] font-bold text-amber-300">🍰 Gagnez un camembert</span>
                        )}
                        {tile.type === 'reroll' && (
                          <span className="block text-[10px] font-bold text-cyan-300">Rejouez aussitôt</span>
                        )}
                        {tile.type === 'hub' && (
                          <span className="block text-[10px] font-bold text-amber-300">Question finale</span>
                        )}
                      </span>
                      <MoveRight className="h-4 w-4 shrink-0 text-amber-400" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Question in progress */}
          {dockMode === 'question' && (
            <motion.div
              key="dock-question"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
              transition={{ duration: 0.24, ease: EASE_OUT_SOFT }}
              className="flex items-center justify-center gap-3 py-3"
            >
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-sm font-bold text-slate-300">
                {activePlayer?.name} répond à la question…
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --------------------------------------------------------- players rail */}
      <div className="no-scrollbar z-10 flex w-full snap-x gap-2 overflow-x-auto sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {gameState.players.map((player, index) => {
          const isActive = index === gameState.activePlayerIndex;
          const avatar = AVATARS.find(a => a.id === player.avatarId) || AVATARS[0];
          const target = gameState.settings.wedgesToWin || 6;

          return (
            <motion.div
              key={player.id}
              className={`flex min-w-[58%] shrink-0 snap-start items-center justify-between gap-2 rounded-2xl border p-2.5 transition-all sm:min-w-0 ${
                isActive
                  ? 'border-amber-500 bg-slate-800/90 shadow-lg ring-2 ring-amber-500/40'
                  : 'border-slate-800 bg-slate-900/60 opacity-80'
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-base shadow-inner"
                  style={{ backgroundColor: player.color }}
                >
                  {avatar.emoji}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-bold text-slate-200">
                    {player.name}
                    {player.id === effectiveUserId && <span className="text-amber-400"> · vous</span>}
                  </div>
                  <div className="text-[10px] font-medium text-slate-400">
                    {player.wedges.length}/{target} camemberts
                    {gameState.settings.enableBonuses && (player.bonuses?.fifty_fifty ?? 0) > 0 && (
                      <span className="ml-1.5 font-bold text-pink-400">
                        · 🎯 50/50 × {player.bonuses?.fifty_fifty}
                      </span>
                    )}
                    {gameState.settings.enableBonuses && (player.bonuses?.camembert_joker ?? 0) > 0 && (
                      <span className="ml-1.5 font-bold text-amber-400">
                        · 🧀 Joker × {player.bonuses?.camembert_joker}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <PlayerWedgeBadge wedges={player.wedges} size={34} />
            </motion.div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------- legend */}
      <div className="no-scrollbar z-10 flex w-full items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold">
        {MAIN_CATEGORIES.map(categoryId => {
          const category = CATEGORIES[categoryId];
          const Icon = CATEGORY_ICONS[categoryId];
          return (
            <div
              key={`legend_${categoryId}`}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1"
            >
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full"
                style={{ backgroundColor: category.color }}
              >
                <Icon size={10} color={readableInk(category.color)} strokeWidth={3} />
              </span>
              <span className="whitespace-nowrap text-slate-300">{category.name}</span>
            </div>
          );
        })}
        <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500">
            <RefreshCw size={10} color="#0B1120" strokeWidth={3} />
          </span>
          <span className="whitespace-nowrap text-slate-300">Re-lance</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-500">
            <Gift size={10} color="#FFFFFF" strokeWidth={3} />
          </span>
          <span className="whitespace-nowrap text-slate-300">Surprise</span>
        </div>
      </div>
    </section>
  );
};

// Emoji reactions and other page-level UI state should not rebuild this large
// SVG tree when neither the game state nor the board callbacks changed.
export const GameCanvasBoard = React.memo(GameCanvasBoardComponent);
