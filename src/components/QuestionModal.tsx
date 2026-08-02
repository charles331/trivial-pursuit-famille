import React, { useState, useEffect, useRef } from 'react';
import { Question, Player, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { PlayerWedgeBadge } from './PlayerWedgeBadge';
import { LiveSpotlight } from './LiveSpotlight';
import { resolveReaderId } from '../server/turnRoles';
import { soundManager } from '../utils/sound';
import { resolveQuestionTimerSeconds } from '../utils/questionTimer';
import { Timer, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, Eye, EyeOff, BookOpen } from 'lucide-react';

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
  onNextTurn: () => void;
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
  onNextTurn
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [localReaderReady, setLocalReaderReady] = useState(false);
  // The reader's solution is shown only while the button is held down. Phones
  // get put flat on the table between two questions, and a permanently
  // highlighted answer was simply read by the player who had to guess it.
  const [isSolutionHeld, setIsSolutionHeld] = useState(false);

  const category = CATEGORIES[question.categoryId] || CATEGORIES.histoire;

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
  const canAnswer = isMyTurn || isIReader;
  // The server strips the solution from everyone but the reader, so this is
  // absent for spectators even though the type says otherwise.
  const solutionIndex = typeof question.correctAnswerIndex === 'number'
    ? question.correctAnswerIndex
    : null;
  const canHoldToReveal = isIReader && !isAnswered && solutionIndex !== null;

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
    if (effectiveTimerSeconds <= 0 || lastAnswerResult || (isReaderMode && isLocalMode && !localReaderReady)) return;

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
    localReaderReady
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
  }, [question.id]);

  // Release the solution from anywhere, not only from the button: a finger that
  // slides off, a phone put down, a switch to another app. The answer must never
  // be left on screen because a pointerup landed somewhere else.
  useEffect(() => {
    if (!isSolutionHeld) return;
    const release = () => setIsSolutionHeld(false);
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

          {/* Question Text */}
          {isCardMasked ? (
            <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-purple-400 bg-purple-50/80 p-3 dark:border-purple-800 dark:bg-purple-950/40">
              <span className="shrink-0 text-2xl">🎴</span>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-purple-950 dark:text-purple-100">
                  Carte masquée
                </h3>
                <p className="mt-0.5 text-xs font-semibold leading-snug text-purple-700 dark:text-purple-300">
                  Écoutez <strong>{readerPlayer.name}</strong>, répondez de vive voix, puis touchez l’option choisie.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-base font-bold leading-snug text-slate-900 dark:text-white sm:text-lg">
              {question.question}
            </p>
          )}

          {/* Hold-to-reveal: the reader checks the answer without exposing it to
              the table. Nothing is highlighted until the button is held. */}
          {canHoldToReveal && solutionIndex !== null && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50/70 p-1.5 dark:bg-emerald-950/30">
              <button
                type="button"
                aria-label="Maintenir pour afficher la réponse"
                aria-pressed={isSolutionHeld}
                onContextMenu={event => event.preventDefault()}
                onPointerDown={() => setIsSolutionHeld(true)}
                onPointerLeave={() => setIsSolutionHeld(false)}
                onKeyDown={event => {
                  if (event.key === ' ' || event.key === 'Enter') setIsSolutionHeld(true);
                }}
                onKeyUp={() => setIsSolutionHeld(false)}
                onBlur={() => setIsSolutionHeld(false)}
                className={`tap-target flex shrink-0 select-none touch-manipulation items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-black uppercase tracking-wide transition-colors ${
                  isSolutionHeld
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-emerald-500/50 bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300'
                }`}
                style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
              >
                {isSolutionHeld ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                Révéler
              </button>
              <p className="min-w-0 flex-1 text-[11px] font-bold leading-snug text-emerald-800 dark:text-emerald-200">
                {isSolutionHeld ? (
                  <>
                    Réponse&nbsp;: <strong>{LETTERS[solutionIndex]}</strong> — {question.options[solutionIndex]}
                  </>
                ) : (
                  'Réponse cachée. Maintenez le bouton pour la voir.'
                )}
              </p>
            </div>
          )}

          {/* Option Choices Grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {question.options.map((opt, idx) => {
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

              return (
                <button
                  key={idx}
                  disabled={isAnswered || !canAnswer}
                  onClick={() => handleOptionClick(idx)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left text-sm transition-colors ${btnStyle} ${
                    !isAnswered && canAnswer ? 'active:scale-[0.98]' : ''
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold shadow-inner ${
                    isAnswered && isCorrect
                      ? 'bg-white/20 text-white'
                      : isReaderHighlight
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                  }`}>
                    {LETTERS[idx]}
                  </span>

                  <span className="min-w-0 flex-1 font-semibold leading-snug">
                    {isCardMasked && !isAnswered ? `Option ${LETTERS[idx]}` : opt}
                  </span>

                  {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
                  {isAnswered && isChosen && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-white" />}
                  {isSelected && !isReaderHighlight && <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-500" />}
                </button>
              );
            })}
          </div>

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

        {/* Action bar: pinned so the only thing left to do is always in reach. */}
        {canAnswer && (
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
                  {lastAnswerResult?.isCorrect ? 'Super ! Relancer le dé 🎲' : 'Passer au Joueur Suivant ➡️'}
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
                  {selectedIdx === null ? 'Choisissez une réponse' : `Valider la réponse ${LETTERS[selectedIdx]}`}
                </button>
                <p className="mt-1.5 hidden text-center text-[11px] text-slate-500 sm:block dark:text-slate-400">
                  Vous pouvez changer de choix avant de valider.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
