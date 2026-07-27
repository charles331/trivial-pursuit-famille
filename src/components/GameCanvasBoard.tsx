import React, { useState } from 'react';
import { GameState, BoardTile, Player, CategoryId } from '../types';
import { BOARD_PRESETS } from '../data/boards';
import { CATEGORIES } from '../data/categories';
import { AVATARS } from '../data/avatars';
import { PlayerWedgeBadge } from './PlayerWedgeBadge';
import { Dice3D } from './Dice3D';
import { Dices, Sparkles, Trophy, Crown, Landmark, Globe, Film, Microscope, Palette, Music, Utensils, Star, RefreshCw, Gift } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface GameCanvasBoardProps {
  gameState: GameState;
  currentUserId: string;
  onRollDice: () => void;
  onSelectTile: (tileId: number) => void;
}

// Order of 6 main categories for pie hub & wedge holders
const MAIN_CATEGORIES: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports'
];

// SVG Category Icon Component for board tiles
const CategorySvgIcon: React.FC<{ categoryId?: CategoryId; tileType: string; x: number; y: number; size: number }> = ({
  categoryId,
  tileType,
  x,
  y,
  size
}) => {
  const iconSize = size * 0.9;
  const offset = iconSize / 2;

  if (tileType === 'reroll') {
    return (
      <g transform={`translate(${x - offset}, ${y - offset})`}>
        <RefreshCw size={iconSize} className="text-white drop-shadow" strokeWidth={2.8} />
      </g>
    );
  }

  if (tileType === 'surprise') {
    return (
      <g transform={`translate(${x - offset}, ${y - offset})`}>
        <Gift size={iconSize} className="text-white drop-shadow animate-pulse" strokeWidth={2.8} />
      </g>
    );
  }

  switch (categoryId) {
    case 'histoire':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Landmark size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'geographie':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Globe size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'cinema':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Film size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'sciences':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Microscope size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'art':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Palette size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'sports':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Trophy size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'popculture':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Music size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    case 'gastronomie':
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Utensils size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
    default:
      return (
        <g transform={`translate(${x - offset}, ${y - offset})`}>
          <Star size={iconSize} className="text-white drop-shadow" strokeWidth={2.5} />
        </g>
      );
  }
};

// Player 3D Pie Holder Token SVG Component
const PlayerPawnPiece: React.FC<{
  player: Player;
  isActive: boolean;
  x: number;
  y: number;
  size?: number;
}> = ({ player, isActive, x, y, size = 32 }) => {
  const avatar = AVATARS.find(a => a.id === player.avatarId) || AVATARS[0];
  const radius = size;
  const center = 0;

  return (
    <g transform={`translate(${x}, ${y})`} className="transition-all duration-700 ease-in-out">
      {/* Active Player Pulsing Golden Halo */}
      {isActive && (
        <g>
          <circle
            cx={center}
            cy={center}
            r={radius + 14}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="4"
            className="animate-ping"
            opacity="0.4"
          />
          <circle
            cx={center}
            cy={center}
            r={radius + 8}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="5"
            strokeDasharray="8 4"
            className="animate-spin-slow"
          />
          {/* Floating active marker pin above token */}
          <g transform={`translate(0, ${-radius - 22})`} className="animate-bounce">
            <polygon points="0,10 -7,0 7,0" fill="#F59E0B" />
            <rect x="-18" y="-14" width="36" height="16" rx="8" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="0" y="-3" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="900">
              TOUR
            </text>
          </g>
        </g>
      )}

      {/* Outer Pie Holder Ring in Player Color */}
      <circle
        cx={center}
        cy={center}
        r={radius + 3}
        fill="#0F172A"
        stroke={player.color}
        strokeWidth="4"
        className="drop-shadow-2xl"
      />

      {/* 6 Triangular Wedge Slots */}
      {MAIN_CATEGORIES.map((catKey, idx) => {
        const startAngle = (idx * 60 - 90) * (Math.PI / 180);
        const endAngle = ((idx + 1) * 60 - 90) * (Math.PI / 180);

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);

        const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

        const hasWedge = player.wedges.includes(catKey);
        const sliceColor = hasWedge ? CATEGORIES[catKey].color : '#1E293B';

        return (
          <path
            key={`pawn_wedge_${player.id}_${catKey}`}
            d={pathData}
            fill={sliceColor}
            stroke="#0F172A"
            strokeWidth="1.5"
            className="transition-colors duration-300"
          />
        );
      })}

      {/* Center Avatar Badge */}
      <circle
        cx={center}
        cy={center}
        r={radius * 0.48}
        fill={player.color}
        stroke="#FFFFFF"
        strokeWidth="2"
        className="drop-shadow-md"
      />

      {/* Avatar Emoji */}
      <text
        x={center}
        y={center + (radius * 0.18)}
        textAnchor="middle"
        fontSize={radius * 0.55}
      >
        {avatar.emoji}
      </text>
    </g>
  );
};

export const GameCanvasBoard: React.FC<GameCanvasBoardProps> = ({
  gameState,
  currentUserId,
  onRollDice,
  onSelectTile
}) => {
  const [isRollingLocally, setIsRollingLocally] = useState(false);
  const [showingResultPause, setShowingResultPause] = useState<number | null>(null);
  const [showTurnIntro, setShowTurnIntro] = useState(true);

  const hasRolledRef = React.useRef(false);
  const prevDiceValRef = React.useRef<number | null>(null);

  // Sync userId from localStorage fallback if missing
  const storedSessionStr = typeof window !== 'undefined' ? localStorage.getItem('tp_fam_session') : null;
  const storedPlayerId = storedSessionStr ? (function() { try { return JSON.parse(storedSessionStr)?.playerId; } catch(e) { return null; } })() : null;
  const effectiveUserId = currentUserId || storedPlayerId;

  const activePlayer = gameState.players[gameState.activePlayerIndex] || gameState.players[0];
  const isMyTurn = 
    activePlayer?.id === effectiveUserId || 
    gameState.settings.isLocalMode || 
    gameState.players.length === 1;
  const boardConfig = BOARD_PRESETS[gameState.settings.boardType] || BOARD_PRESETS.wheel;
  const possibleDestinationTiles = gameState.possibleMoves
    .map(tileId => boardConfig.tiles.find(tile => tile.id === tileId))
    .filter((tile): tile is BoardTile => Boolean(tile));

  const destinationLabel = (tile: BoardTile) => {
    if (tile.type === 'hub') return 'Centre du plateau (Victoire)';
    if (tile.type === 'reroll') return 'Case Re-lance (Rejouer)';
    if (tile.type === 'surprise') return 'Case Surprise (Joker)';
    const category = tile.categoryId ? CATEGORIES[tile.categoryId]?.name : null;
    return `${category || tile.label}${tile.type === 'camembert' || tile.isCamembert ? ' · 🏆 Q.G. Camembert' : ''}`;
  };

  // Reset roll guard state whenever phase returns to rolling or player turn switches
  React.useEffect(() => {
    setShowTurnIntro(true);
    if (gameState.phase === 'rolling') {
      hasRolledRef.current = false;
      setIsRollingLocally(false);
      setShowingResultPause(null);
      prevDiceValRef.current = null;
    }
  }, [gameState.phase, gameState.activePlayerIndex]);

  // Handle dice roll result arriving from server cleanly
  React.useEffect(() => {
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

        const pauseTimer = setTimeout(() => {
          setShowingResultPause(null);
        }, 1500);

        return () => clearTimeout(pauseTimer);
      }, 850);

      return () => clearTimeout(tumbleTimer);
    }
  }, [gameState.diceValue, gameState.phase]);

  const handleRollClick = () => {
    if (!isMyTurn || gameState.phase !== 'rolling' || hasRolledRef.current) return;

    hasRolledRef.current = true;
    setIsRollingLocally(true);

    // Request roll from server
    onRollDice();
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden min-h-[480px] sm:min-h-[600px]">
      {showTurnIntro && gameState.settings.isLocalMode && gameState.phase === 'rolling' && isMyTurn && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 flex items-center justify-center p-5 animate-fadeIn">
          <div className="text-center space-y-5 max-w-sm">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl border-4 border-white/30 shadow-2xl"
              style={{ backgroundColor: activePlayer?.color }}
            >
              {AVATARS.find(a => a.id === activePlayer?.avatarId)?.emoji || '🦁'}
            </div>
            <div>
              <p className="text-amber-400 font-black uppercase tracking-widest text-xs sm:text-sm">Nouveau tour (Mode Local)</p>
              <h2 className="text-3xl sm:text-4xl text-white font-black">Au tour de {activePlayer?.name}</h2>
              <p className="text-slate-300 text-sm mt-2">Passez-lui l’appareil avant de continuer.</p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowTurnIntro(false);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg shadow-xl hover:scale-105 transition-all"
            >
              J’ai l’appareil, commencer !
            </button>
          </div>
        </div>
      )}

      {/* Background Radial Glow Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Board Canvas Header Status Bar */}
      <div className="w-full flex items-center justify-between mb-2 z-10 px-2 sm:px-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-2xl text-white shadow-lg border-2 border-amber-400/80"
            style={{ backgroundColor: activePlayer?.color || '#3B82F6' }}
          >
            {AVATARS.find(a => a.id === activePlayer?.avatarId)?.emoji || '🦁'}
          </div>
          <div>
            <div className="text-xs sm:text-sm text-amber-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" /> Tour : {activePlayer?.name}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-300 font-medium">
              {gameState.phase === 'rolling' && '👉 Lancez le dé 3D !'}
              {gameState.phase === 'moving' && '👉 Choisissez votre destination sur le plateau !'}
              {gameState.phase === 'question' && '❓ Question en cours...'}
            </div>
          </div>
        </div>

        {/* Dice Result Badge in Header */}
        <div className="flex items-center gap-2">
          {gameState.diceValue !== null && (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/50 px-3.5 py-2 rounded-2xl shadow-xl">
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">Score :</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border border-amber-300">
                {gameState.diceValue}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Board SVG */}
      <div className="relative w-full max-w-[660px] aspect-square flex items-center justify-center z-10 p-1 sm:p-2">
        <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl">
          <defs>
            {/* Wooden / Brass Rim Gradient */}
            <radialGradient id="boardRimGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="85%" stopColor="#0F172A" />
              <stop offset="98%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </radialGradient>

            {/* Central Gold Medallion Gradient */}
            <linearGradient id="goldMedallionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>

            {/* Line Glow Filter for Move Paths */}
            <filter id="lineGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Tile Drop Shadow Filter */}
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Outer Board Frame Circle */}
          <circle cx="500" cy="500" r="485" fill="url(#boardRimGrad)" stroke="#B45309" strokeWidth="8" />
          <circle cx="500" cy="500" r="478" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.6" />

          {/* Radial Gold Background Lines */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle - 90) * (Math.PI / 180);
            const x2 = 500 + 470 * Math.cos(rad);
            const y2 = 500 + 470 * Math.sin(rad);
            return (
              <line
                key={`bg_ray_${i}`}
                x1="500"
                y1="500"
                x2={x2}
                y2={y2}
                stroke="#D97706"
                strokeWidth="1.5"
                opacity="0.15"
                strokeDasharray="4 6"
              />
            );
          })}

          {/* Concentric Double Golden Outer Track Rails */}
          <circle cx="500" cy="500" r="410" fill="none" stroke="#D97706" strokeWidth="3" opacity="0.5" />
          <circle cx="500" cy="500" r="350" fill="none" stroke="#D97706" strokeWidth="3" opacity="0.5" />

          {/* Central Multi-Color Pie Hub (6 Category Slices) */}
          <g filter="url(#shadowFilter)">
            {MAIN_CATEGORIES.map((catKey, index) => {
              const center = 500;
              const hubR = 105;
              const startAngle = (index * 60 - 90) * (Math.PI / 180);
              const endAngle = ((index + 1) * 60 - 90) * (Math.PI / 180);

              const x1 = center + hubR * Math.cos(startAngle);
              const y1 = center + hubR * Math.sin(startAngle);
              const x2 = center + hubR * Math.cos(endAngle);
              const y2 = center + hubR * Math.sin(endAngle);

              const pathData = `M ${center} ${center} L ${x1} ${y1} A ${hubR} ${hubR} 0 0 1 ${x2} ${y2} Z`;

              return (
                <path
                  key={`hub_slice_${catKey}`}
                  d={pathData}
                  fill={CATEGORIES[catKey].color}
                  stroke="#F59E0B"
                  strokeWidth="3"
                  opacity="0.9"
                />
              );
            })}

            {/* Central Gold Medallion Hub Badge */}
            <circle cx="500" cy="500" r="50" fill="url(#goldMedallionGrad)" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="500" cy="500" r="42" fill="#0F172A" opacity="0.9" />
            
            <text x="500" y="492" textAnchor="middle" fill="#FDE047" fontSize="22" fontWeight="bold">
              🏆
            </text>
            <text x="500" y="514" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="900" letterSpacing="1">
              CENTRE
            </text>
          </g>

          {/* Double Spoke Golden Track Connectors */}
          {(() => {
            const lines: React.ReactNode[] = [];
            boardConfig.tiles.forEach((tile) => {
              tile.nextTileIds.forEach((nextId) => {
                const targetTile = boardConfig.tiles.find(t => t.id === nextId);
                if (!targetTile || tile.id === nextId) return;

                const minId = Math.min(tile.id, nextId);
                const maxId = Math.max(tile.id, nextId);
                const edgeKey = `track_line_${minId}_${maxId}`;

                lines.push(
                  <line
                    key={edgeKey}
                    x1={tile.x}
                    y1={tile.y}
                    x2={targetTile.x}
                    y2={targetTile.y}
                    stroke="#D97706"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                );
              });
            });
            return lines;
          })()}

          {/* Modern Discrete Curved Trajectory Particles for Possible Moves */}
          {gameState.phase === 'moving' && gameState.possibleMoves.map(destId => {
            const originTile = boardConfig.tiles.find(t => t.id === activePlayer?.currentTileId);
            const destTile = boardConfig.tiles.find(t => t.id === destId);
            if (!originTile || !destTile) return null;

            const dx = destTile.x - originTile.x;
            const dy = destTile.y - originTile.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Midpoint between origin and destination
            const mx = (originTile.x + destTile.x) / 2;
            const my = (originTile.y + destTile.y) / 2;

            // Push quadratic control point outwards away from central hub (500, 500)
            const toCenterX = mx - 500;
            const toCenterY = my - 500;
            const distCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY) || 1;

            // Curved arc offset amount
            const pushDist = Math.max(30, Math.min(120, dist * 0.25));
            const cx = mx + (toCenterX / distCenter) * pushDist;
            const cy = my + (toCenterY / distCenter) * pushDist;

            const pathD = `M ${originTile.x} ${originTile.y} Q ${cx} ${cy} ${destTile.x} ${destTile.y}`;
            const destCat = destTile.categoryId ? CATEGORIES[destTile.categoryId] : null;
            const strokeColor = destCat?.color || '#F59E0B';

            return (
              <g key={`move_path_group_${destId}`}>
                {/* Soft glow background arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.25"
                  filter="url(#lineGlowFilter)"
                />
                {/* Dynamic animated dotted stream arc */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FDE047"
                  strokeWidth="3"
                  strokeDasharray="6 8"
                  strokeLinecap="round"
                  opacity="0.9"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="28;0"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}

          {/* Render Board Tiles */}
          {boardConfig.tiles.map((tile) => {
            if (tile.type === 'hub') return null; // Hub already drawn centrally

            const isPossibleMove = gameState.possibleMoves.includes(tile.id) && gameState.phase === 'moving';
            const cat = tile.categoryId ? CATEGORIES[tile.categoryId] : null;

            let fillColor = '#1E293B';
            if (tile.type === 'reroll') fillColor = '#06B6D4';
            else if (tile.type === 'surprise') fillColor = '#EC4899';
            else if (cat) fillColor = cat.color;

            const isCamembert = tile.type === 'camembert' || tile.isCamembert;
            const tileSize = isCamembert ? 42 : 30;

            return (
              <g
                key={`tile_${tile.id}`}
                onClick={() => {
                  if (isPossibleMove && isMyTurn) {
                    soundManager.playClick();
                    onSelectTile(tile.id);
                  }
                }}
                className={`transition-all duration-300 ${
                  isPossibleMove ? 'cursor-pointer hover:scale-125' : ''
                }`}
                filter="url(#shadowFilter)"
              >
                {/* Possible Move Pulsing Target Pin */}
                {isPossibleMove && (
                  <g>
                    {/* Pulsing Outer Glow Fill */}
                    <circle
                      cx={tile.x}
                      cy={tile.y}
                      r={tileSize + 16}
                      fill="#F59E0B"
                      fillOpacity="0.3"
                      stroke="#F59E0B"
                      strokeWidth="5"
                      className="animate-pulse"
                    />

                    {/* Bouncing Target Pin Badge Above Tile */}
                    <g transform={`translate(${tile.x}, ${tile.y - tileSize - 24})`} className="animate-bounce">
                      <rect
                        x="-40"
                        y="-16"
                        width="80"
                        height="26"
                        rx="13"
                        fill="#F59E0B"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="drop-shadow-xl"
                      />
                      <polygon points="0,13 -6,7 6,7" fill="#F59E0B" />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        fill="#0F172A"
                        fontSize="11"
                        fontWeight="900"
                        letterSpacing="0.5"
                      >
                        🎯 CHOISIR
                      </text>
                    </g>
                  </g>
                )}

                {/* HQ Camembert Case Star Outer Ring */}
                {isCamembert && (
                  <circle
                    cx={tile.x}
                    cy={tile.y}
                    r={tileSize + 6}
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                    className="animate-spin-slow"
                  />
                )}

                {/* Main Tile Shape */}
                <circle
                  cx={tile.x}
                  cy={tile.y}
                  r={tileSize}
                  fill={fillColor}
                  stroke={isCamembert ? '#FDE047' : isPossibleMove ? '#FFFFFF' : '#0F172A'}
                  strokeWidth={isCamembert ? '4' : isPossibleMove ? '4' : '3'}
                />

                {/* Inner Bevel Ring for 3D Tile Feel */}
                <circle
                  cx={tile.x}
                  cy={tile.y}
                  r={tileSize * 0.8}
                  fill="none"
                  stroke="#FFFFFF"
                  opacity="0.25"
                  strokeWidth="1.5"
                />

                {/* Vector Category Icon inside Tile */}
                <CategorySvgIcon
                  categoryId={tile.categoryId}
                  tileType={tile.type}
                  x={tile.x}
                  y={tile.y}
                  size={tileSize * 1.1}
                />
              </g>
            );
          })}

          {/* Render Player Pawns on Board Tiles */}
          {gameState.players.map((player, pIdx) => {
            const tile = boardConfig.tiles.find(t => t.id === player.currentTileId) || boardConfig.tiles[0];

            // Offset multiple players occupying the same tile
            const offsetAngle = (pIdx * (360 / Math.max(1, gameState.players.length))) * (Math.PI / 180);
            const offsetX = gameState.players.length > 1 ? Math.cos(offsetAngle) * 26 : 0;
            const offsetY = gameState.players.length > 1 ? Math.sin(offsetAngle) * 26 : 0;

            const px = tile.x + offsetX;
            const py = tile.y + offsetY;
            const isActive = pIdx === gameState.activePlayerIndex;

            return (
              <PlayerPawnPiece
                key={`player_pawn_${player.id}`}
                player={player}
                isActive={isActive}
                x={px}
                y={py}
                size={26}
              />
            );
          })}
        </svg>

        {/* 3D Dice Tray Center Overlay */}
        {(gameState.phase === 'rolling' || isRollingLocally || showingResultPause !== null) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-[3px] rounded-3xl z-20 animate-fadeIn p-4">
            <div className="p-4 sm:p-6 bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col items-center gap-3 backdrop-blur-md max-w-xs w-full">
              <div className="text-center space-y-1">
                <span className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <Dices className="w-4 h-4 text-amber-400 animate-bounce" /> Tour de {activePlayer?.name}
                </span>

                {gameState.lastTurnEventMessage && showingResultPause === null && (
                  <div className="text-amber-300 font-black text-xs bg-amber-950/80 border border-amber-500/60 px-3 py-1.5 rounded-xl my-1 shadow-lg animate-bounce">
                    {gameState.lastTurnEventMessage}
                  </div>
                )}

                {showingResultPause !== null ? (
                  <div className="animate-pulse text-emerald-300 font-extrabold text-xs sm:text-sm bg-emerald-950/95 border-2 border-emerald-500/80 px-4 py-2 rounded-2xl my-1 shadow-2xl flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span>Résultat : <strong className="text-amber-300 text-xl font-black">{showingResultPause || gameState.diceValue}</strong> !</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-300 font-medium">
                    {isMyTurn ? 'Glissez votre doigt sur le dé 3D pour le lancer ! 🚀' : 'En attente du lancer de dé...'}
                  </p>
                )}
              </div>

              <Dice3D
                value={showingResultPause || gameState.diceValue}
                isRolling={isRollingLocally}
                onRollRequest={handleRollClick}
                disabled={!isMyTurn || hasRolledRef.current}
                size={88}
              />
            </div>
          </div>
        )}
      </div>

      {/* Destination Choices Panel */}
      {gameState.phase === 'moving' && isMyTurn && possibleDestinationTiles.length > 0 && (
        <div className="w-full z-10 mt-2 p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl">
          <p className="text-xs font-black text-amber-400 uppercase tracking-wide mb-2 text-center">
            Où souhaitez-vous déplacer votre pion ?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {possibleDestinationTiles.map(tile => {
              const category = tile.categoryId ? CATEGORIES[tile.categoryId] : null;
              return (
                <button
                  key={`destination_${tile.id}`}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onSelectTile(tile.id);
                  }}
                  className="min-h-12 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 text-left text-xs sm:text-sm font-bold text-white transition-all active:scale-[0.98] shadow-md flex items-center justify-between"
                  style={{ borderColor: category?.color || '#F59E0B' }}
                >
                  <span className="truncate">{destinationLabel(tile)}</span>
                  <span className="text-amber-400 text-xs ml-2 font-black">Aller ➔</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Legend Strip */}
      <div className="w-full mt-3 z-10 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold">
        {MAIN_CATEGORIES.map(catKey => {
          const cat = CATEGORIES[catKey];
          return (
            <div key={`legend_${catKey}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
              <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-300">{cat.name}</span>
            </div>
          );
        })}
      </div>

      {/* Footer Player Wedges Cards Strip */}
      <div className="w-full mt-2 z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {gameState.players.map((p, idx) => {
          const isActive = idx === gameState.activePlayerIndex;
          const avatar = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-slate-800/90 border-amber-500 shadow-lg ring-2 ring-amber-500/40' 
                  : 'bg-slate-900/60 border-slate-800 opacity-85'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 border border-white/20"
                  style={{ backgroundColor: p.color }}
                >
                  {avatar.emoji}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{p.wedges.length}/6 Camemberts</div>
                </div>
              </div>

              {/* Wedge Wheel */}
              <PlayerWedgeBadge wedges={p.wedges} size={36} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

