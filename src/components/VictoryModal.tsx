import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types';
import { AVATARS } from '../data/avatars';
import { soundManager } from '../utils/sound';
import { Trophy, Crown, Sparkles, RotateCcw, Home } from 'lucide-react';

interface VictoryModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  onPlayAgain,
  onReturnToLobby
}) => {
  const winner = gameState.players.find(p => p.id === gameState.winnerId) || gameState.players[0];
  const avatar = AVATARS.find(a => a.id === winner.avatarId) || AVATARS[0];

  useEffect(() => {
    soundManager.playVictory();

    // Two bounded bursts replace the former 3.5-second requestAnimationFrame
    // loop, which could create thousands of particles on a phone.
    const options = {
      particleCount: 55,
      spread: 60,
      ticks: 140,
      disableForReducedMotion: true
    };
    void confetti({ ...options, angle: 60, origin: { x: 0, y: 0.65 } });
    void confetti({ ...options, angle: 120, origin: { x: 1, y: 0.65 } });

    return () => confetti.reset();
  }, []);

  // Sort players by score / wedges count
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (b.wedges.length !== a.wedges.length) {
      return b.wedges.length - a.wedges.length;
    }
    return b.score - a.score;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-4 border-amber-500 rounded-3xl p-6 shadow-2xl text-white text-center space-y-6">
        
        {/* Crown & Trophy Header */}
        <div className="relative inline-block">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-5xl shadow-xl ring-4 ring-amber-300">
            {avatar.emoji}
          </div>
          <div className="absolute -top-4 -right-2 bg-amber-400 text-slate-950 p-2 rounded-full shadow-lg">
            <Crown className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        <div>
          <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> GRAND CHAMPION DU SALON <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-3xl font-black text-white">{winner.name} a Gagné ! 🎉</h2>
          <p className="text-xs text-slate-400 mt-1">
            Félicitations ! Tous les camemberts récoltés et l&apos;épreuve centrale réussie avec succès.
          </p>
        </div>

        {/* Podium Ranking Breakdown */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-left">
            CLASSEMENT FINAL
          </h3>

          <div className="space-y-2">
            {sortedPlayers.map((p, rank) => {
              const pAvatar = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];
              const medals = ['🥇', '🥈', '🥉', '4️⃣'];

              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    rank === 0 ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{medals[rank] || '🏅'}</span>
                    <span className="text-xl">{pAvatar.emoji}</span>
                    <span className="text-sm font-bold">{p.name}</span>
                  </div>

                  <div className="text-xs font-mono font-semibold">
                    {p.wedges.length}/6 Camemberts ({p.score} pts)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" /> Rejouer une Partie
          </button>
          <button
            onClick={onReturnToLobby}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" /> Retour au Salon
          </button>
        </div>
      </div>
    </div>
  );
};
