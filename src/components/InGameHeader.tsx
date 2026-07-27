import React, { useState } from 'react';
import { GameState } from '../types';
import { soundManager } from '../utils/sound';
import { AVATARS } from '../data/avatars';
import { Volume2, VolumeX, Copy, Check, Users, HelpCircle, LogOut, Share2 } from 'lucide-react';

interface InGameHeaderProps {
  gameState: GameState;
  onLeaveGame: () => void;
}

export const InGameHeader: React.FC<InGameHeaderProps> = ({ gameState, onLeaveGame }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [copied, setCopied] = useState(false);
  const [showPlayersDrawer, setShowPlayersDrawer] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyCode = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(gameState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="w-full bg-slate-900 border-b border-slate-800 px-3 py-2.5 flex items-center justify-between text-white z-20">
        {/* App Title & Room Code */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-lg shadow-md">
            🎯
          </div>
          <div>
            <h1 className="font-extrabold text-xs sm:text-sm leading-tight text-slate-100">
              TRIVIAL PURSUIT FAMILLE
            </h1>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium">Code Salon:</span>
              <button
                onClick={handleCopyCode}
                className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded hover:bg-amber-500/20 flex items-center gap-1"
              >
                {gameState.roomCode}
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Players List Button */}
          <button
            onClick={() => setShowPlayersDrawer(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Joueurs</span>
            <span className="bg-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
              {gameState.players.length}
            </span>
          </button>

          {/* Rules Button */}
          <button
            onClick={() => setShowRules(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Règles du Jeu"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Leave Game Button */}
          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Stopper la partie"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Stopper</span>
          </button>
        </div>
      </header>

      {/* Confirmation Modal to Stop Game */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full text-white space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Stopper la partie ?</h3>
                <p className="text-xs text-slate-400">Confirmation de sortie</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir arrêter et quitter la partie en cours ? Toute la progression actuelle sera réinitialisée.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                Continuer à jouer
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveGame();
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                Oui, stopper la partie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Players Drawer Modal */}
      {showPlayersDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900 h-full p-5 space-y-4 border-l border-slate-800 text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" /> Joueurs connectés
                </h3>
                <button
                  onClick={() => setShowPlayersDrawer(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5">
                {gameState.players.map((p, idx) => {
                  const avatar = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];
                  const isActive = idx === gameState.activePlayerIndex;

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl flex items-center justify-between border ${
                        isActive ? 'bg-slate-800 border-amber-500' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white"
                          style={{ backgroundColor: p.color }}
                        >
                          {avatar.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-xs">{p.name} {p.isHost && '👑'}</div>
                          <div className="text-[10px] text-slate-400">
                            Difficulté : {p.difficulty} | Wedges: {p.wedges.length}/6
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowPlayersDrawer(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-white space-y-4">
            <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
              📜 Règles du Trivial Pursuit Famille
            </h3>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>1. 🎲 **Lancez le dé** à votre tour pour avancer sur le plateau.</p>
              <p>2. ❓ **Répondez à la question** de la case où vous atterrissez. Chaque joueur a une difficulté adaptée à son âge (Enfant, Ado, Adulte) !</p>
              <p>3. 🍰 **Gagnez des Camemberts** : En répondant correctement sur une case Camembert, vous récoltez un morceau dans cette catégorie.</p>
              <p>4. 🔄 **Rejouez** si vous répondez correctement !</p>
              <p>5. 🏆 **Victoire** : Rassemblez les 6 camemberts et rejoignez le centre du plateau pour la question finale de la victoire !</p>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs"
            >
              J&apos;ai compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};
