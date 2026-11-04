/**
 * The per-category content table (D&D mode). One file per category in ./categories,
 * collected in ./index.ts. scripts/validate-content.ts checks it in CI.
 */
import type { CharacterSheet, InventoryItem } from '../types';

export type GearType = InventoryItem['type'];

export interface GearItem {
  name: string;
  type: GearType;
  isEquipped?: boolean;
  description?: string;
  quantity?: number;
}

/** How the category is shown on the home screen. */
export interface CategoryCard {
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  gradient: string;
  accentColor: string;
  bgTheme: 'dungeon' | 'forest' | 'cyber' | 'ghibli' | 'eldritch' | 'cozy' | 'desert' | 'snow';
  defaultCharacter: Partial<CharacterSheet>;
  samplePrompts: string[];
}

/** How stories in this category should read. Goes to the model (see ./injection.ts). */
export interface NarrativeProfile {
  seedSource: string;
  voice: string;
  atmosphere: string;
  sceneStructure: string;
  storyBeats: string;
  characterDynamics: string;
  encounterPatterns: string;
  sensoryMotifs: string[];
  avoid: string;
  /** Words that must not appear in this category's openers (validator). Whole words; a trailing * makes a prefix. */
  avoidKeywords: string[];
}

export interface MediaReference {
  title: string;
  /** Book, Film, TV, Game, Anime, Web Series, Myth... as written in the source list. */
  medium: string;
}

/** A ready-to-play campaign start. Picking one fills every setup field from it. */
export interface Opener {
  id: string;
  title: string;
  tagline: string;
  premise: string;
  hero: {
    name: string;
    role: string;
    /** A people, species or background (e.g. "High Elf", "Harbor-born human"), never a job title. */
    origin: string;
  };
  actions: [string, string, string];
  gear: GearItem[];
  spells: string[];
  hp: number;
}

/** A story seed: a situation plus what makes it hard. */
export interface Trope {
  premise: string;
  /** The tension at the heart of the seed. Optional until the content pass fills it in. */
  conflict?: string;
}

/** Offline generator material (used only when the player is in Offline mode or picks procedural). */
export interface ProceduralKit {
  titles: string[];
  firstNames: string[];
  lastNames: string[];
  roles: string[];
  origins: string[];
  physicalTraits: string[];
  hooks: Array<{
    hook: string;
    actions: string[];
    gear: GearItem[];
    spells: string[];
    hp: number;
  }>;
}

export interface CategoryContent {
  card: CategoryCard;
  profile: NarrativeProfile;
  media: MediaReference[];
  openers: Opener[];
  tropes: Trope[];
  procedural: ProceduralKit;
  starterInventory: GearItem[];
  /** Short idle "world moves" lines shown when the player is quiet. */
  ambient: string[];
}

export const OPENERS_PER_CATEGORY = 10;
