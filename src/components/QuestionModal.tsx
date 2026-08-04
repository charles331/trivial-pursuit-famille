import React, { useState, useEffect, useRef } from 'react';
import { ActiveQuestionBonus, BonusType, Question, Player, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { PlayerWedgeBadge } from './PlayerWedgeBadge';
import { LiveSpotlight } from './LiveSpotlight';
import { resolveReaderId } from '../server/turnRoles';
import { SURPRISE_WHEEL, jokerCanEarnWedge } from '../server/bonuses';
import { soundManager } from '../utils/sound';
import { resolveQuestionTimerSeconds } from '../utils/questionTimer';
import { Timer, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, Eye, EyeOff, BookOpen, Gift } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuestionModalProps {
  question: Question;
  activePlayer: Player;
  timerSeconds: number;
  questionStartTime?: number | null;
  lastAnswerResult: {
    playerId: string;
    isCorrect: boolean;
    selectedOption: number;
    earnedWedge: CategoryId | null;
  } | null;
  isMyTurn: boolean;
  isReaderMode?: boolean;
  isLocalMode?: boolean;
  allPlayers?: Player[];
  currentUserId?: string;
  onSubmitAnswer: (optionIndex: number) => void;
  onUseBonus: (bonusType: BonusType) => void;
  onNextTurn: () => void;
  /** Le joueur actif signale la fin de la roue surprise pour lancer le minuteur. */
  onSurpriseWheelDone?: () => void;
  /** Nombre de camemberts requis pour gagner : dit si le Joker sert encore. */
  wedgesToWin?: number;
  bonusesEnabled?: boolean;
  bonusAwardedThisTurn?: BonusType | null;
  surpriseSpinThisTurn?: boolean;
  activeQuestionBonus?: ActiveQuestionBonus | null;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  activePlayer,
  timerSeconds,
  questionStartTime,
  lastAnswerResult,
  isMyTurn,
  isReaderMode = false,
  isLocalMode = false,
  allPlayers = [],
  currentUserId,
  onSubmitAnswer,
  onUseBonus,
  onNextTurn,
  onSurpriseWheelDone,
  wedgesToWin = 6,
  bonusesEnabled = false,
  bonusAwardedThisTurn = null,
  surpriseSpinThisTurn = false,
  activeQuestionBonus = null,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [localReaderReady, setLocalReaderReady] = useState(false);
  // The reader's solution is shown only while the button is held down. Phones
  // get put flat on the table between two questions, and a permanently
  // highlighted answer was simply read by the player who had to guess it.
  const [isSolutionHeld, setIsSolutionHeld] = useState(false);
  // Vrai/Faux en mode lecteur : les deux choix restent cachés tant que le
  // lecteur n'a pas révélé au moins une fois la bonne réponse. Le premier
  // maintien les déverrouille ; ils restent ensuite affichés pour trancher.
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);
  // Boîte mystère : le bonus gagné se dévoile en lançant une roue. Le serveur a
  // déjà décidé du résultat ; la roue ne fait que le révéler avec du panache.
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelSpun, setWheelSpun] = useState(false);
  const [wheelDismissed, setWheelDismissed] = useState(false);
  // L'inventaire des bonus vit dans un popup ouvert par un bouton en bas de
  // carte, au lieu d'occuper en permanence l'espace de la question.
  const [bonusPickerOpen, setBonusPickerOpen] = useState(false);

  const category = CATEGORIES[question.categoryId] || CATEGORIES.histoire;
  const format = question.format ?? 'mcq';
  const isMcqFormat = format === 'mcq';
  const isBooleanFormat = format === 'boolean';
  const isOpenFormat = format === 'open';

  // Determine if current client is the active player
  const isIActivePlayer = !localReaderReady && (isMyTurn || (currentUserId ? activePlayer.id === currentUserId : false) || activePlayer.id.startsWith('local_'));

  // The reader is the player seated just *before* the one being questioned, so
  // the card is handed over in table order. `resolveReaderId` is the same helper
  // the server uses to decide who receives the solution.
  const activeIndex = allPlayers.findIndex(p => p.id === activePlayer.id);
  const readerId = activeIndex >= 0 ? resolveReaderId(allPlayers, activeIndex) : null;
  const readerPlayer = allPlayers.find(p => p.id === readerId) ?? activePlayer;

  // Determine if current client is the designated Reader (MUST be a non-active player when Reader Mode is ENABLED).
  // The match is exact: a spectator who wrongly believed they were the reader
  // used to be told to read a card the server never sent them.
  const isIReader = Boolean(
    isReaderMode &&
    (
      (isLocalMode && localReaderReady) ||
      (
        !isIActivePlayer &&
        (
          readerPlayer.id === currentUserId
          // Pass-and-play seats own no socket: the host acts on their behalf.
          || (readerPlayer.id.startsWith('local_') && readerPlayer.id !== activePlayer.id)
        )
      )
    )
  );

  // Enforce card masking: active player's question is ALWAYS hidden in Reader Mode until answered (NO reveal button)
  const isCardMasked = Boolean(isReaderMode && isIActivePlayer && !lastAnswerResult);
  const isAnswered = lastAnswerResult !== null;
  // Case Surprise : tant que la roue n'est pas terminée, le serveur laisse
  // `questionStartTime` à null. Le minuteur reste alors gelé sur toute la table
  // — le décompte ne doit pas courir pendant que la roue tourne.
  const surpriseTimerPending = surpriseSpinThisTurn === true
    && (questionStartTime === null || questionStartTime === undefined);
  const canAnswer = isMyTurn || isIReader;
  // Dépenser un bonus n'est pas répondre : le lecteur peut trancher une réponse
  // orale, mais l'inventaire appartient au joueur actif seul. En pass & play, un
  // seul appareil circule et c'est le joueur actif qui l'a en main.
  const canUseBonus = isIActivePlayer || isLocalMode;
  // The server strips the solution from everyone but the reader, so this is
  // absent for spectators even though the type says otherwise.
  const solutionIndex = typeof question.correctAnswerIndex === 'number'
    ? question.correctAnswerIndex
    : null;
  // Le maintien-pour-révéler ne concerne que les cartes à options : une carte
  // ouverte a son propre dévoilement, suivi d'un jugement réussi / raté.
  const canHoldToReveal = isIReader && !isAnswered && solutionIndex !== null && !isOpenFormat;
  // Qui détient la réponse d'une carte ouverte (le lecteur) peut la révéler puis
  // trancher. Le serveur retire `answer` à tout autre client.
  const canJudgeOpen = isOpenFormat && !isAnswered && canAnswer && typeof question.answer === 'string';

  // Respect the host's choice in every mode. In local reader mode the timer
  // already waits until the device has been handed over and the reader is ready.
  const effectiveTimerSeconds = resolveQuestionTimerSeconds(timerSeconds);

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (effectiveTimerSeconds <= 0) return 999;
    if (questionStartTime && !(isReaderMode && isLocalMode)) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      return Math.max(0, effectiveTimerSeconds - elapsed);
    }
    return effectiveTimerSeconds;
  });
  const timeLeftRef = useRef(timeLeft);
  const selectedIdxRef = useRef(selectedIdx);
  const submitAnswerRef = useRef(onSubmitAnswer);
  const answerRoleRef = useRef({ isIActivePlayer, isIReader });

  // The interval below deliberately stays stable for the whole question. Refs
  // give it the latest selection/callback without tearing it down every second.
  timeLeftRef.current = timeLeft;
  selectedIdxRef.current = selectedIdx;
  submitAnswerRef.current = onSubmitAnswer;
  answerRoleRef.current = { isIActivePlayer, isIReader };

  useEffect(() => {
    let initial = effectiveTimerSeconds <= 0 ? 999 : effectiveTimerSeconds;
    if (effectiveTimerSeconds > 0 && questionStartTime && !(isReaderMode && isLocalMode)) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      initial = Math.max(0, effectiveTimerSeconds - elapsed);
    }
    timeLeftRef.current = initial;
    setTimeLeft(initial);
  }, [question.id, effectiveTimerSeconds, questionStartTime, isReaderMode, isLocalMode]);

  // Countdown timer effect
  useEffect(() => {
    if (effectiveTimerSeconds <= 0 || lastAnswerResult || (isReaderMode && isLocalMode && !localReaderReady) || surpriseTimerPending) return;

    const interval = setInterval(() => {
      let remaining = effectiveTimerSeconds;
      if (questionStartTime && !(isReaderMode && isLocalMode)) {
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        remaining = Math.max(0, effectiveTimerSeconds - elapsed);
      } else {
        remaining = Math.max(0, timeLeftRef.current - 1);
      }

      timeLeftRef.current = remaining;
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        const { isIActivePlayer: canActiveAnswer, isIReader: canReaderAnswer } = answerRoleRef.current;
        if ((canActiveAnswer || canReaderAnswer) && !lastAnswerResult) {
          const timedAnswer = selectedIdxRef.current ?? -1;
          submitAnswerRef.current(timedAnswer);
        }
      } else if (remaining <= 6) {
        soundManager.playTick();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    question.id,
    effectiveTimerSeconds,
    questionStartTime,
    lastAnswerResult,
    isReaderMode,
    isLocalMode,
    localReaderReady,
    surpriseTimerPending
  ]);

  const handleOptionClick = (idx: number) => {
    if (lastAnswerResult) return;
    setSelectedIdx(idx);
    soundManager.playClick();
  };

  const handleConfirmAnswer = () => {
    if (selectedIdx === null || lastAnswerResult) return;
    onSubmitAnswer(selectedIdx);
  };

  useEffect(() => {
    if (!lastAnswerResult) return;
    if (lastAnswerResult.isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
  }, [lastAnswerResult?.playerId, lastAnswerResult?.selectedOption]);

  useEffect(() => {
    setLocalReaderReady(false);
    setSelectedIdx(null);
    setIsSolutionHeld(false);
    setHasRevealedOnce(false);
    setWheelAngle(0);
    setWheelSpinning(false);
    setWheelSpun(false);
    setWheelDismissed(false);
    setBonusPickerOpen(false);
  }, [question.id]);

  // Release the solution from anywhere, not only from the button: a finger that
  // slides off, a phone put down, a switch to another app. The answer must never
  // be left on screen because a pointerup landed somewhere else.
  useEffect(() => {
    if (!isSolutionHeld) return;
    // Relâcher masque la réponse et, du même coup, déverrouille les choix
    // Vrai/Faux : ils n'apparaissent qu'une fois le lecteur passé par la
    // révélation, sans jamais décaler la mise en page pendant le maintien.
    const release = () => { setIsSolutionHeld(false); setHasRevealedOnce(true); };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
    };
  }, [isSolutionHeld]);

  const timerPercent = effectiveTimerSeconds > 0 ? (timeLeft / effectiveTimerSeconds) * 100 : 100;
  const showTimer = effectiveTimerSeconds > 0 && !isAnswered;
  const fiftyFiftyCount = activePlayer.bonuses?.fifty_fifty ?? 0;
  const jokerCount = activePlayer.bonuses?.camembert_joker ?? 0;
  const jokerArmed = activeQuestionBonus?.type === 'camembert_joker';
  // Un 50/50 ne sert qu'aux QCM (il faut au moins deux distracteurs) ; le Joker
  // vaut pour tous les formats.
  // Un Joker ne vaut quelque chose que s'il peut encore rapporter un camembert :
  // celui qui les a tous, ou qui possède déjà celui de cette catégorie, le
  // dépenserait à vide. La même règle vaut côté serveur, qui refuse de le
  // consommer — ici elle évite d'abord de le proposer.
  const jokerCanEarn = jokerCanEarnWedge(activePlayer.wedges, question.categoryId, wedgesToWin);
  const jokerUsable = jokerCount > 0 && jokerCanEarn;
  const hasUsableBonus = (isMcqFormat && fiftyFiftyCount > 0) || jokerUsable;

  // La roue tourne cinq tours puis s'arrête sur le quartier déjà décidé côté
  // serveur (bonus ou case vide). On vise au hasard l'un des quartiers du bon
  // type pour que la roue paraisse libre.
  const spinBonusWheel = () => {
    if (wheelSpinning || wheelSpun) return;
    const matching = SURPRISE_WHEEL
      .map((slot, index) => (slot === bonusAwardedThisTurn ? index : -1))
      .filter(index => index >= 0);
    const target = matching[Math.floor(Math.random() * matching.length)] ?? 0;
    const landing = 360 * 5 - (target * 60 + 30);
    setWheelSpinning(true);
    setWheelAngle(landing);
    soundManager.playClick();
    window.setTimeout(() => {
      setWheelSpinning(false);
      setWheelSpun(true);
      if (bonusAwardedThisTurn) soundManager.playCorrect(); else soundManager.playWrong();
    }, 3600);
  };

  const wheelBackground = `conic-gradient(${SURPRISE_WHEEL
    .map((slot, i) => {
      const color = slot === 'fifty_fifty' ? '#ec4899' : slot === 'camembert_joker' ? '#f59e0b' : '#e2e8f0';
      return `${color} ${i * 60}deg ${(i + 1) * 60}deg`;
    })
    .join(', ')})`;
  // La roue est un rituel d'avant-question : jamais après la réponse. Sans le
  // garde `!isAnswered`, elle réapparaissait en phase « evaluating », car cette
  // phase remonte un nouveau modal (état local réinitialisé) alors que
  // `surpriseSpinThisTurn` reste vrai jusqu'au tour suivant.
  const showWheelPopup = bonusesEnabled && surpriseSpinThisTurn && isIActivePlayer
    && !wheelDismissed && !isAnswered;
  const hiddenOptionIndexes = activeQuestionBonus?.type === 'fifty_fifty'
    ? activeQuestionBonus.hiddenOptionIndexes
    : [];
  const hiddenOptionKey = hiddenOptionIndexes.join(',');

  useEffect(() => {
    if (selectedIdx !== null && hiddenOptionIndexes.includes(selectedIdx)) {
      setSelectedIdx(null);
    }
  }, [hiddenOptionKey, selectedIdx]);

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-950 animate-fadeIn sm:items-center sm:p-4">
      {isReaderMode && isLocalMode && !localReaderReady && !lastAnswerResult && (
        <div className="absolute inset-0 z-20 flex items-start justify-center overflow-y-auto bg-slate-950/95 p-4">
          <div className="my-auto w-full max-w-md space-y-4 rounded-3xl border-2 border-amber-500/50 bg-slate-900 p-5 text-center shadow-2xl">
            <div className="text-4xl">📱</div>
            <div>
              <h2 className="text-xl font-black text-white">Passez l’appareil à {readerPlayer.name}</h2>
              <p className="mt-1.5 text-sm text-slate-300">
                {readerPlayer.name} va lire la carte à voix haute pour {activePlayer.name}. Ne montrez pas l’écran au joueur interrogé.
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setLocalReaderReady(true);
              }}
              className="tap-target w-full rounded-2xl bg-amber-500 py-3.5 font-black text-slate-950 hover:bg-amber-400"
            >
              Je suis {readerPlayer.name}, afficher la carte
            </button>
          </div>
        </div>
      )}

      {/* A full-bleed sheet on a phone, a card on a larger screen. The header and
          the action bar stay put while only the question area scrolls, so the
          options and the validate button are always reachable — the card used to
          overflow a 667 px iPhone with no way to scroll to its bottom. */}
      <div className="relative flex h-full max-h-dvh w-full max-w-xl flex-col overflow-hidden bg-white dark:bg-slate-900 sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl sm:border-4 sm:border-slate-200 sm:shadow-2xl dark:sm:border-slate-800">

        {/* Category Header */}
        <div
          className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 text-white max-sm:pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:py-3"
          style={{ backgroundColor: category.color }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-xl">💡</span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-widest text-white/80">
                {category.name}
                {isReaderMode && ' · Mode lecteur'}
              </p>
              <h2 className="truncate text-sm font-extrabold leading-tight sm:text-base">
                Question pour {activePlayer.name} ({activePlayer.difficulty.toUpperCase()})
              </h2>
            </div>
          </div>

          {/* Timer Countdown Badge */}
          {showTimer && (
            <div className={`flex shrink-0 items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-sm font-black ${timeLeft <= 5 ? 'text-red-200' : 'text-white'}`}>
              <Timer className="h-3.5 w-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Live duo: the reader and the player being questioned. */}
        <LiveSpotlight />

        {/* Progress Timer Line */}
        {showTimer && (
          <div className="h-1 w-full shrink-0 bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}

        {/* Reader Banner Notification */}
        {isReaderMode && !isAnswered && (
          <div className="flex shrink-0 items-center gap-1.5 border-b border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-[11px] font-bold leading-snug text-amber-900 dark:text-amber-200">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            {isIActivePlayer ? (
              <span className="min-w-0">
                <strong>{readerPlayer.name}</strong> vous lit la carte à voix haute.
              </span>
            ) : isIReader ? (
              <span className="min-w-0">
                <strong>Vous lisez</strong> la question et les options à <strong>{activePlayer.name}</strong>.
              </span>
            ) : (
              <span className="min-w-0">
                <strong>{readerPlayer.name}</strong> lit la carte à <strong>{activePlayer.name}</strong>.
              </span>
            )}
          </div>
        )}

        {/* Question & Options Area — the only scrolling region.
            `my-auto` on the inner block centres a short card in the space it has
            and resolves to zero as soon as the content overflows, so a long
            question scrolls from its very first line instead of being clipped. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4">
         <div className="my-auto space-y-3">

          {isCardMasked ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-purple-400 bg-purple-50/80 p-3 dark:border-purple-800 dark:bg-purple-950/40">
              <span className="shrink-0 text-2xl">🎴</span>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-purple-950 dark:text-purple-100">
                  Carte masquée
                </h3>
                <p className="mt-0.5 text-xs font-semibold leading-snug text-purple-700 dark:text-purple-300">
                  Écoutez <strong>{readerPlayer.name}</strong> et répondez de vive voix
                  {isOpenFormat
                    ? ' ; le lecteur validera votre réponse.'
                    : ', puis touchez l’option choisie.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-base font-bold leading-snug text-slate-900 dark:text-white sm:text-lg">
              {question.question}
            </p>
          )}

          {/* Bonus armé : un rappel discret, l'inventaire vivant désormais dans
              un popup ouvert depuis le bas de la carte. */}
          {activeQuestionBonus && !isAnswered && (
            <div className="rounded-xl border border-pink-300/70 bg-pink-50/70 p-2 text-center text-[11px] font-black text-pink-900 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-200">
              {activeQuestionBonus.type === 'camembert_joker'
                ? '🧀 Joker armé : une bonne réponse rapporte un camembert !'
                : '🎯 50/50 utilisé : deux mauvaises réponses ont été éliminées.'}
            </div>
          )}

          {/* Hold-to-reveal: the reader checks the answer without exposing it to
              the table. Nothing is highlighted until the button is held. Sur une
              carte Vrai/Faux, ce premier dévoilement déverrouille aussi les deux
              choix, cachés jusque-là. */}
          {canHoldToReveal && solutionIndex !== null && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-50/70 p-2 dark:bg-emerald-950/30">
              <button
                type="button"
                aria-label="Maintenir pour afficher la réponse"
                aria-pressed={isSolutionHeld}
                onContextMenu={event => event.preventDefault()}
                onPointerDown={() => setIsSolutionHeld(true)}
                onPointerLeave={() => { setIsSolutionHeld(false); setHasRevealedOnce(true); }}
                onKeyDown={event => {
                  if (event.key === ' ' || event.key === 'Enter') setIsSolutionHeld(true);
                }}
                onKeyUp={() => { setIsSolutionHeld(false); setHasRevealedOnce(true); }}
                onBlur={() => setIsSolutionHeld(false)}
                className={`tap-target flex shrink-0 select-none touch-manipulation items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                  isSolutionHeld
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-emerald-500/50 bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300'
                }`}
                style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
              >
                {isSolutionHeld ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Révéler
              </button>
              <p className="min-w-0 flex-1 leading-snug text-emerald-800 dark:text-emerald-200">
                {isSolutionHeld ? (
                  <span className="text-lg font-black">
                    {isBooleanFormat
                      ? question.options[solutionIndex]
                      : <>{LETTERS[solutionIndex]} — {question.options[solutionIndex]}</>}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold">
                    Réponse cachée. Maintenez le bouton pour voir la bonne réponse.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Carte ouverte : la réponse ne s'affiche que tant que le lecteur
              MAINTIENT le bouton. Un téléphone posé sur la table, un doigt qui
              glisse ou un passage en arrière-plan la re-cachent aussitôt (voir
              l'effet qui écoute pointerup/blur/visibilitychange). Comme sur une
              carte Vrai/Faux, les boutons Réussi / Raté ne se déverrouillent
              qu'une fois la réponse révélée une première fois. */}
          {isOpenFormat && !isAnswered && canJudgeOpen && (
            <div className="space-y-2.5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Maintenir pour afficher la réponse"
                  aria-pressed={isSolutionHeld}
                  onContextMenu={event => event.preventDefault()}
                  onPointerDown={() => setIsSolutionHeld(true)}
                  onPointerLeave={() => { setIsSolutionHeld(false); setHasRevealedOnce(true); }}
                  onKeyDown={event => {
                    if (event.key === ' ' || event.key === 'Enter') setIsSolutionHeld(true);
                  }}
                  onKeyUp={() => { setIsSolutionHeld(false); setHasRevealedOnce(true); }}
                  onBlur={() => setIsSolutionHeld(false)}
                  className={`tap-target flex shrink-0 select-none touch-manipulation items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                    isSolutionHeld
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-emerald-500/50 bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300'
                  }`}
                  style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
                >
                  {isSolutionHeld ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  Révéler
                </button>
                <p className="min-w-0 flex-1 leading-snug text-emerald-800 dark:text-emerald-200">
                  {isSolutionHeld ? (
                    <span className="text-lg font-black">{question.answer}</span>
                  ) : (
                    <span className="text-[11px] font-bold">
                      Réponse cachée. Maintenez pour la voir et afficher le jugement.
                    </span>
                  )}
                </p>
              </div>
              {hasRevealedOnce && (
                <>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {activePlayer.name} avait-il bon ?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { soundManager.playClick(); onSubmitAnswer(0); }}
                      className="tap-target flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-black text-white hover:bg-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Réussi
                    </button>
                    <button
                      type="button"
                      onClick={() => { soundManager.playClick(); onSubmitAnswer(-1); }}
                      className="tap-target flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-sm font-black text-white hover:bg-red-400"
                    >
                      <XCircle className="h-4 w-4" /> Raté
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Filet de sécurité : une carte ouverte se juge par un lecteur, qui
              seul reçoit la réponse. `resolveReaderId` bascule déjà le rôle vers
              le joueur connecté suivant si le lecteur se déconnecte. Mais s'il
              ne reste plus aucun autre joueur connecté, personne ne peut valider
              et, sans minuteur, la carte se bloquerait. Le joueur actif peut
              alors la passer (comptée manquée) au lieu de rester coincé. */}
          {isOpenFormat && !isAnswered && canAnswer && !canJudgeOpen && readerId === null && (
            <div className="space-y-2 rounded-2xl border-2 border-amber-400 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/40">
              <p className="text-xs font-semibold leading-snug text-amber-900 dark:text-amber-200">
                Aucun autre joueur connecté ne peut lire ni valider cette question ouverte.
              </p>
              <button
                type="button"
                onClick={() => { soundManager.playClick(); onSubmitAnswer(-1); }}
                className="tap-target w-full rounded-xl bg-amber-500 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-400"
              >
                Passer la question
              </button>
            </div>
          )}

          {/* Carte ouverte, après jugement : la réponse canonique pour tous. */}
          {isOpenFormat && isAnswered && (
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Réponse attendue
              </p>
              <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white">
                {question.answer ?? '—'}
              </p>
            </div>
          )}

          {/* Option Choices Grid — QCM et Vrai/Faux. Les deux choix « Vrai » et
              « Faux » sont toujours visibles : ils ne dévoilent rien (toute
              carte V/F les propose) et le lecteur voit ainsi d'emblée le type de
              carte. Seule la BONNE réponse reste cachée derrière le maintien de
              « Révéler ». Masquée uniquement pour les cartes ouvertes. */}
          {!isOpenFormat && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {question.options.map((opt, idx) => {
              const isEliminated = hiddenOptionIndexes.includes(idx) && !isAnswered;
              const isCorrect = idx === solutionIndex;
              const isChosen = lastAnswerResult?.selectedOption === idx;
              const isSelected = !isAnswered && selectedIdx === idx;
              const isReaderHighlight = canHoldToReveal && isSolutionHeld && isCorrect;

              let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-amber-500 hover:bg-amber-50/50';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-black shadow-lg';
                } else if (isChosen) {
                  btnStyle = 'bg-red-500 text-white border-red-600 font-bold';
                } else {
                  btnStyle = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-50';
                }
              } else if (isReaderHighlight) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
              } else if (isSelected) {
                btnStyle = 'bg-amber-100 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-100 font-bold ring-2 ring-amber-500/30';
              }

              if (isEliminated) {
                btnStyle = 'border-slate-200 bg-slate-100 text-slate-400 opacity-55 line-through dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered || !canAnswer || isEliminated}
                  onClick={() => handleOptionClick(idx)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left text-sm transition-colors ${btnStyle} ${
                    !isAnswered && canAnswer ? 'active:scale-[0.98]' : ''
                  }`}
                >
                  {isMcqFormat && (
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold shadow-inner ${
                      isAnswered && isCorrect
                        ? 'bg-white/20 text-white'
                        : isReaderHighlight
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}>
                      {LETTERS[idx]}
                    </span>
                  )}

                  <span className="min-w-0 flex-1 font-semibold leading-snug">
                    {isEliminated
                      ? `Réponse ${LETTERS[idx]} éliminée`
                      : isCardMasked && !isAnswered && isMcqFormat ? `Option ${LETTERS[idx]}` : opt}
                  </span>

                  {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
                  {isAnswered && isChosen && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-white" />}
                  {isSelected && !isReaderHighlight && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />}
                </button>
              );
            })}
          </div>
          )}

          {/* Explanation & Result Banner */}
          {lastAnswerResult && (
            <div className="space-y-2.5 border-t border-slate-200 pt-3 animate-fadeIn dark:border-slate-800">
              {/* Earned Wedge Celebration Banner */}
              {lastAnswerResult.earnedWedge && (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-2.5 text-xs font-black text-slate-950 shadow-lg">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      CAMEMBERT GAGNÉ EN {CATEGORIES[lastAnswerResult.earnedWedge].name.toUpperCase()} ! 🎉
                    </span>
                  </span>
                  <PlayerWedgeBadge wedges={[lastAnswerResult.earnedWedge]} size={30} />
                </div>
              )}

              {/* Le saviez-vous ? */}
              {question.explanation && (
                <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs text-slate-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500" /> Le saviez-vous ?
                  </div>
                  <p className="font-medium leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          )}
         </div>
        </div>

        {/* Bonus : un bouton pinné en bas ouvre le popup d'inventaire, au lieu
            d'afficher la liste en permanence sur la carte. Il disparaît une fois
            un bonus armé (un seul par question).

            Réservé à celui dont c'est le tour, et non à `canAnswer` : ce dernier
            inclut le lecteur, qui voyait donc l'inventaire de la personne qu'il
            interrogeait et pouvait dépenser son 50/50 à sa place. Un bonus est un
            choix tactique, il n'appartient qu'au joueur actif. En pass & play
            l'appareil est partagé, et c'est bien lui qui le tient. */}
        {bonusesEnabled && canUseBonus && !isAnswered && !activeQuestionBonus && hasUsableBonus && (
          <div className="shrink-0 border-t border-slate-200 bg-white/95 px-3 pt-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <button
              type="button"
              onClick={() => { soundManager.playClick(); setBonusPickerOpen(true); }}
              className="tap-target flex w-full items-center justify-center gap-2 rounded-xl border-2 border-pink-300 bg-pink-50 py-2 text-sm font-black text-pink-700 hover:bg-pink-100 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-300"
            >
              <Gift className="h-4 w-4" /> Utiliser un bonus
              <span className="rounded-full bg-pink-500 px-1.5 text-[11px] font-black text-white">
                {(isMcqFormat ? fiftyFiftyCount : 0) + jokerCount}
              </span>
            </button>
          </div>
        )}

        {/* Action bar: pinned so the only thing left to do is always in reach.
            Sur une carte ouverte non encore jugée, le geste (révéler / réussi /
            raté) vit dans le corps : la barre ne réapparaît qu'après le verdict,
            pour passer au joueur suivant. */}
        {canAnswer && !(isOpenFormat && !isAnswered) && (
          <div className="shrink-0 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur max-sm:pb-[max(0.625rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-900/95">
            {isAnswered ? (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNextTurn();
                }}
                className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-black text-white shadow-xl transition-colors hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400"
              >
                <span>
                  {lastAnswerResult?.earnedWedge
                    ? 'Camembert gagné ! Joueur suivant ➡️'
                    : lastAnswerResult?.isCorrect
                      ? 'Super ! Relancer le dé 🎲'
                      : 'Passer au Joueur Suivant ➡️'}
                </span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={selectedIdx === null}
                  onClick={handleConfirmAnswer}
                  className="tap-target w-full rounded-2xl bg-amber-500 py-3 text-sm font-black text-slate-950 shadow-lg transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {selectedIdx === null
                    ? 'Choisissez une réponse'
                    : isMcqFormat
                      ? `Valider la réponse ${LETTERS[selectedIdx]}`
                      : `Valider : ${question.options[selectedIdx]}`}
                </button>
                <p className="mt-1.5 hidden text-center text-[11px] text-slate-500 sm:block dark:text-slate-400">
                  Vous pouvez changer de choix avant de valider.
                </p>
              </>
            )}
          </div>
        )}

        {/* Popup de la boîte surprise : le joueur actif lance la roue, qui
            s'arrête sur un bonus ou sur une case vide. Elle s'ouvre d'elle-même
            en arrivant sur une case Surprise et se ferme sur « Continuer ». */}
        {showWheelPopup && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-pink-700 dark:text-pink-300">
                <Gift className="h-3.5 w-3.5" /> Boîte surprise
              </div>
              <div className="relative h-44 w-44">
                <div className="absolute left-1/2 top-[-2px] z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-slate-900 dark:border-t-white" />
                <div
                  className="h-full w-full rounded-full border-4 border-white shadow-lg dark:border-slate-700"
                  style={{
                    background: wheelBackground,
                    transform: `rotate(${wheelAngle}deg)`,
                    transition: wheelSpinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  }}
                >
                  {SURPRISE_WHEEL.map((slot, i) => (
                    <span
                      key={i}
                      className="absolute left-1/2 top-1/2 text-xl"
                      style={{ transform: `translate(-50%, -50%) rotate(${i * 60 + 30}deg) translateY(-58px) rotate(-${i * 60 + 30}deg)` }}
                    >
                      {slot === 'fifty_fifty' ? '🎯' : slot === 'camembert_joker' ? '🧀' : ''}
                    </span>
                  ))}
                </div>
                <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-200 bg-white shadow dark:border-slate-600 dark:bg-slate-800" />
              </div>
              {wheelSpun ? (
                <>
                  <p className="text-center text-base font-black text-slate-900 dark:text-white">
                    {bonusAwardedThisTurn === 'camembert_joker'
                      ? '🎉 Joker camembert gagné !'
                      : bonusAwardedThisTurn === 'fifty_fifty'
                        ? '🎉 50/50 gagné !'
                        : '😅 Case vide — pas de bonus cette fois.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setWheelDismissed(true);
                      // La roue est finie : on lance le minuteur pour toute la table.
                      onSurpriseWheelDone?.();
                    }}
                    className="tap-target w-full rounded-xl bg-slate-900 py-2.5 text-sm font-black text-white dark:bg-amber-500 dark:text-slate-950"
                  >
                    Continuer
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={wheelSpinning}
                  onClick={spinBonusWheel}
                  className="tap-target w-full rounded-xl bg-pink-500 py-2.5 text-sm font-black text-white hover:bg-pink-400 disabled:opacity-60"
                >
                  {wheelSpinning ? 'La roue tourne…' : 'Lancer la roue 🎡'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Popup de choix des bonus, ouvert depuis le bouton du bas. Le garde
            `canUseBonus` est répété ici : le bouton est déjà réservé au joueur
            actif, mais un popup resté ouvert au moment où la main change ne doit
            pas laisser dépenser le bonus de quelqu'un d'autre. */}
        {bonusPickerOpen && canUseBonus && (
          <div
            className="absolute inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            onClick={() => setBonusPickerOpen(false)}
          >
            <div
              className="w-full max-w-sm space-y-2 rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900"
              onClick={event => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Utiliser un bonus</h3>
                <button
                  type="button"
                  aria-label="Fermer"
                  onClick={() => setBonusPickerOpen(false)}
                  className="tap-target rounded-lg px-2 text-lg font-black text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              {isMcqFormat && fiftyFiftyCount > 0 && (
                <button
                  type="button"
                  onClick={() => { soundManager.playClick(); onUseBonus('fifty_fifty'); setBonusPickerOpen(false); }}
                  className="tap-target flex w-full items-center gap-3 rounded-xl border-2 border-pink-300 bg-pink-50 p-3 text-left hover:bg-pink-100 dark:border-pink-800 dark:bg-pink-950/40"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-pink-900 dark:text-pink-100">50/50 × {fiftyFiftyCount}</span>
                    <span className="block text-[11px] font-semibold text-pink-700 dark:text-pink-300">Élimine deux mauvaises réponses</span>
                  </span>
                </button>
              )}

              {jokerUsable && (
                <button
                  type="button"
                  onClick={() => { soundManager.playClick(); onUseBonus('camembert_joker'); setBonusPickerOpen(false); }}
                  className="tap-target flex w-full items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-left hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40"
                >
                  <span className="text-2xl">🧀</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-amber-900 dark:text-amber-100">Joker camembert × {jokerCount}</span>
                    <span className="block text-[11px] font-semibold text-amber-700 dark:text-amber-300">Une bonne réponse rapporte un camembert, où que tu sois</span>
                  </span>
                </button>
              )}

              {/* Un joker en poche mais sans effet ici : on le dit, plutôt que de
                  le faire disparaître sans explication. */}
              {jokerCount > 0 && !jokerCanEarn && (
                <div className="flex w-full items-center gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-left opacity-70 dark:border-slate-700 dark:bg-slate-800/60">
                  <span className="text-2xl grayscale">🧀</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-700 dark:text-slate-200">
                      Joker camembert × {jokerCount}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {activePlayer.wedges.length >= wedgesToWin
                        ? 'Vous avez déjà tous vos camemberts : gardez-le, il ne rapporterait rien.'
                        : 'Vous avez déjà le camembert de cette catégorie. Il servira sur une autre case.'}
                    </span>
                  </span>
                </div>
              )}

              {!hasUsableBonus && jokerCount === 0 && (
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Aucun bonus utilisable sur cette carte.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
