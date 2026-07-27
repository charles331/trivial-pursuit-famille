import React from 'react';
import { AVATARS, PLAYER_COLORS } from '../data/avatars';
import { DifficultyLevel } from '../types';
import { 
  Crown, GraduationCap, Sparkles, Bot, Wand2, Rocket, Utensils, Star, Zap, 
  Smile, Shield, Flame, Compass, Heart, Search, Check 
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AvatarPickerProps {
  playerName: string;
  avatarId: string;
  selectedColor: string;
  difficulty: DifficultyLevel;
  onUpdate: (data: { name?: string; avatarId?: string; color?: string; difficulty?: DifficultyLevel }) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Crown, GraduationCap, Sparkles, Bot, Wand2, Rocket, Utensils, Star, Zap,
  Smile, Shield, Flame, Compass, Heart, Search
};

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  playerName,
  avatarId,
  selectedColor,
  difficulty,
  onUpdate
}) => {
  const currentAvatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 space-y-5">
      {/* Name Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Nom du Joueur / Surnom
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Ex: Papa, Mamie, Thomas..."
          maxLength={18}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500 text-base"
        />
      </div>

      {/* Avatar Grid */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Choisissez votre Avatar
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
          {AVATARS.map((avatar) => {
            const isSelected = avatar.id === avatarId;
            const IconComponent = ICON_MAP[avatar.iconName] || Star;

            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onUpdate({ avatarId: avatar.id });
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'ring-4 ring-amber-500 scale-105 bg-amber-50 dark:bg-amber-950/40' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-white text-xl shadow-sm mb-1`}>
                  {avatar.emoji}
                </div>
                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center">
                  {avatar.name.split(' ')[0]}
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Token Color Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Couleur du Pion de Jeu
        </label>
        <div className="flex flex-wrap gap-2">
          {PLAYER_COLORS.map((col) => {
            const isSelected = selectedColor === col.value;
            return (
              <button
                key={col.value}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onUpdate({ color: col.value });
                }}
                style={{ backgroundColor: col.value }}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isSelected ? 'ring-4 ring-offset-2 ring-slate-800 dark:ring-white scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              >
                {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Adaptation */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Niveau de Difficulté des Questions
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['enfant', 'ado', 'adulte'] as DifficultyLevel[]).map((lvl) => {
            const isSelected = difficulty === lvl;
            const labels: Record<DifficultyLevel, { title: string; sub: string }> = {
              enfant: { title: '🎈 Enfant', sub: '6 - 10 ans' },
              ado: { title: '🚀 Ado', sub: '11 - 15 ans' },
              adulte: { title: '🏆 Adulte', sub: '16 ans et +' }
            };

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onUpdate({ difficulty: lvl });
                }}
                className={`py-2 px-3 rounded-xl border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{labels[lvl].title}</div>
                <div className="text-[10px] opacity-75">{labels[lvl].sub}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
