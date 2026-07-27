import React, { useState, useEffect } from 'react';
import { Question, Player, CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { PlayerWedgeBadge } from './PlayerWedgeBadge';
import { soundManager } from '../utils/sound';
import { Timer, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, Eye, EyeOff, BookOpen, Volume2 } from 'lucide-react';

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
  allPlayers = [],
  currentUserId,
  onSubmitAnswer,
  onNextTurn
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const category = CATEGORIES[question.categoryId] || CATEGORIES.histoire;

  // Determine if current client is the active player
  const isIActivePlayer = isMyTurn || (currentUserId ? activePlayer.id === currentUserId : false) || activePlayer.id.startsWith('local_');

  // Find designated Reader (next player in turn order)
  const activeIndex = allPlayers.findIndex(p => p.id === activePlayer.id);
  const readerPlayer = allPlayers.length > 1 
    ? allPlayers[(activeIndex + 1) % (allPlayers.length || 1)] 
    : activePlayer;

  // Determine if current client is the designated Reader (MUST be a non-active player when Reader Mode is ENABLED)
  const isIReader = Boolean(
    isReaderMode && 
    !isIActivePlayer && 
    (currentUserId 
      ? (readerPlayer?.id === currentUserId || (readerPlayer?.id?.startsWith('local_') && activePlayer.id !== readerPlayer?.id))
      : true)
  );

  // Enforce card masking: active player's question is ALWAYS hidden in Reader Mode until answered (NO reveal button)
  const isCardMasked = Boolean(isReaderMode && isIActivePlayer && !lastAnswerResult);

  // In Reader Mode, reading aloud takes extra time. Give a minimum 60s when timer is active
  const effectiveTimerSeconds = (isReaderMode && timerSeconds > 0)
    ? Math.max(timerSeconds + 30, 60)
    : timerSeconds;

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (effectiveTimerSeconds <= 0) return 999;
    if (questionStartTime) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      return Math.max(0, effectiveTimerSeconds - elapsed);
    }
    return effectiveTimerSeconds;
  });

  // Countdown timer effect
  useEffect(() => {
    if (effectiveTimerSeconds <= 0 || lastAnswerResult) return;

    const interval = setInterval(() => {
      let remaining = effectiveTimerSeconds;
      if (questionStartTime) {
        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
        remaining = Math.max(0, effectiveTimerSeconds - elapsed);
      } else {
        remaining = Math.max(0, timeLeft - 1);
      }

      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (isIActivePlayer && selectedIdx === null && !lastAnswerResult) {
          soundManager.playWrong();
          onSubmitAnswer(-1);
        }
      } else if (remaining <= 6) {
        soundManager.playTick();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [question.id, effectiveTimerSeconds, questionStartTime, lastAnswerResult]);

  const handleOptionClick = (idx: number) => {
    if (lastAnswerResult) return;
    // Allow active player or designated reader to submit answer
    setSelectedIdx(idx);
    soundManager.playClick();
    onSubmitAnswer(idx);

    if (idx === question.correctAnswerIndex) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
  };

  const timerPercent = effectiveTimerSeconds > 0 ? (timeLeft / effectiveTimerSeconds) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Category Header */}
        <div 
          className="p-4 text-white flex items-center justify-between"
          style={{ backgroundColor: category.color }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">💡</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-white/80">
                  THÈME : {category.name}
                </span>
                {isReaderMode && (
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-[10px] font-black uppercase text-amber-200 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Mode Lecteur
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold leading-tight">
                Question pour {activePlayer.name} ({activePlayer.difficulty.toUpperCase()})
              </h2>
            </div>
          </div>

          {/* Timer Countdown Badge */}
          {effectiveTimerSeconds > 0 && !lastAnswerResult && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-sm bg-black/20 ${timeLeft <= 5 ? 'animate-bounce text-red-200' : 'text-white'}`}>
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Progress Timer Line */}
        {effectiveTimerSeconds > 0 && !lastAnswerResult && (
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}

        {/* Reader Banner Notification */}
        {isReaderMode && !lastAnswerResult && (
          <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
              {isIActivePlayer ? (
                <span>
                  📖 <strong>{readerPlayer?.name || 'Le lecteur'}</strong> lit votre question et les propositions à voix haute !
                </span>
              ) : isIReader ? (
                <span>
                  📖 <strong>VOUS ÊTES LE LECTEUR !</strong> Lisez la question et les options ci-dessous à <strong>{activePlayer.name}</strong>.
                </span>
              ) : (
                <span>
                  📖 <strong>{readerPlayer?.name}</strong> lit la question à haute voix pour <strong>{activePlayer.name}</strong>.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Question & Options Area */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Question Text */}
          {isCardMasked ? (
            <div className="p-6 bg-purple-50/80 dark:bg-purple-950/40 rounded-2xl border-2 border-dashed border-purple-400 dark:border-purple-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-3xl shadow-inner">
                🎴
              </div>
              <div>
                <h3 className="font-black text-purple-950 dark:text-purple-100 text-base">
                  Question Masquée pour {activePlayer.name}
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1 max-w-md mx-auto">
                  Écoutez attentivement <strong>{readerPlayer?.name || 'le lecteur'}</strong> qui vous lit la carte à voix haute !
                </p>
                <p className="text-[11px] text-purple-600/80 dark:text-purple-400 mt-2 italic">
                  Répondez de vive voix puis cliquez sur l&apos;option choisie (A, B, C ou D) ci-dessous.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Show indicator for Reader showing correct answer */}
              {isReaderMode && isIReader && !lastAnswerResult && (
                <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 mb-1">
                  ✨ Vue Lecteur : La bonne réponse est surlignée en vert pour vous !
                </div>
              )}
              <div className="text-slate-900 dark:text-white font-bold text-lg sm:text-xl leading-snug">
                {question.question}
              </div>
            </div>
          )}

          {/* Option Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isAnswered = lastAnswerResult !== null;
              const isCorrect = idx === question.correctAnswerIndex;
              const isChosen = lastAnswerResult?.selectedOption === idx;

              // Reader Mode highlight for designated reader before answer is submitted
              const isReaderHighlight = isReaderMode && isIReader && !isAnswered && isCorrect;

              let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-amber-500 hover:bg-amber-50/50';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-black shadow-lg scale-[1.02]';
                } else if (isChosen) {
                  btnStyle = 'bg-red-500 text-white border-red-600 font-bold';
                } else {
                  btnStyle = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-50';
                }
              } else if (isReaderHighlight) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered || (!isMyTurn && !isIReader)}
                  onClick={() => handleOptionClick(idx)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left text-sm transition-all duration-200 ${btnStyle} ${
                    !isAnswered && (isMyTurn || isIReader) ? 'active:scale-95' : ''
                  }`}
                >
                  <span className={`w-8 h-8 rounded-xl font-extrabold flex items-center justify-center text-xs shadow-inner flex-shrink-0 ${
                    isAnswered && isCorrect 
                      ? 'bg-white/20 text-white' 
                      : isReaderHighlight
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {letters[idx]}
                  </span>

                  <span className="font-semibold flex-1 leading-snug">
                    {isCardMasked && !isAnswered ? `Option ${letters[idx]}` : opt}
                  </span>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />}
                  {isAnswered && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-white flex-shrink-0" />}
                  {isReaderHighlight && !isAnswered && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-white shrink-0">
                      Correct
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Result Banner */}
          {lastAnswerResult && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
              {/* Earned Wedge Celebration Banner */}
              {lastAnswerResult.earnedWedge && (
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-between shadow-lg animate-bounce">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <span>CAMEMBERT GAGNÉ EN {CATEGORIES[lastAnswerResult.earnedWedge].name.toUpperCase()} ! 🎉</span>
                  </div>
                  <PlayerWedgeBadge wedges={[lastAnswerResult.earnedWedge]} size={36} />
                </div>
              )}

              {/* Le saviez-vous ? */}
              {question.explanation && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-500" /> Le saviez-vous ?
                  </div>
                  <p className="leading-relaxed font-medium">{question.explanation}</p>
                </div>
              )}

              {/* Continue / Next Turn Button */}
              {(isMyTurn || isIReader) && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onNextTurn();
                  }}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all"
                >
                  <span>
                    {lastAnswerResult.isCorrect ? 'Super ! Relancer le dé 🎲' : 'Passer au Joueur Suivant ➡️'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
