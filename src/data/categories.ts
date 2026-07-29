import { CategoryInfo, CategoryId } from '../types';

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  histoire: {
    id: 'histoire',
    name: 'Histoire',
    color: '#EAB308', // Amber / Yellow
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-500',
    iconName: 'Landmark',
    description: 'Événements historiques, grands personnages, antiquité et dynasties.'
  },
  geographie: {
    id: 'geographie',
    name: 'Géographie',
    color: '#3B82F6', // Blue
    badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-800 dark:text-blue-300',
    borderColor: 'border-blue-500',
    iconName: 'Globe',
    description: 'Capitales, pays, montagnes, fleuves et merveilles du monde.'
  },
  cinema: {
    id: 'cinema',
    name: 'Cinéma & Séries',
    color: '#EC4899', // Pink
    badgeBg: 'bg-pink-100 dark:bg-pink-900/40',
    badgeText: 'text-pink-800 dark:text-pink-300',
    borderColor: 'border-pink-500',
    iconName: 'Film',
    description: 'Films cultes, séries TV, acteurs et classiques d\'animation.'
  },
  sciences: {
    id: 'sciences',
    name: 'Sciences & Nature',
    color: '#10B981', // Emerald / Green
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    borderColor: 'border-emerald-500',
    iconName: 'Microscope',
    description: 'Animaux, espace, corps humain, physique et découvertes scientifiques.'
  },
  art: {
    id: 'art',
    name: 'Art & Littérature',
    color: '#8B5CF6', // Purple
    badgeBg: 'bg-purple-100 dark:bg-purple-900/40',
    badgeText: 'text-purple-800 dark:text-purple-300',
    borderColor: 'border-purple-500',
    iconName: 'Palette',
    description: 'Peinture, romans, poésie, monuments artistiques et auteurs célèbres.'
  },
  sports: {
    id: 'sports',
    name: 'Sports & Loisirs',
    color: '#F97316', // Orange
    badgeBg: 'bg-orange-100 dark:bg-orange-900/40',
    badgeText: 'text-orange-800 dark:text-orange-300',
    borderColor: 'border-orange-500',
    iconName: 'Trophy',
    description: 'Jeux olympiques, football, tennis, règles de jeux et légendes du sport.'
  },
  popculture: {
    id: 'popculture',
    name: 'Pop Culture & Musique',
    color: '#06B6D4', // Cyan
    badgeBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    borderColor: 'border-cyan-500',
    iconName: 'Music',
    description: 'Chansons à succès, bandes dessinées, jeux vidéo et tendances web.'
  },
  gastronomie: {
    id: 'gastronomie',
    name: 'Gastronomie',
    color: '#D97706', // Warm Amber
    badgeBg: 'bg-amber-200 dark:bg-amber-950',
    badgeText: 'text-amber-900 dark:text-amber-200',
    borderColor: 'border-amber-600',
    iconName: 'Utensils',
    description: 'Plats traditionnels, spécialités régionales, desserts et ingrédients.'
  }
};

export const DEFAULT_6_CATEGORIES: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports'
];

export const CATEGORY_IDS: CategoryId[] = [
  'histoire',
  'geographie',
  'cinema',
  'sciences',
  'art',
  'sports',
  'popculture',
  'gastronomie'
];

/**
 * Ramène une catégorie écrite librement — accents, pluriels, libellé d'un
 * modèle de langage — sur l'un des huit camemberts du plateau.
 */
export function normalizeCategoryId(rawCat: string): CategoryId {
  if (!rawCat) return 'popculture';
  const clean = String(rawCat).toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('hist')) return 'histoire';
  if (clean.includes('geo')) return 'geographie';
  if (clean.includes('cin') || clean.includes('film') || clean.includes('serie')) return 'cinema';
  if (clean.includes('scien') || clean.includes('nat')) return 'sciences';
  if (clean.includes('art') || clean.includes('lit')) return 'art';
  if (clean.includes('sport')) return 'sports';
  if (clean.includes('pop') || clean.includes('cult')) return 'popculture';
  if (clean.includes('gastro') || clean.includes('cuis') || clean.includes('manger')) return 'gastronomie';

  return CATEGORY_IDS.includes(clean as CategoryId) ? (clean as CategoryId) : 'popculture';
}
