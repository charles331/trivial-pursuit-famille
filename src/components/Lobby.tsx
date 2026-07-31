import React, { useState } from 'react';
import { GameState, GameSettings, Player, DifficultyLevel } from '../types';
import { AvatarPicker } from './AvatarPicker';
import { soundManager } from '../utils/sound';
import { AVATARS } from '../data/avatars';
import { BOARD_PRESETS } from '../data/boards';
import { 
  Users, Play, Plus, Copy, Check, Sparkles, Smartphone, Globe, Shield, 
  Crown, Wand2, QrCode, LogOut, Trash2, SlidersHorizontal, ChevronDown
} from 'lucide-react';

const BoardCustomizer = React.lazy(() =>
  import('./BoardCustomizer').then(module => ({ default: module.BoardCustomizer }))
);

/**
 * Dernier profil utilisé sur cet appareil, retenu d'une partie à l'autre pour
 * ne pas le ressaisir. C'est purement local au navigateur : rien n'est envoyé
 * au serveur, et chaque appareil garde le sien.
 */
const PROFILE_STORAGE_KEY = 'tp_fam_profile';

interface StoredProfile {
  name: string;
  avatarId: string;
  color: string;
  difficulty: DifficultyLevel;
}

// Au tout premier passage, le prénom reste vide (placeholder) plutôt que « Joueur 1 ».
const DEFAULT_PROFILE: StoredProfile = { name: '', avatarId: 'lion', color: '#EF4444', difficulty: 'adulte' };

function loadStoredProfile(): StoredProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<StoredProfile> | null;
    return {
      name: typeof parsed?.name === 'string' ? parsed.name : DEFAULT_PROFILE.name,
      avatarId: typeof parsed?.avatarId === 'string' ? parsed.avatarId : DEFAULT_PROFILE.avatarId,
      color: typeof parsed?.color === 'string' ? parsed.color : DEFAULT_PROFILE.color,
      difficulty: parsed?.difficulty === 'enfant' || parsed?.difficulty === 'ado' || parsed?.difficulty === 'adulte'
        ? parsed.difficulty
        : DEFAULT_PROFILE.difficulty,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveStoredProfile(profile: StoredProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Un stockage indisponible (navigation privée, quota) ne doit pas bloquer le jeu.
  }
}

interface LobbyProps {
  gameState: GameState | null;
  currentUserId: string;
  generationToken?: string;
  codeFromUrl?: string | null;
  onCreateRoom: (playerData: Partial<Player>, isLocal: boolean) => void;
  onJoinRoom: (roomCode: string, playerData: Partial<Player>) => void;
  onAddLocalPlayer: (playerData: Partial<Player>) => void;
  onRemoveLocalPlayer: (playerId: string) => void;
  onUpdatePlayer: (playerData: Partial<Player>) => void;
  onToggleReady: () => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  onAddCustomPack?: (themeName: string, questions: any[]) => void;
  onLeaveGame?: () => void;
  errorMessage?: string | null;
}

export const Lobby: React.FC<LobbyProps> = ({
  gameState,
  currentUserId,
  generationToken,
  codeFromUrl,
  onCreateRoom,
  onJoinRoom,
  onAddLocalPlayer,
  onRemoveLocalPlayer,
  onUpdatePlayer,
  onToggleReady,
  onUpdateSettings,
  onStartGame,
  onAddCustomPack,
  onLeaveGame,
  errorMessage
}) => {
  const [tab, setTab] = useState<'welcome' | 'create' | 'join'>(codeFromUrl ? 'join' : 'welcome');
  const [joinCodeInput, setJoinCodeInput] = useState(codeFromUrl ? codeFromUrl.toUpperCase() : '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLeaveLobbyModal, setShowLeaveLobbyModal] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  // Sur l'accueil, la personnalisation d'avatar est repliée par défaut : elle
  // n'est pas nécessaire pour comprendre l'écran ni pour se lancer.
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  // Un profil est-il déjà mémorisé sur cet appareil ? Conditionne le lien « oublier ».
  const [hasSavedProfile, setHasSavedProfile] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(PROFILE_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  // Profil pré-rempli avec le dernier utilisé sur cet appareil (vide au premier passage).
  const [playerName, setPlayerName] = useState(() => loadStoredProfile().name);
  const [avatarId, setAvatarId] = useState(() => loadStoredProfile().avatarId);
  const [color, setColor] = useState(() => loadStoredProfile().color);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => loadStoredProfile().difficulty);

  // Local Pass & Play Add Player Form State
  const [showAddLocalModal, setShowAddLocalModal] = useState(false);
  const [localName, setLocalName] = useState('');
  const [localAvatar, setLocalAvatar] = useState('owl');
  const [localColor, setLocalColor] = useState('#3B82F6');
  const [localDifficulty, setLocalDifficulty] = useState<DifficultyLevel>('enfant');

  const me = gameState?.players.find(p => p.id === currentUserId) || gameState?.players[0];
  const isHost = me?.isHost || false;
  const connectedPlayers = gameState?.players.filter(p => p.isConnected) || [];
  const readyCount = connectedPlayers.filter(p => p.isReady).length;
  const everyoneReady = connectedPlayers.length > 0 && readyCount === connectedPlayers.length;

  const handleCreateOnline = (isLocal = false) => {
    soundManager.playClick();
    saveStoredProfile({ name: playerName, avatarId, color, difficulty });
    setHasSavedProfile(true);
    onCreateRoom({ name: playerName, avatarId, color, difficulty }, isLocal);
  };

  const handleJoinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!joinCodeInput.trim()) return;
    soundManager.playClick();
    saveStoredProfile({ name: playerName, avatarId, color, difficulty });
    setHasSavedProfile(true);
    onJoinRoom(joinCodeInput.trim(), { name: playerName, avatarId, color, difficulty });
  };

  // Efface le profil retenu localement : le champ repart vide, comme au tout premier passage.
  const handleForgetProfile = () => {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // Stockage indisponible : rien à effacer.
    }
    setPlayerName('');
    setAvatarId(DEFAULT_PROFILE.avatarId);
    setColor(DEFAULT_PROFILE.color);
    setDifficulty(DEFAULT_PROFILE.difficulty);
    setHasSavedProfile(false);
  };

  const handleAddLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) return;
    soundManager.playClick();
    onAddLocalPlayer({
      name: localName.trim(),
      avatarId: localAvatar,
      color: localColor,
      difficulty: localDifficulty
    });
    setLocalName('');
    setShowAddLocalModal(false);
  };

  const handleCopyInviteLink = () => {
    soundManager.playClick();
    const url = `${window.location.origin}${window.location.pathname}?code=${gameState?.roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Rejoins notre partie de Trivial Pursuit Famille !',
        text: `Clique sur le lien pour rejoindre directement notre salon privé avec le code ${gameState?.roomCode}`,
        url
      }).catch(() => {
        navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If already in a lobby room session
  if (gameState && gameState.phase === 'lobby') {
    return (
      <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-6 animate-fadeIn">
        
        {/* Room Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs">
              <Sparkles className="w-4 h-4" /> SALON PRIVÉ FAMILIAL
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Code de la Salle : <span className="text-amber-400 font-mono tracking-wider">{gameState.roomCode}</span>
            </h2>
            <p className="text-xs text-slate-300">
              {gameState.settings.isLocalMode ? '🎮 Mode local — passez l’appareil à chaque tour' : '🌐 Mode en ligne — un appareil par joueur'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!gameState.settings.isLocalMode && (
              <button
                onClick={handleCopyInviteLink}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Lien Copié !' : 'Partager le Lien / Code'}
              </button>
            )}

            {onLeaveGame && (
              <button
                onClick={() => setShowLeaveLobbyModal(true)}
                className="px-4 py-2.5 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg transition-all"
                title="Quitter ce salon"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Quitter le Salon
              </button>
            )}
          </div>
        </div>

        {/* Leave Lobby Confirmation Modal */}
        {showLeaveLobbyModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 animate-fadeIn">
            <div className="my-auto bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full text-white space-y-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Quitter le salon ?</h3>
                  <p className="text-xs text-slate-400">Retour au menu principal</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Voulez-vous vraiment quitter ce salon et revenir au menu principal ?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowLeaveLobbyModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                >
                  Rester dans le salon
                </button>
                <button
                  onClick={() => {
                    setShowLeaveLobbyModal(false);
                    if (onLeaveGame) onLeaveGame();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Oui, quitter le salon
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/20 border border-red-500 text-red-200 text-xs font-bold rounded-2xl text-center">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Players List & Avatar Profile Section */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-lg border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-500" /> Joueurs dans la salle ({gameState.players.length})
                </h3>

                {gameState.settings.isLocalMode && (
                  <button
                    onClick={() => setShowAddLocalModal(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Ajouter Joueur
                  </button>
                )}
              </div>

              {/* Player Cards */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                {gameState.players.map((p) => {
                  const avatar = AVATARS.find(a => a.id === p.avatarId) || AVATARS[0];
                  const isMe = p.id === currentUserId;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isMe ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-white shadow"
                          style={{ backgroundColor: p.color }}
                        >
                          {avatar.emoji}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            {p.name} {p.isHost && <Crown className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Niveau : {p.difficulty.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          !p.isConnected
                            ? 'text-slate-500 bg-slate-200 dark:bg-slate-800'
                            : p.isReady
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950'
                              : 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950'
                        }`}>
                          {!p.isConnected ? 'Déconnecté' : p.isReady ? 'Prêt' : 'En attente'}
                        </div>
                        {gameState.settings.isLocalMode && isHost && p.id.startsWith('local_') && (
                          <button
                            type="button"
                            onClick={() => onRemoveLocalPlayer(p.id)}
                            className="p-2 rounded-xl text-red-500 hover:text-white hover:bg-red-500 transition-colors"
                            aria-label={`Supprimer ${p.name}`}
                            title={`Supprimer ${p.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profile Customizer for current player */}
            <AvatarPicker
              playerName={me?.name !== undefined ? me.name : playerName}
              avatarId={me?.avatarId || avatarId}
              selectedColor={me?.color || color}
              difficulty={me?.difficulty || difficulty}
              onUpdate={(updated) => {
                if (updated.name !== undefined) setPlayerName(updated.name);
                if (updated.avatarId) setAvatarId(updated.avatarId);
                if (updated.color) setColor(updated.color);
                if (updated.difficulty) setDifficulty(updated.difficulty);

                onUpdatePlayer(updated);
              }}
            />

            {!gameState.settings.isLocalMode && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onToggleReady();
                }}
                className={`w-full py-3 rounded-2xl font-black text-sm transition-all ${
                  me?.isReady
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {me?.isReady ? '✓ Je suis prêt — modifier' : 'Je suis prêt'}
              </button>
            )}
          </div>

          {/* Board Customizer & Launch Button */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(value => !value)}
                className="w-full p-4 flex items-center justify-between text-left"
                aria-expanded={showAdvancedSettings}
              >
                <div>
                  <div className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                    Personnaliser la partie
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {BOARD_PRESETS[gameState.settings.boardType].name} · {gameState.settings.timerSeconds === 0 ? 'sans chrono' : `${gameState.settings.timerSeconds}s`} · {gameState.settings.wedgesToWin} camemberts
                  </p>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
              </button>
              {showAdvancedSettings && (
                <div className="border-t border-slate-200 dark:border-slate-800">
                  <React.Suspense
                    fallback={<div className="p-5 text-center text-xs font-bold text-slate-500">Chargement des réglages…</div>}
                  >
                    <BoardCustomizer
                      settings={gameState.settings}
                      isHost={isHost}
                      generationToken={generationToken}
                      onUpdateSettings={onUpdateSettings}
                      onAddCustomPack={onAddCustomPack}
                      customPacks={gameState.customPacks}
                    />
                  </React.Suspense>
                </div>
              )}
            </div>

            {/* Big Launch Game Button */}
            {isHost ? (
              <div className="space-y-2">
                <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                  {gameState.settings.isLocalMode
                    ? `${gameState.players.length} joueur${gameState.players.length > 1 ? 's' : ''} local${gameState.players.length > 1 ? 'aux' : ''}`
                    : `${readyCount}/${connectedPlayers.length} joueurs prêts`}
                </div>
                <button
                  disabled={!gameState.settings.isLocalMode && !everyoneReady}
                  onClick={() => {
                    soundManager.playClick();
                    onStartGame();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg rounded-3xl flex items-center justify-center gap-3 shadow-2xl scale-105 active:scale-100 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
                >
                  <Play className="w-6 h-6 fill-slate-950 stroke-none" />
                  {!gameState.settings.isLocalMode && !everyoneReady ? 'EN ATTENTE DES JOUEURS' : 'DÉMARRER LA PARTIE'}
                </button>
                {gameState.players.length > 1 && (
                  <p className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    🎲 Le premier joueur sera tiré au sort : un lancer de dé chacun, le plus haut commence.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center text-slate-600 dark:text-slate-300 font-semibold text-sm">
                ⏳ En attente que l&apos;hôte lance la partie...
              </div>
            )}
          </div>
        </div>

        {/* Modal to add local player on pass & play */}
        {showAddLocalModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
            <form onSubmit={handleAddLocalSubmit} className="my-auto bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" /> Ajouter un Joueur Local
              </h3>

              <AvatarPicker
                playerName={localName}
                avatarId={localAvatar}
                selectedColor={localColor}
                difficulty={localDifficulty}
                onUpdate={(up) => {
                  if (up.name !== undefined) setLocalName(up.name);
                  if (up.avatarId) setLocalAvatar(up.avatarId);
                  if (up.color) setLocalColor(up.color);
                  if (up.difficulty) setLocalDifficulty(up.difficulty);
                }}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLocalModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!localName.trim()}
                  className="flex-1 py-3 bg-amber-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg disabled:opacity-50"
                >
                  Ajouter au Salon
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Welcome Screen (Mode Selection & Room Join)
  const welcomeAvatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const DIFFICULTY_LABEL: Record<DifficultyLevel, string> = {
    enfant: '🎈 Enfant',
    ado: '🚀 Ado',
    adulte: '🏆 Adulte',
  };
  const isJoining = tab === 'join';

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-5 animate-fadeIn">

      {/* Hero compact : le nom du jeu et sa promesse tiennent au-dessus de la ligne de flottaison */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center text-3xl shadow-xl ring-4 ring-amber-300/40">
          🎯
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Trivial Pursuit <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Famille</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Le quiz de culture générale à jouer en famille, sur un ou plusieurs appareils.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/40 text-red-600 dark:text-red-300 text-xs font-bold rounded-2xl text-center">
          {errorMessage}
        </div>
      )}

      {/* Carte d'action : onglet, prénom et bouton principal tiennent ensemble sans scroll */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">

        {/* Choix créer / rejoindre */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              !isJoining
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" /> Créer un salon
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              isJoining
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Rejoindre
          </button>
        </div>

        {codeFromUrl && isJoining && (
          <div className="p-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-500/60 text-amber-950 dark:text-amber-200 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-lg">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <span>🎉 Invitation au salon <strong>{codeFromUrl.toUpperCase()}</strong> — entrez votre prénom et rejoignez !</span>
          </div>
        )}

        {/* Prénom : le seul champ requis pour se lancer */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Votre prénom
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Ex : Papa, Mamie, Thomas…"
            maxLength={18}
            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500 text-base"
          />
          {/* Mention discrète : le profil ne quitte pas l'appareil, et on peut l'oublier. */}
          <p className="mt-1 flex items-center justify-between gap-2 px-1 text-[10px] leading-tight text-slate-400 dark:text-slate-500">
            <span>🔒 Gardé sur cet appareil, rien n’est envoyé en ligne.</span>
            {hasSavedProfile && (
              <button
                type="button"
                onClick={handleForgetProfile}
                className="shrink-0 font-semibold underline decoration-dotted underline-offset-2 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Oublier
              </button>
            )}
          </p>
        </div>

        {/* Code du salon, seulement pour rejoindre */}
        {isJoining && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Code du salon
            </label>
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="FAM-XXXX"
              maxLength={8}
              className="w-full px-4 py-3 rounded-2xl border-2 border-amber-500/60 bg-amber-500/5 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black text-xl text-center tracking-widest focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>
        )}

        {/* Avatar, couleur et difficulté : repliés, car facultatifs pour démarrer (modifiables ensuite dans le salon) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowProfileSetup(value => !value)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
            aria-expanded={showProfileSetup}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg shadow-inner"
                style={{ backgroundColor: color }}
              >
                {welcomeAvatar.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Personnaliser mon avatar</span>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {welcomeAvatar.name.split(' ')[0]} · {DIFFICULTY_LABEL[difficulty]} · facultatif
                </span>
              </span>
            </span>
            <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${showProfileSetup ? 'rotate-180' : ''}`} />
          </button>
          {showProfileSetup && (
            <div className="border-t border-slate-200 dark:border-slate-800">
              <AvatarPicker
                embedded
                showName={false}
                playerName={playerName}
                avatarId={avatarId}
                selectedColor={color}
                difficulty={difficulty}
                onUpdate={(up) => {
                  if (up.name !== undefined) setPlayerName(up.name);
                  if (up.avatarId) setAvatarId(up.avatarId);
                  if (up.color) setColor(up.color);
                  if (up.difficulty) setDifficulty(up.difficulty);
                }}
              />
            </div>
          )}
        </div>

        {/* Action principale */}
        {isJoining ? (
          <button
            type="button"
            onClick={() => handleJoinSubmit()}
            disabled={!joinCodeInput.trim() || !playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] transition-all disabled:opacity-50"
          >
            🚀 Rejoindre {joinCodeInput.trim() ? `le salon ${joinCodeInput.trim()}` : 'le salon'}
          </button>
        ) : (
          <div className="space-y-2.5">
            <button
              onClick={() => handleCreateOnline(false)}
              disabled={!playerName.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-xl active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Globe className="w-5 h-5" />
              Jouer en ligne — chacun son téléphone
            </button>
            <button
              onClick={() => handleCreateOnline(true)}
              disabled={!playerName.trim()}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-700 transition-all disabled:opacity-50"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              Jouer sur un seul appareil (mode local)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
