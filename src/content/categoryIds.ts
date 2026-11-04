import type { ExperienceCategory } from '../types';

/** The categories in home-screen order. */
export const CATEGORY_IDS = [
  'fantasy', 'adventure', 'historical_adventure', 'horror', 'cozy_ghibli', 'romantic', 'revenge', 'apocalypse',
  'zombie', 'cosmic_horror', 'psychedelic_trip', 'tiktok_drama', 'ancient_greek', 'mythology', 'real_life'
] as const satisfies readonly ExperienceCategory[];

// Fails to compile if a category is added to ExperienceCategory but not listed here.
type Missing = Exclude<ExperienceCategory, (typeof CATEGORY_IDS)[number]>;
const _complete: Missing extends never ? true : never = true;
void _complete;
