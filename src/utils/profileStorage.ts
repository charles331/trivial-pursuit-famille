import { DifficultyLevel } from '../types';

export const PROFILE_STORAGE_KEY = 'tp_fam_profile';

export interface StoredProfile {
  name: string;
  avatarId: string;
  color: string;
  difficulty: DifficultyLevel;
}

export const DEFAULT_PROFILE: StoredProfile = {
  name: '',
  avatarId: 'lion',
  color: '#EF4444',
  difficulty: 'adulte',
};

export function loadStoredProfile(): StoredProfile {
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

export function mergeStoredProfile(
  current: StoredProfile,
  update: Partial<StoredProfile>,
): StoredProfile {
  return {
    name: update.name !== undefined ? update.name : current.name,
    avatarId: update.avatarId ?? current.avatarId,
    color: update.color ?? current.color,
    difficulty: update.difficulty ?? current.difficulty,
  };
}

export function saveStoredProfile(profile: StoredProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Un stockage indisponible (navigation privée, quota) ne doit pas bloquer le jeu.
  }
}
