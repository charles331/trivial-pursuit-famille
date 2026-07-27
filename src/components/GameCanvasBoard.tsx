import React, { useState } from 'react';
import { GameState, BoardTile, Player } from '../types';
import { BOARD_PRESETS } from '../data/boards';
import { CATEGORIES } from '../data/categories';
import { AVATARS } from '../data/avatars';
import { PlayerWedgeBadge } from './PlayerWedgeBadge';
import { Dice3D } from './Dice3D';
import { Dices, Sparkles, Trophy, Crown } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface GameCanvasBoardProps {
  gameState: GameState;
  currentUserId: string;
  onRollDice: () => void;
  onSelectTile: (tileId: number) => void;
}

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
  const isAutoAdvancingRef = React.useRef(false);

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
    if (tile.type === 'hub') return 'Centre du plateau';
    if (tile.type === 'reroll') return 'Relancer le dé';
    if (tile.type === 'surprise') return 'Case surprise';
    const category = tile.categoryId ? CATEGORIES[tile.categoryId]?.name : null;
    return `${category || tile.label}${tile.type === 'camembert' || tile.isCamembert ? ' · Camembert' : ''}`;
  };

  // Reset roll guard state whenever phase returns to rolling or player turn switches
  React.useEffect(() => {
    setShowTurnIntro(true);
    if (gameState.phase === 'rolling') {
      hasRolledRef.current = false;
      isAutoAdvancingRef.current = false;
      setIsRollingLocally(false);
      setShowingResultPause(null);
      prevDiceValRef.current = null;
    }
  }, [gameState.phase, gameState.activePlayerIndex]);

  // Handle dice roll result arriving from server
  React.useEffect(() => {
    if (
      gameState.diceValue !== null &&
      gameState.diceValue !== prevDiceValRef.current &&
      gameState.phase === 'moving'
    ) {
      prevDiceValRef.current = gameState.diceValue;
      const resultVal = gameState.diceValue;

      // Keep 3D tumbling animation active for 0.8s
      setIsRollingLocally(true);

      const tumbleTimer = setTimeout(() => {
        setIsRollingLocally(false);
        setShowingResultPause(resultVal);

        // Display the dice result popup overlay for 1.8 seconds (1800ms) so players can see the score clearly
        const pauseTimer = setTimeout(() => {
          setShowingResultPause(null);
        }, 1800);

        return () => clearTimeout(pauseTimer);
      }, 800);

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
    <div className="relative w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden min-h-[460px] sm:min-h-[580px]">
      {showTurnIntro && gameState.phase === 'rolling' && isMyTurn && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 flex items-center justify-center p-5">
          <div className="text-center space-y-5">
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl border-4 border-white/30 shadow-2xl"
              style={{ backgroundColor: activePlayer?.color }}
            >
              {AVATARS.find(a => a.id === activePlayer?.avatarId)?.emoji || '🦁'}
            </div>
            <div>
              <p className="text-amber-400 font-black uppercase tracking-widest text-sm">Nouveau tour</p>
              <h2 className="text-3xl sm:text-4xl text-white font-black">Au tour de {activePlayer?.name}</h2>
              {gameState.settings.isLocalMode && (
                <p className="text-slate-300 text-sm mt-2">Passez-lui l’appareil avant de continuer.</p>
              )}
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowTurnIntro(false);
              }}
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg"
            >
              J’ai l’appareil, commencer
            </button>
          </div>
        </div>
      )}
      {/* Background Decorative Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

      {/* Board Canvas Header Status */}
      <div className="w-full flex items-center justify-between mb-2 z-10 px-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-md border-2 border-white/20"
            style={{ backgroundColor: activePlayer?.color || '#3B82F6' }}
          >
            {AVATARS.find(a => a.id === activePlayer?.avatarId)?.emoji || '🦁'}
          </div>
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> Tour de : {activePlayer?.name}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {gameState.phase === 'rolling' && '👉 Lancez le dé 3D !'}
              {gameState.phase === 'moving' && '👉 Choisissez votre destination !'}
              {gameState.phase === 'question' && '❓ Question en cours...'}
            </div>
          </div>
        </div>

        {/* Dice Result Badge in Header */}
        <div className="flex items-center gap-3">
          {gameState.diceValue !== null && (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-inner">
              <span className="text-xs font-bold text-slate-300">Résultat :</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg border border-amber-300">
                {gameState.diceValue}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Board SVG */}
      <div className="relative w-full max-w-[620px] aspect-square flex items-center justify-center z-10 p-2">
        <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl">
          {/* Board Connector Lines */}
          {(() => {
            const lineKeys = new Set<string>();
            const lines: React.ReactNode[] = [];

            boardConfig.tiles.forEach((tile) => {
              tile.nextTileIds.forEach((nextId) => {
                const targetTile = boardConfig.tiles.find(t => t.id === nextId);
                if (!targetTile || tile.id === nextId) return;

                const minId = Math.min(tile.id, nextId);
                const maxId = Math.max(tile.id, nextId);
                const edgeKey = `line_${minId}_${maxId}`;

                if (!lineKeys.has(edgeKey)) {
                  lineKeys.add(edgeKey);
                  lines.push(
                    <line
                      key={edgeKey}
                      x1={tile.x}
                      y1={tile.y}
                      x2={targetTile.x}
                      y2={targetTile.y}
                      stroke="#334155"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                  );
                }
              });
            });

            return lines;
          })()}

          {/* Highlight path connectors from active player to possible move destinations */}
          {gameState.phase === 'moving' && gameState.possibleMoves.map(destId => {
            const originTile = boardConfig.tiles.find(t => t.id === activePlayer?.currentTileId);
            const destTile = boardConfig.tiles.find(t => t.id === destId);
            if (!originTile || !destTile) return null;
            return (
              <line
                key={`move_path_${destId}`}
                x1={originTile.x}
                y1={originTile.y}
                x2={destTile.x}
                y2={destTile.y}
                stroke="#F59E0B"
                strokeWidth="10"
                strokeDasharray="12 8"
                strokeLinecap="round"
                className="animate-pulse"
                opacity="0.85"
              />
            );
          })}

          {/* Render Board Tiles */}
          {boardConfig.tiles.map((tile) => {
            const isPossibleMove = gameState.possibleMoves.includes(tile.id) && gameState.phase === 'moving';
            const cat = tile.categoryId ? CATEGORIES[tile.categoryId] : null;

            let fillColor = '#1E293B';
            if (tile.type === 'hub') fillColor = '#F59E0B'; // Gold hub
            else if (tile.type === 'reroll') fillColor = '#06B6D4';
            else if (tile.type === 'surprise') fillColor = '#EC4899';
            else if (cat) fillColor = cat.color;

            const isCamembert = tile.type === 'camembert' || tile.isCamembert;
            const size = tile.type === 'hub' ? 56 : isCamembert ? 44 : 34;

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
              >
                {/* Prominent Glow and Target Pin for possible move destinations */}
                {isPossibleMove && (
                  <g>
                    {/* Pulsing Outer Glow Fill */}
                    <circle
                      cx={tile.x}
                      cy={tile.y}
                      r={size + 18}
                      fill="#F59E0B"
                      fillOpacity="0.25"
                      stroke="#F59E0B"
                      strokeWidth="5"
                      className="animate-pulse"
                    />

                    {/* Bouncing Target Pin Badge Above Tile */}
                    <g transform={`translate(${tile.x}, ${tile.y - size - 26})`} className="animate-bounce">
                      <rect
                        x="-38"
                        y="-16"
                        width="76"
                        height="24"
                        rx="12"
                        fill="#F59E0B"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="drop-shadow-xl"
                      />
                      <polygon
                        points="0,11 -6,6 6,6"
                        fill="#F59E0B"
                      />
                      <text
                        x="0"
                        y="-1"
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

                {/* Main Tile Node */}
                <circle
                  cx={tile.x}
                  cy={tile.y}
                  r={size}
                  fill={fillColor}
                  stroke={isPossibleMove ? '#FFFFFF' : '#0F172A'}
                  strokeWidth={isPossibleMove ? '6' : '4'}
                  className="drop-shadow-md"
                />

                {/* Hub Center Trophy Icon */}
                {tile.type === 'hub' && (
                  <text
                    x={tile.x}
                    y={tile.y + 12}
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="36"
                    fontWeight="bold"
                  >
                    🏆
                  </text>
                )}

                {/* Camembert Icon Marker */}
                {isCamembert && tile.type !== 'hub' && (
                  <circle
                    cx={tile.x}
                    cy={tile.y}
                    r={size * 0.45}
                    fill="#FFFFFF"
                    opacity="0.3"
                  />
                )}
              </g>
            );
          })}

          {/* Render Player Token Pieces on Tiles */}
          {gameState.players.map((player, pIdx) => {
            const tile = boardConfig.tiles.find(t => t.id === player.currentTileId) || boardConfig.tiles[0];
            const avatar = AVATARS.find(a => a.id === player.avatarId) || AVATARS[0];

            // Offset multiple players on same tile
            const offsetAngle = (pIdx * (360 / Math.max(1, gameState.players.length))) * (Math.PI / 180);
            const offsetX = gameState.players.length > 1 ? Math.cos(offsetAngle) * 22 : 0;
            const offsetY = gameState.players.length > 1 ? Math.sin(offsetAngle) * 22 : 0;

            const px = tile.x + offsetX;
            const py = tile.y + offsetY;
            const isActive = pIdx === gameState.activePlayerIndex;

            return (
              <g key={`player_token_${player.id}`} className="transition-all duration-700 ease-in-out">
                {/* Active Player Halo */}
                {isActive && (
                  <circle
                    cx={px}
                    cy={py}
                    r="34"
                    fill="none"
                    stroke={player.color}
                    strokeWidth="4"
                    className="animate-pulse"
                  />
                )}

                {/* Player Token Circle */}
                <circle
                  cx={px}
                  cy={py}
                  r="26"
                  fill={player.color}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  className="drop-shadow-lg"
                />

                {/* Emoji Avatar */}
                <text
                  x={px}
                  y={py + 8}
                  textAnchor="middle"
                  fontSize="22"
                >
                  {avatar.emoji}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 3D Dice Tray Center Overlay */}
        {(gameState.phase === 'rolling' || isRollingLocally || showingResultPause !== null) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[3px] rounded-3xl z-20 animate-fadeIn p-4">
            <div className="p-4 sm:p-6 bg-slate-900/95 border-2 border-amber-500/50 rounded-3xl shadow-2xl flex flex-col items-center gap-3 backdrop-blur-md max-w-xs w-full">
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
                  <div className="animate-pulse text-emerald-300 font-extrabold text-sm sm:text-base bg-emerald-950/95 border-2 border-emerald-500/80 px-4 py-2 rounded-2xl my-1 shadow-2xl flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span>Résultat du jet : <strong className="text-amber-300 text-xl font-black">{showingResultPause || gameState.diceValue}</strong> !</span>
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

      {gameState.phase === 'moving' && isMyTurn && possibleDestinationTiles.length > 0 && (
        <div className="w-full z-10 mt-2 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30">
          <p className="text-xs font-black text-amber-400 uppercase tracking-wide mb-2 text-center">
            Où voulez-vous aller ?
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
                  className="min-h-12 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 text-left text-sm font-bold text-white transition-all active:scale-[0.98]"
                  style={{ borderColor: category?.color || '#F59E0B' }}
                >
                  {destinationLabel(tile)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Player Wedges Cards Strip */}
      <div className="w-full mt-2 z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {gameState.players.map((p, idx) => {
          const isActive = idx === gameState.activePlayerIndex;
          const avatar = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                isActive 
                  ? 'bg-slate-800/90 border-amber-500 shadow-md ring-2 ring-amber-500/30' 
                  : 'bg-slate-900/60 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {avatar.emoji}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Score: {p.score} pt</div>
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
