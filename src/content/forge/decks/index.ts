/**
 * Every category's story deck. Copy to src/content/forge/decks/index.ts.
 * Adding a category without a deck fails the build (same rule as CATEGORY_CONTENT).
 */
import type { ExperienceCategory } from '../../../types';
import type { StoryDeck } from '../types';
import { fantasy } from './fantasy';
import { adventure } from './adventure';
import { historical_adventure } from './historical_adventure';
import { horror } from './horror';
import { cozy_ghibli } from './cozy_ghibli';
import { romantic } from './romantic';
import { revenge } from './revenge';
import { apocalypse } from './apocalypse';
import { zombie } from './zombie';
import { cosmic_horror } from './cosmic_horror';
import { psychedelic_trip } from './psychedelic_trip';
import { tiktok_drama } from './tiktok_drama';
import { ancient_greek } from './ancient_greek';
import { mythology } from './mythology';
import { real_life } from './real_life';

export const STORY_DECKS = {
  fantasy,
  adventure,
  historical_adventure,
  horror,
  cozy_ghibli,
  romantic,
  revenge,
  apocalypse,
  zombie,
  cosmic_horror,
  psychedelic_trip,
  tiktok_drama,
  ancient_greek,
  mythology,
  real_life,
} satisfies Record<ExperienceCategory, StoryDeck>;
