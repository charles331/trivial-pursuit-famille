import { useEffect, useState } from 'react';

/**
 * Shared motion vocabulary.
 *
 * Every animated surface of the game imports its easings and durations from
 * here so the board, the pawns, the dice dock and the modals all move with the
 * same rhythm. Mirrors the CSS custom properties declared in index.css.
 */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT_SOFT = [0.65, 0, 0.35, 1] as const;
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

export const DUR_FAST = 0.18;
export const DUR_BASE = 0.3;
export const DUR_SLOW = 0.56;

/** Time a pawn spends hopping from one tile to the next. */
export const PAWN_STEP_MS = 190;
/** Extra time for the landing squash + impact ring once the last tile is reached. */
export const PAWN_SETTLE_MS = 240;

/** Total travel time for a move of `steps` tiles. */
export function pawnTravelMs(steps: number): number {
  return Math.max(1, steps) * PAWN_STEP_MS + PAWN_SETTLE_MS;
}

/**
 * How long the question card waits before covering the board, so players get
 * to watch the pawn actually reach the tile they picked.
 */
export function questionRevealDelayMs(diceValue: number | null, reducedMotion = false): number {
  if (reducedMotion) return 220;
  const steps = diceValue && diceValue > 0 ? diceValue : 1;
  return Math.min(1500, Math.max(520, pawnTravelMs(steps) - 120));
}

/** Reactive `prefers-reduced-motion` subscription. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Reactive media query helper (used for the mobile-first board layout). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16) || 0,
    g: parseInt(full.slice(2, 4), 16) || 0,
    b: parseInt(full.slice(4, 6), 16) || 0
  };
}

/** Perceived brightness of a colour, 0 (black) → 1 (white). */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Ink colour that stays readable on top of `hex`.
 * Category colours range from bright yellow to deep purple, so icons and
 * labels must flip between dark and light instead of always being white.
 */
export function readableInk(hex: string): string {
  return luminance(hex) > 0.58 ? '#0B1120' : '#FFFFFF';
}

/** `hex` with an alpha channel, as an `rgba()` string. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Blend `hex` towards black by `amount` (0 → unchanged, 1 → black). */
export function shade(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const f = Math.max(0, 1 - amount);
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`;
}

/** Blend `hex` towards white by `amount`. */
export function tint(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * Math.max(0, Math.min(1, amount)));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
