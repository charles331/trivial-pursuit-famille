import React, { useState, useEffect, useRef } from 'react';
import { EmojiReaction } from '../types';
import { soundManager } from '../utils/sound';

interface LiveChatProps {
  onSendEmoji: (emoji: string) => void;
  emojiEvent: EmojiReaction | null;
}

export const LiveChat: React.FC<LiveChatProps> = ({ onSendEmoji, emojiEvent }) => {
  const [floatingEmojis, setFloatingEmojis] = useState<(EmojiReaction & { x: number })[]>([]);
  const activeTimersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const EMOJI_LIST = ['👏', '🎉', '🎯', '🤔', '😂', '🔥', '🏆', '😱'];

  useEffect(() => {
    if (emojiEvent && emojiEvent.id) {
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

  // Clean up all pending timers on unmount
  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach((t) => clearTimeout(t));
      activeTimersRef.current.clear();
    };
  }, []);

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
            <span className="text-4xl filter drop-shadow-md animate-bounce">{item.emoji}</span>
            <span className="text-[10px] font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded-full shadow">
              {item.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Emoji Reactions Toolbar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl border border-slate-700">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              soundManager.playClick();
              onSendEmoji(emoji);
            }}
            className="w-9 h-9 flex items-center justify-center text-xl hover:scale-125 active:scale-90 transition-transform rounded-full hover:bg-slate-800"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};

