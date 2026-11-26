/**
 * Pure state changes for the launch setup menu. The dialog keeps one SetupDraft and moves it
 * through these functions, so every rule (what a reroll replaces, when a name changes, what
 * the campaign starts with) is testable without the UI.
 */
import type { CampaignInspiration, CategoryInfo, CharacterSheet, DMStoryOutline, ExperienceCategory, StatBlock } from '../types';
import type { Opener } from '../content/types';
import { gearToInventory, getContent, pickInspiration } from '../content';
import { heroNameFor } from '../content/procedural';
import { nameFitsPronouns } from '../content/names';
import { RulesMode, abilityMod, castsSpells, combatStats, defaultProficiencies, roleTemplate } from '../dnd/rules';
import { splitStartingGold } from '../dnd/applyTurn';
import { uid } from '../lib/ids';
import { FIELD_LIMITS, normalizeSkills } from './normalize';
import { roleSpread } from './pointBuy';
import type { HeroSheetDraft, PronounChoice, SetupDraft, StoryPackage, StorySource, TypedField } from './types';

export const TYPED_LABELS: Record<TypedField, string> = {
  title: 'title',
  story: 'story',
  name: 'name',
  roleClass: 'class',
  origin: 'origin',
  appearance: 'looks',
  sheet: 'hero sheet'
};

/** What each reroll replaces, so the confirm can name exactly what the player typed and will lose. */
export const REPLACES = {
  story: ['title', 'story', 'name', 'roleClass', 'origin', 'appearance', 'sheet'],
  adapt: ['roleClass', 'origin', 'appearance', 'sheet'],
  opener: ['title', 'story', 'name', 'roleClass', 'origin', 'appearance', 'sheet'],
  roleClass: ['roleClass', 'sheet'],
  origin: ['origin', 'appearance'],
  name: ['name'],
  title: ['title']
} as const satisfies Record<string, readonly TypedField[]>;

export function resolvePronouns(choice: PronounChoice, custom: string): string {
  if (choice === 'any') return 'they/them';
  return choice === 'custom' ? custom.trim().slice(0, FIELD_LIMITS.pronouns) || 'they/them' : choice;
}

/** The typed fields a change would replace, as words for a confirm ("name, class"). */
export function typedAmong(draft: SetupDraft, fields: readonly TypedField[], keep: readonly TypedField[] = []): string[] {
  return fields.filter((f) => draft.typed.includes(f) && !keep.includes(f)).map((f) => TYPED_LABELS[f]);
}

const withTyped = (draft: SetupDraft, field: TypedField): TypedField[] => (draft.typed.includes(field) ? draft.typed : [...draft.typed, field]);
const withoutTyped = (draft: SetupDraft, fields: readonly TypedField[]): TypedField[] => draft.typed.filter((f) => !fields.includes(f));

/** A sheet for a role alone: its usual spread, skills and spells, with the gear given. */
export function sheetForRole(roleClass: string, gear: HeroSheetDraft['gear'] = []): HeroSheetDraft {
  return {
    stats: roleSpread(roleClass),
    skills: normalizeSkills(defaultProficiencies(roleClass), roleClass),
    gear,
    spells: roleTemplate(roleClass).spells.slice(0, 4)
  };
}

/** A hand-written opener as a whole draft: its story, hero, first moves and gear belong together. */
export function draftFromOpener(
  category: ExperienceCategory,
  opener: Opener,
  pronouns: string,
  inspiration: CampaignInspiration = pickInspiration(category, opener.id)
): SetupDraft {
  const sheet: HeroSheetDraft = {
    ...sheetForRole(opener.hero.role, gearToInventory(opener.gear)),
    ...(opener.spells.length && castsSpells(opener.hero.role) !== false ? { spells: opener.spells.slice(0, 4) } : {})
  };
  return {
    category,
    title: opener.title,
    premise: opener.premise,
    outline: {
      startingCircumstances: opener.premise,
      immediateGoal: opener.actions[0],
      ...(opener.shape ? { storyShape: opener.shape, turningPoint: opener.turningPoint } : {})
    } as DMStoryOutline,
    actions: [...opener.actions],
    inspiration: { ...inspiration, openerId: opener.id },
    storySource: 'opener',
    builtIn: true,
    hero: { name: heroNameFor(category, pronouns, opener.hero.name), roleClass: opener.hero.role, origin: opener.hero.origin, appearance: '' },
    sheet,
    storySheet: sheet,
    typed: [],
    stale: false
  };
}

/** A random hand-written opener from the category, avoiding the one on the sheet now. */
export function randomOpener(category: ExperienceCategory, notId?: string, rand: () => number = Math.random): Opener | undefined {
  const all = getContent(category).openers;
  const pool = all.length > 1 ? all.filter((o) => o.id !== notId) : all;
  return pool[Math.floor(rand() * pool.length)];
}

/**
 * Puts a story package on the sheet. `keep` lists what stays as the player had it (a story
 * edit keeps the name; an opener build-out keeps the opener's hero). The portrait goes when
 * the hero it showed is replaced.
 */
/**
 * The campaign keeps the 1 to 3 titles the writer picked as tone references (master prompt):
 * every play turn sends them, so the story keeps one voice. A rolled story with no picks keeps
 * none, rather than the category's random ones.
 */
export function storyInspiration(base: CampaignInspiration, pkg: StoryPackage & { media?: string[] }, seed?: string): CampaignInspiration {
  if (!pkg.media) return base;
  const { openerId } = base;
  return { media: pkg.media, tropes: seed ? [seed] : [], ...(openerId ? { openerId } : {}) };
}

export function applyPackage(
  prev: SetupDraft | null,
  pkg: StoryPackage & { media?: string[] },
  opts: { category: ExperienceCategory; inspiration: CampaignInspiration; source: StorySource; seed?: string; keepName?: boolean; keepTitle?: boolean }
): SetupDraft {
  const keepName = !!(opts.keepName && prev);
  const keepTitle = !!(opts.keepTitle && prev);
  const sameHero = !!prev && keepName && prev.hero.roleClass === pkg.hero.roleClass && prev.hero.origin === pkg.hero.origin;
  const typed: TypedField[] = prev
    ? prev.typed.filter((f) => (f === 'name' && keepName) || (f === 'title' && keepTitle) || (f === 'story' && opts.source === 'player'))
    : [];
  return {
    category: opts.category,
    title: keepTitle && prev ? prev.title : pkg.title,
    premise: pkg.premise,
    outline: pkg.outline,
    // The story roll has no opening actions (Chapter One writes them); an opener keeps its own.
    actions: pkg.actions.length ? pkg.actions : opts.source === 'opener' && prev ? prev.actions : [],
    inspiration: storyInspiration(opts.inspiration, pkg, opts.seed),
    storySource: opts.source,
    builtIn: false,
    seed: opts.seed,
    hero: { ...pkg.hero, name: keepName && prev ? prev.hero.name : pkg.hero.name },
    portrait: sameHero ? prev?.portrait : undefined,
    sheet: pkg.sheet,
    storySheet: pkg.sheet,
    typed,
    stale: false
  };
}

/**
 * Switching pronouns swaps a name the player didn't type for one that fits (the name always
 * matches the pronouns unless the player chose it themselves).
 */
export function choosePronouns(draft: SetupDraft, pronouns: string): SetupDraft {
  if (draft.typed.includes('name') || nameFitsPronouns(draft.hero.name, pronouns)) return draft;
  return { ...draft, hero: { ...draft.hero, name: heroNameFor(draft.category, pronouns, draft.hero.name) } };
}

/** The player typed in a hero field. */
export function typeHeroField(draft: SetupDraft, field: 'name' | 'roleClass' | 'origin' | 'appearance', value: string): SetupDraft {
  const max = { name: FIELD_LIMITS.heroName, roleClass: FIELD_LIMITS.roleClass, origin: FIELD_LIMITS.raceOrigin, appearance: FIELD_LIMITS.description }[field];
  return { ...draft, hero: { ...draft.hero, [field]: value.slice(0, max) }, typed: withTyped(draft, field) };
}

/**
 * The player's own story, saved from the Edit view. The outline falls back to their words until
 * the AI rebuilds the rest; `stale` stays on until that rebuild succeeds or they keep things as is.
 */
export function applyStoryEdit(draft: SetupDraft, edit: { title: string; premise: string }): SetupDraft {
  const premise = edit.premise.trim().slice(0, FIELD_LIMITS.premise);
  const title = edit.title.trim().slice(0, FIELD_LIMITS.title) || draft.title;
  const storyChanged = premise !== draft.premise.trim();
  const titleChanged = title !== draft.title;
  let typed = draft.typed;
  if (titleChanged && !typed.includes('title')) typed = [...typed, 'title'];
  if (!storyChanged) return { ...draft, title, typed };
  if (!typed.includes('story')) typed = [...typed, 'story'];
  return {
    ...draft,
    title,
    premise,
    outline: { startingCircumstances: premise } as DMStoryOutline,
    // The opener's first scene no longer matches the player's story.
    inspiration: { media: draft.inspiration.media, tropes: draft.inspiration.tropes },
    storySource: 'player',
    builtIn: false,
    seed: undefined,
    typed,
    stale: true
  };
}

/** A rerolled title, name or origin (with looks). */
export function applyHeroPart(
  draft: SetupDraft,
  part: { title?: string; name?: string; origin?: string; appearance?: string }
): SetupDraft {
  const cleared: TypedField[] = [
    ...(part.title !== undefined ? (['title'] as const) : []),
    ...(part.name !== undefined ? (['name'] as const) : []),
    ...(part.origin !== undefined ? (['origin', 'appearance'] as const) : [])
  ];
  return {
    ...draft,
    title: part.title ?? draft.title,
    hero: {
      ...draft.hero,
      ...(part.name !== undefined ? { name: part.name } : {}),
      ...(part.origin !== undefined ? { origin: part.origin, appearance: part.appearance ?? draft.hero.appearance } : {})
    },
    portrait: part.origin !== undefined ? undefined : draft.portrait,
    typed: withoutTyped(draft, cleared)
  };
}

/** A rerolled class comes with the sheet that goes with it. */
export function applyClass(draft: SetupDraft, roleClass: string, sheet: HeroSheetDraft): SetupDraft {
  return {
    ...draft,
    hero: { ...draft.hero, roleClass },
    sheet,
    storySheet: sheet,
    portrait: undefined,
    typed: withoutTyped(draft, ['roleClass', 'sheet'])
  };
}

export function editSheet(draft: SetupDraft, sheet: HeroSheetDraft): SetupDraft {
  return { ...draft, sheet, typed: withTyped(draft, 'sheet') };
}

export function resetSheet(draft: SetupDraft): SetupDraft {
  return { ...draft, sheet: draft.storySheet, typed: withoutTyped(draft, ['sheet']) };
}

/** The player chose to keep the hero and sheet as they are after a story edit. */
export function keepAsIs(draft: SetupDraft): SetupDraft {
  return { ...draft, stale: false };
}

/** The story seed the player clicked leads the campaign's seeds, so it reaches every prompt. */
export function inspirationWithSeed(category: ExperienceCategory, seed: string, base?: CampaignInspiration): CampaignInspiration {
  const insp = base ?? pickInspiration(category);
  return { ...insp, tropes: [seed, ...insp.tropes.filter((t) => t !== seed)].slice(0, 2), openerId: undefined };
}

/** HP and AC follow from the class and scores. */
export function derivedCombat(draft: SetupDraft): { maxHp: number; armorClass: number } {
  return combatStats(draft.hero.roleClass || 'Adventurer', draft.sheet.stats);
}

/** Problems that stop Initialize, by field. */
export function validateDraft(draft: SetupDraft, pronounChoice: PronounChoice, customPronouns: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.hero.name.trim()) errors.name = 'Give your hero a name.';
  if (!draft.hero.roleClass.trim()) errors.role = 'Pick a class.';
  if (!draft.hero.origin.trim()) errors.origin = 'Pick an origin.';
  if (pronounChoice === 'custom' && !customPronouns.trim()) errors.pronouns = 'Type the pronouns to use, or pick one of the options.';
  if (!draft.premise.trim()) errors.premise = 'Write a story or roll one.';
  return errors;
}

/** The hero the campaign starts with. */
export function toCharacterSheet(draft: SetupDraft, opts: { pronouns: string; rulesMode: RulesMode; category: Pick<CategoryInfo, 'defaultCharacter'> }): CharacterSheet {
  const roleClass = draft.hero.roleClass.trim().slice(0, FIELD_LIMITS.roleClass);
  const stats: StatBlock = draft.sheet.stats;
  const { maxHp, armorClass } = combatStats(roleClass || 'Adventurer', stats);
  // The category's starter kit only when the story gave the hero nothing to carry.
  const gear = draft.sheet.gear.map((g) => ({ ...g, name: g.name.trim() })).filter((g) => g.name);
  const kit = splitStartingGold(gear.length ? gear : opts.category.defaultCharacter.inventory || []);
  return {
    id: `char_${uid()}`,
    name: draft.hero.name.trim().slice(0, FIELD_LIMITS.heroName),
    gender: opts.pronouns.slice(0, FIELD_LIMITS.pronouns),
    roleClass,
    raceOrigin: draft.hero.origin.trim().slice(0, FIELD_LIMITS.raceOrigin),
    level: 1,
    hp: maxHp,
    maxHp,
    armorClass,
    initiativeBonus: abilityMod(stats.dex),
    stats,
    inventory: kit.inventory,
    // A class the player typed that doesn't cast spells starts without them.
    spells: castsSpells(roleClass) === false ? [] : draft.sheet.spells,
    proficiencies: draft.sheet.skills,
    ...(opts.rulesMode === 'full5e' ? { xp: 0, gold: kit.gold || 10 } : kit.gold ? { gold: kit.gold } : {}),
    statusEffects: ['Well-Rested'],
    backgroundNotes: '',
    // No stand-in art: a hero without a portrait shows initials (the category hero's art isn't theirs).
    ...(draft.portrait ? { avatarUrl: draft.portrait } : {}),
    physicalDescription: draft.hero.appearance.trim().slice(0, FIELD_LIMITS.description)
  };
}

const pickOther = <T,>(xs: readonly T[], not: T | undefined, rand: () => number): T | undefined => {
  const pool = xs.filter((x) => x !== not);
  const from = pool.length ? pool : xs;
  return from.length ? from[Math.floor(rand() * from.length)] : undefined;
};

/**
 * A title, name, class or origin from the category's built-in lists, for when the AI is off
 * (no key, or Offline mode). The screen says the AI is off, so this is never a silent stand-in.
 */
export function offlinePart(draft: SetupDraft, part: 'title' | 'name' | 'roleClass' | 'origin', pronouns: string, rand: () => number = Math.random): SetupDraft {
  const kit = getContent(draft.category).procedural;
  if (part === 'title') return applyHeroPart(draft, { title: pickOther(kit.titles, draft.title, rand) ?? draft.title });
  if (part === 'name') {
    let name = draft.hero.name;
    for (let i = 0; i < 5 && name === draft.hero.name; i++) name = heroNameFor(draft.category, pronouns);
    return applyHeroPart(draft, { name });
  }
  if (part === 'origin') {
    return applyHeroPart(draft, {
      origin: pickOther(kit.origins, draft.hero.origin, rand) ?? draft.hero.origin,
      appearance: pickOther(kit.physicalTraits, draft.hero.appearance, rand) ?? draft.hero.appearance
    });
  }
  const roleClass = pickOther(kit.roles, draft.hero.roleClass, rand) ?? draft.hero.roleClass;
  return applyClass(draft, roleClass, sheetForRole(roleClass, draft.sheet.gear));
}
