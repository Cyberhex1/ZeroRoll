import type { ExperienceCategory } from '../../types';
import type { CategoryContent } from '../types';
import { fantasy } from './fantasy';
import { adventure } from './adventure';
import { historicalAdventure } from './historical_adventure';
import { horror } from './horror';
import { cozyGhibli } from './cozy_ghibli';
import { romantic } from './romantic';
import { revenge } from './revenge';
import { apocalypse } from './apocalypse';
import { zombie } from './zombie';
import { cosmicHorror } from './cosmic_horror';
import { psychedelicTrip } from './psychedelic_trip';
import { tiktokDrama } from './tiktok_drama';
import { ancientGreek } from './ancient_greek';
import { mythology } from './mythology';
import { realLife } from './real_life';

/** Every category's content, in home-screen order. Adding a category without content fails the build. */
export const CATEGORY_CONTENT = {
  fantasy: fantasy,
  adventure: adventure,
  historical_adventure: historicalAdventure,
  horror: horror,
  cozy_ghibli: cozyGhibli,
  romantic: romantic,
  revenge: revenge,
  apocalypse: apocalypse,
  zombie: zombie,
  cosmic_horror: cosmicHorror,
  psychedelic_trip: psychedelicTrip,
  tiktok_drama: tiktokDrama,
  ancient_greek: ancientGreek,
  mythology: mythology,
  real_life: realLife,
} satisfies Record<ExperienceCategory, CategoryContent>;
