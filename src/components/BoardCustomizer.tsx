import React, { useState } from 'react';
import { BoardType, CategoryId, GameSettings } from '../types';
import { CATEGORIES } from '../data/categories';
import { BOARD_PRESETS } from '../data/boards';
import { isCardReadAloud } from '../server/turnRoles';
import { activeThemeKeys } from '../server/questionSelection';
import { LayoutGrid, Timer, Sparkles, Check, Wand2, RefreshCw } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface BoardCustomizerProps {
  settings: GameSettings;
  isHost: boolean;
  generationToken?: string;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onAddCustomPack?: (themeName: string, questions: any[]) => void;
  customPacks?: { name: string; questions?: any[]; questionCount?: number }[];
}

export const BoardCustomizer: React.FC<BoardCustomizerProps> = ({
  settings,
  isHost,
  generationToken,
  onUpdateSettings,
  onAddCustomPack,
  customPacks = []
}) => {
  const [customThemeInput, setCustomThemeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const MAX_GENERATIONS = 3;
  const currentGenerationsCount = customPacks.length;
  const isLimitReached = currentGenerationsCount >= MAX_GENERATIONS;

  const allCategoryKeys = Object.keys(CATEGORIES) as CategoryId[];

  // Turning the duo on implies the card is read out loud, so the two controls
  // must not contradict each other in the lobby.
  const isReadAloud = isCardReadAloud(settings);

  const handleCategoryToggle = (catId: CategoryId) => {
    soundManager.playClick();
    const current = [...settings.selectedCategories];
    if (current.includes(catId)) {
      if (current.length <= 4) return; // Keep at least 4 categories
      onUpdateSettings({ selectedCategories: current.filter(c => c !== catId) });
    } else {
      if (current.length >= 6) {
        // Replace last category
        current.pop();
      }
      onUpdateSettings({ selectedCategories: [...current, catId] });
    }
  };

  const handleGenerateGeminiPack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customThemeInput.trim() || isGenerating || isLimitReached) return;

    setIsGenerating(true);
    setGenError(null);
    setGenSuccess(null);
    soundManager.playClick();

    try {
      const res = await fetch('/api/generate-pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Room-Code': settings.roomCode,
          'X-Host-Token': generationToken ?? '',
        },
        body: JSON.stringify({ themeName: customThemeInput.trim(), count: 30 })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Impossible de générer le thème.');
      }

      const examined = typeof data.examined === 'number' ? data.examined : data.questions.length;
      setGenSuccess(
        `Thème "${data.themeName}" créé : ${data.questions.length} questions retenues`
          + ` sur ${examined} générées (les non conformes sont écartées).`
      );
      if (onAddCustomPack) {
        // Le serveur active lui-même le thème généré, en plus des autres.
        onAddCustomPack(data.themeName, data.questions);
      }
      setCustomThemeInput('');
    } catch (err: any) {
      setGenError(err.message || 'Erreur de génération');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Board Preset Type */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Type & Disposition du Plateau
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(BOARD_PRESETS) as BoardType[]).map((bType) => {
            const preset = BOARD_PRESETS[bType];
            const isSelected = settings.boardType === bType;

            return (
              <button
                key={bType}
                type="button"
                disabled={!isHost}
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ boardType: bType });
                }}
                className={`p-3.5 rounded-xl border-2 text-left transition-all relative ${
                  isSelected 
                    ? 'border-amber-500 bg-amber-500/10 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100'
                } ${!isHost ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{preset.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{preset.description}</div>
                <div className="inline-block px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                  ⏱️ {preset.suggestedDuration}
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 text-amber-500">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Catégories du Plateau ({settings.selectedCategories.length}/6)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isHost ? 'Cliquez pour modifier les thèmes' : 'Sélection de l\'hôte'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {allCategoryKeys.map((catId) => {
            const cat = CATEGORIES[catId];
            const isSelected = settings.selectedCategories.includes(catId);

            return (
              <button
                key={catId}
                type="button"
                disabled={!isHost}
                onClick={() => handleCategoryToggle(catId)}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-transparent shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 opacity-50'
                }`}
                style={{
                  backgroundColor: isSelected ? `${cat.color}15` : undefined,
                  borderColor: isSelected ? cat.color : undefined
                }}
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: cat.color }} 
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timer & Limits & Reader Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Chronomètre par Question
            </span>
          </div>
          <div className="flex gap-2">
            {[15, 30, 45, 0].map((sec) => (
              <button
                key={sec}
                type="button"
                disabled={!isHost}
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ timerSeconds: sec });
                }}
                className={`flex-1 py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                  settings.timerSeconds === sec 
                    ? 'border-amber-500 bg-amber-500 text-white' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {sec === 0 ? 'Sans limite' : `${sec}s`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Nombre de Camemberts pour Gagner
            </span>
          </div>
          <div className="flex gap-2">
            {[4, 6].map((num) => (
              <button
                key={num}
                type="button"
                disabled={!isHost}
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ wedgesToWin: num });
                }}
                className={`flex-1 py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                  settings.wedgesToWin === num 
                    ? 'border-amber-500 bg-amber-500 text-white' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {num} Camemberts
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reader Mode (Maître du jeu / Lecteur de carte) */}
      <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-amber-200 flex items-center gap-1.5">
            <span>📖</span> Mode Lecteur de Carte (Masquer au joueur actif)
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isReadAloud ? (
              <span className="text-amber-700 dark:text-amber-300 font-semibold">
                🎴 <strong>Mode Lecteur Actif :</strong> le joueur juste avant celui qui répond lit la carte à voix haute et voit la bonne réponse. L&apos;écran du joueur interrogé est masqué.
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400">
                📱 <strong>Mode Direct (Par défaut) :</strong> Chaque joueur voit la question et les 4 choix directement sur son écran.
              </span>
            )}
          </p>
          {settings.enableLiveCamera && (
            <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
              Activé automatiquement par le duo caméra : c&apos;est le lecteur qui parle.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!isHost || settings.enableLiveCamera === true}
          onClick={() => {
            soundManager.playClick();
            onUpdateSettings({ isReaderMode: !settings.isReaderMode });
          }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-70 ${
            isReadAloud
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          {isReadAloud ? 'MODE LECTEUR 🎴' : 'MODE DIRECT 📱'}
        </button>
      </div>

      {/* Live Camera & Mic Spotlight Option */}
      <div className="p-4 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="font-extrabold text-xs sm:text-sm text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
            <span>🎥</span> Duo Caméra & Micro (Lecteur ↔ Joueur interrogé)
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {settings.enableLiveCamera ? (
              <span className="text-purple-700 dark:text-purple-300 font-semibold">
                📹 <strong>Direct Activé :</strong> à chaque question, le joueur interrogé et son lecteur ouvrent caméra et micro dans les deux sens : ils se voient et s&apos;entendent. Les autres suivent la scène. Chacun donne son accord une fois pour la partie et peut couper à tout moment.
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400">
                🔒 <strong>Caméra Désactivée (Par défaut) :</strong> Pas de transmission vidéo/audio pendant le quiz.
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          disabled={!isHost}
          onClick={() => {
            soundManager.playClick();
            onUpdateSettings({ enableLiveCamera: !settings.enableLiveCamera });
          }}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 ${
            settings.enableLiveCamera
              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          {settings.enableLiveCamera ? 'CAMÉRA ACTIVÉE 📹' : 'DESACTIVÉE 🔒'}
        </button>
      </div>

      {/* AI Dynamic Theme Pack Generator (Gemini Integration) */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Générateur IA de Thème Personnalisé
            </h3>
          </div>
          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
            isLimitReached 
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' 
              : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
          }`}>
            Générations : {currentGenerationsCount}/{MAX_GENERATIONS}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          L&apos;IA génère un pack de 30 questions sur mesure par thème (jusqu&apos;à 3 thèmes par salon), soumis aux mêmes règles éditoriales que la banque officielle.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Les thèmes activés sortent <strong>environ une carte sur trois, au rythme du hasard</strong> — jamais plus d&apos;une sur deux, et toujours assez tôt dans la partie — et seulement quand la carte correspond au camembert de la case et au niveau du joueur. Le reste du temps, la banque officielle garde la main. Vous pouvez activer plusieurs thèmes à la fois : ils se partagent cette part.
        </p>

        {/* List of Created Custom Theme Packs & Selection */}
        {customPacks.length > 0 && (
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-2">
            <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
              <span>✨ Thèmes IA Disponibles dans le Salon :</span>
              {activeThemeKeys(settings).size > 0 && (
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ customThemePackNames: [], customThemePackName: undefined });
                  }}
                  className="text-[11px] underline text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-800"
                >
                  Tout désactiver
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {customPacks.map((pack) => {
                const activeKeys = activeThemeKeys(settings);
                const packKey = pack.name.toLowerCase().trim();
                const isActive = activeKeys.has(packKey);

                return (
                  <button
                    key={pack.name}
                    type="button"
                    disabled={!isHost}
                    onClick={() => {
                      soundManager.playClick();
                      const currentNames = [
                        ...(settings.customThemePackNames ?? []),
                        ...(settings.customThemePackName ? [settings.customThemePackName] : []),
                      ];
                      const nextNames = isActive
                        ? currentNames.filter((name) => name.toLowerCase().trim() !== packKey)
                        : [...new Set([...currentNames, pack.name])];
                      onUpdateSettings({
                        customThemePackNames: nextNames,
                        customThemePackName: undefined,
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <span>{isActive ? '⚡' : '📌'}</span>
                    <span>{pack.name}</span>
                    <span className="opacity-75 text-[10px]">
                      ({pack.questionCount ?? pack.questions?.length ?? 0} q.)
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Generator Form */}
        {!isLimitReached ? (
          <form onSubmit={handleGenerateGeminiPack} className="flex gap-2">
            <input
              type="text"
              value={customThemeInput}
              onChange={(e) => setCustomThemeInput(e.target.value)}
              disabled={!isHost || isGenerating}
              placeholder="Ex: Harry Potter, Astérix, Star Wars, Pokémon, Cuisine..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!isHost || isGenerating || !customThemeInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  Créer (30 q)
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-semibold">
            ✋ Limite atteinte (3 thèmes IA max par salon). Vous pouvez sélectionner vos thèmes générés ci-dessus pour la partie !
          </div>
        )}

        {genSuccess && (
          <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg">
            {genSuccess}
          </div>
        )}
        {genError && (
          <div className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg">
            {genError}
          </div>
        )}
      </div>
    </div>
  );
};
