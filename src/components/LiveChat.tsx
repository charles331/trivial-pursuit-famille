import React, { useState, useEffect, useRef } from 'react';
import { EmojiReaction } from '../types';
import { soundManager } from '../utils/sound';

interface LiveChatProps {
  onSendEmoji: (emoji: string) => void;
  emojiEvent: EmojiReaction | null;
}

export const LiveChat: React.FC<LiveChatProps> = ({ onSendEmoji, emojiEvent }) => {
  const [floatingEmojis, setFloatingEmojis] = useState<(EmojiReaction & { x: number })[]>([]);
  // La palette des huit réactions faisait une barre de plus de trois cents pixels
  // en bas de l'écran, en permanence, sur un téléphone où le plateau se joue déjà
  // à l'étroit. Elle est désormais repliée derrière un seul bouton : on l'ouvre
  // pour réagir, elle se referme aussitôt après.
  const [isOpen, setIsOpen] = useState(false);
  const activeTimersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const paletteRef = useRef<HTMLDivElement | null>(null);

  const EMOJI_LIST = ['👏', '🎉', '🎯', '🤔', '😂', '🔥', '🏆', '😱'];

  useEffect(() => {
    if (document.visibilityState === 'visible' && emojiEvent && emojiEvent.id) {
      const targetId = emojiEvent.id;
      const newFloating = {
        ...emojiEvent,
        x: Math.floor(Math.random() * 60) + 20 // 20% to 80% left position
      };

      setFloatingEmojis((prev) => {
        // Prevent duplicate IDs
        if (prev.some((e) => e.id === targetId)) return prev;
        return [...prev, newFloating];
      });

      // Schedule removal of this specific emoji after animation completes (2800ms)
      const timer = setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== targetId));
        activeTimersRef.current.delete(timer);
      }, 2800);

      activeTimersRef.current.add(timer);
    }
  }, [emojiEvent]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      activeTimersRef.current.forEach(timer => clearTimeout(timer));
      activeTimersRef.current.clear();
      setFloatingEmojis([]);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach((t) => clearTimeout(t));
      activeTimersRef.current.clear();
    };
  }, []);

  // Ouverte, la palette recouvre le bas du plateau : elle se referme donc au
  // premier geste ailleurs, comme le fait un menu, et à l'appui sur Échap.
  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutside = (event: PointerEvent) => {
      if (!paletteRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Animated Emoji Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-20 flex flex-col items-center animate-floatUp"
            style={{ left: `${item.x}%` }}
          >
            <span className="text-4xl">{item.emoji}</span>
            <span className="text-[10px] font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded-full shadow">
              {item.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Réactions : un bouton replié dans le coin, la palette à la demande */}
      <div
        ref={paletteRef}
        className="fixed bottom-3 right-3 z-30 flex items-center justify-end gap-1.5 rounded-full border border-slate-700 bg-slate-900/95 p-1.5 shadow-lg backdrop-blur-sm"
      >
        {isOpen && EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              soundManager.playClick();
              onSendEmoji(emoji);
              // Une réaction se choisit d'un geste : la palette se referme derrière
              // elle plutôt que de rester ouverte sur le plateau.
              setIsOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-125 hover:bg-slate-800 active:scale-90"
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setIsOpen((open) => !open);
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fermer les réactions' : 'Envoyer une réaction'}
          title={isOpen ? 'Fermer les réactions' : 'Envoyer une réaction'}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl transition-transform active:scale-90 ${
            isOpen ? 'bg-slate-800 text-slate-300' : 'hover:scale-110 hover:bg-slate-800'
          }`}
        >
          {isOpen ? '✕' : '😄'}
        </button>
      </div>
    </>
  );
};
