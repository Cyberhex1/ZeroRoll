/**
 * ZeroRoll 0.2 story decks: the raw material a story roll is drawn from.
 * Copy to src/content/forge/types.ts. Every category has one StoryDeck in
 * src/content/forge/decks/<category>.ts; scripts/validate-content.ts checks them.
 *
 * A roll draws one card from each part (the "spread"), avoiding cards the player saw
 * recently, and the model fuses the spread into one story. The decks are the
 * creativity: concrete, unusual, specific inputs. Keep every card short and vivid.
 */

/** Shared plot engines (src/content/forge/engines.ts). */
export type EngineId =
  | 'heist' | 'journey' | 'mystery' | 'siege' | 'bargain' | 'rescue' | 'contest' | 'masquerade'
  | 'trial' | 'hunt' | 'inheritance' | 'homecoming' | 'courtship' | 'escape' | 'survival' | 'delivery';

/**
 * A story family: one kind of story the category tells (Mythology has Norse saga,
 * Egyptian afterlife, Celtic otherworld, grimoire occult...). It replaces the single
 * NarrativeProfile.pattern per category, which made every roll in a category the same shape.
 */
export interface StoryFamily {
  id: string;
  name: string;
  /** Who the hero usually is, with 3 or 4 varied examples. */
  hero: string;
  /** Where these stories start (the first scene lives here). */
  start: string;
  /** What goes wrong (or changes), on screen, later. */
  turn: string;
  /** The payoff at the end. */
  payoff: string;
  /** Concrete images and textures for this family. Nouns, not finished sentences (finished sentences get copied verbatim). */
  palette: string;
  /** A hard rule for this family, sent as is (e.g. Revenge: the betrayal has not happened yet in scene 1). */
  rule?: string;
  /** SourceDna ids this family draws its primary influence from. */
  sources: string[];
  /**
   * Where the player may join a story of this family (src/setup/storyShape.ts). Unset: any.
   * Revenge uses ['before', 'brewing', 'long_road'] so the betrayal is always lived on screen.
   */
  shapes?: Array<'before' | 'brewing' | 'long_road' | 'hidden_return'>;
  /** Relative draw weight, default 1. */
  weight?: number;
}

/**
 * The storytelling DNA of one source work: structure, signature moves, dynamics and feel,
 * in 30 to 60 words. Never plot summary to be retold, never quotes. This is how the
 * category's media list actually reaches the model (before 0.2 it was only a list of titles).
 */
export interface SourceDna {
  id: string;
  /** As in the category's media list. */
  title: string;
  medium: string;
  dna: string;
}

export interface StoryDeck {
  /** One or two sentences: what this genre does best, plus any hard genre rule (Real Life: no supernatural). */
  signature: string;
  families: StoryFamily[];
  dna: SourceDna[];
  /** Plot engines this category may draw. */
  engines: EngineId[];
  /** Inciting moments that happen NOW in scene 1. Offered, not imposed: the model may twist or replace them. */
  hooks: string[];
  /** Specific places with one unique detail. */
  places: string[];
  /** Secrets for the outline only (never the premise). */
  complications: string[];
  /** Big genre moments for LATER chapters (the old seed list's vivid prompts live here now). */
  setPieces: string[];
}
