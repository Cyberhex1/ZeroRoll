/**
 * The launch setup menu (the "Initialize <Category> Campaign" sheet) as data.
 *
 * The story is the one independent roll. Everything else on the sheet (title, hero, hero sheet,
 * gear, opening moves) is built to fit it: a story roll produces all of it at once, and the
 * smaller rolls are written for the story as it stands (ohnna, 2026-11-21).
 */
import type { CampaignInspiration, DMStoryOutline, ExperienceCategory, InventoryItem, StatBlock } from '../types';

/** 'any': the player chose none, so the hero gets a unisex name and they/them. */
export type PronounChoice = 'any' | 'she/her' | 'he/him' | 'they/them' | 'custom';

/** The editable part of the hero sheet. HP and AC are worked out from these, never typed. */
export interface HeroSheetDraft {
  /** 5e point-buy scores (8 to 15, 27 points). */
  stats: StatBlock;
  /** Trained skills, lowercase names from rules.SKILLS. Used by Full 5e. */
  skills: string[];
  gear: InventoryItem[];
  /** Spells or signature abilities. */
  spells: string[];
}

export interface HeroDraft {
  name: string;
  roleClass: string;
  origin: string;
  appearance: string;
}

/** Everything one story roll produces, already checked and repaired by normalize.ts. */
export interface StoryPackage {
  title: string;
  premise: string;
  outline: DMStoryOutline;
  actions: string[];
  hero: HeroDraft;
  sheet: HeroSheetDraft;
}

/** Where the story on the sheet came from, shown on the story card. */
export type StorySource = 'ai' | 'opener' | 'player';

/** Fields the player typed or set by hand. A reroll that would replace one asks first. */
export type TypedField = 'title' | 'story' | 'name' | 'roleClass' | 'origin' | 'appearance' | 'sheet';

export interface SetupDraft {
  category: ExperienceCategory;
  title: string;
  /** Back-of-the-book premise, written to the player as "you". */
  premise: string;
  outline?: DMStoryOutline;
  actions: string[];
  /** Tone references and story seeds sent to the AI; stored on the campaign. */
  inspiration: CampaignInspiration;
  storySource: StorySource;
  /** True when a hand-written opener was used without the AI building it out. */
  builtIn: boolean;
  /** The story seed the player picked, when the story was built from one. */
  seed?: string;
  hero: HeroDraft;
  portrait?: string;
  sheet: HeroSheetDraft;
  /** The sheet the story came with, for "Reset to the story's sheet". */
  storySheet: HeroSheetDraft;
  typed: TypedField[];
  /**
   * The story changed but the hero and sheet were not rebuilt to match it (the rebuild failed,
   * or the AI is off). Initialize waits until the player rebuilds or keeps them.
   */
  stale: boolean;
}
