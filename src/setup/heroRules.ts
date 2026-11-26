/**
 * Who the hero is, per category: shared by the story roll and the class/origin rerolls, so a
 * reroll keeps the fit. ohnna, 2026-11-26: keep it short and category-specific. Long rules and
 * one-genre examples box the AI in; the examples here only show the kind of answer we mean.
 *
 * Only the D&D category plays by full 5e; every other category uses narrative dice, so its
 * sheet is described in plain words rather than D&D terms.
 */
import type { ExperienceCategory } from '../types';
import { SKILLS } from '../dnd/rules';
import { POINT_BUY_BUDGET } from './pointBuy';

const SKILL_LIST = Object.keys(SKILLS).join(', ');

/** Example classes and origins for each category: a few, so the model sees the kind of answer. */
const HERO_EXAMPLES: Record<ExperienceCategory, { classes: string[]; origins: string[] }> = {
  dnd: { classes: ['Rogue', 'Cleric of the Dawn', 'Battle Master Fighter', 'Wild Magic Sorcerer'], origins: ['Tiefling from a port city', 'Wood Elf', 'Hill Dwarf', 'Half-Orc raised by monks'] },
  fantasy: { classes: ['Hedge Witch', 'Royal Cartographer', 'Knight Errant', 'Dragon Hunter'], origins: ['Half-elf of the river towns', 'Mountain-clan dwarf', 'Human from the capital'] },
  adventure: { classes: ['Ship\'s Rigger', 'Treasure Diver', 'Smuggler Pilot', 'Relic Hunter'], origins: ['Harbor-born human', 'Spacer from the outer stations', 'Island trader\'s child'] },
  historical_adventure: { classes: ['Silk Road Interpreter', 'Ronin', 'Pony Express Rider', 'Shield-Maiden'], origins: ['Venetian merchant family', 'Norse farmstead', 'Osaka-born'] },
  horror: { classes: ['Night-Shift Nurse', 'Podcast Host', 'New Sheriff\'s Deputy', 'Estate Cleaner'], origins: ['Local who never left', 'City transplant', 'Grew up in foster care'] },
  cozy_ghibli: { classes: ['Apprentice Witch', 'Tea Shop Owner', 'Mail Courier', 'Lighthouse Keeper'], origins: ['Hill-village local', 'City kid sent to the country', 'Raised by a forest spirit'] },
  romantic: { classes: ['Wedding Planner', 'Pastry Chef', 'Court Musician', 'Rival Architect'], origins: ['Small-town local', 'Old-money family', 'New in the city'] },
  revenge: { classes: ['Disinherited Heir', 'Framed Accountant', 'Retired Bodyguard', 'Exiled Captain'], origins: ['Raised in the family firm', 'Orphan of the docks', 'Former palace ward'] },
  apocalypse: { classes: ['Water Trader', 'Convoy Mechanic', 'Settlement Medic', 'Salvage Diver'], origins: ['Born after the fall', 'Bunker-raised', 'From the old coast cities'] },
  zombie: { classes: ['Paramedic', 'High School Teacher', 'Delivery Driver', 'Mall Security Guard'], origins: ['Suburban local', 'Rural farm family', 'Visiting for a funeral'] },
  cosmic_horror: { classes: ['Marine Geologist', 'Antiquarian Bookseller', 'Radio Astronomer', 'Insurance Investigator'], origins: ['Coastal-town native', 'Academic from the city', 'Child of missionaries'] },
  psychedelic_trip: { classes: ['Session Musician', 'Dream Researcher', 'Festival Medic', 'Night-Bus Driver'], origins: ['Desert-town kid', 'City insomniac', 'Raised on a commune'] },
  tiktok_drama: { classes: ['Secret Heiress', 'Overworked Assistant', 'Contract Spouse', 'Fired Intern'], origins: ['Swapped at birth', 'Scholarship kid', 'Poor side of the family'] },
  ancient_greek: { classes: ['Temple Scribe', 'Hoplite', 'Oracle\'s Attendant', 'Olympic Runner'], origins: ['Athenian citizen', 'Corinthian potter\'s child', 'Demigod raised in Thebes'] },
  mythology: { classes: ['Skald', 'Tomb Painter', 'Shrine Keeper', 'River Ferryman'], origins: ['Norse farmstead', 'West-bank Theban', 'Child of a river god'] },
  real_life: { classes: ['Line Cook', 'Junior Paralegal', 'Wedding DJ', 'Night-Shift Nurse'], origins: ['Grew up in Queens', 'Small-town Ohio', 'First-generation Korean American'] }
};

/** Categories whose stories have no magic or powers, so the hero never has spells. */
const NO_POWERS: ReadonlySet<ExperienceCategory> = new Set(['real_life', 'zombie', 'apocalypse', 'historical_adventure', 'revenge', 'tiktok_drama', 'romantic']);

const quoted = (xs: string[]) => xs.map((x) => `"${x}"`).join(', ');

export function classRule(category: ExperienceCategory): string {
  const ex = quoted(HERO_EXAMPLES[category].classes);
  return category === 'dnd'
    ? `their D&D class, with a subclass or flavour if you like (e.g. ${ex}).`
    : `who the hero is when the story starts, in a few words: their job, calling or place in life (e.g. ${ex}).`;
}

export function originRule(category: ExperienceCategory): string {
  const ex = quoted(HERO_EXAMPLES[category].origins);
  return category === 'dnd'
    ? `their D&D race and where they come from (e.g. ${ex}).`
    : `where the hero comes from or what people they belong to, never a job (e.g. ${ex}).`;
}

/** The hero sheet: full 5e for the D&D category, narrative dice for every other one. */
export function sheetRules(category: ExperienceCategory): string {
  const abilities = `abilityScores: every score from 8 to 15, total cost at most ${POINT_BUY_BUDGET} (8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9)`;
  if (category === 'dnd') {
    return `HERO SHEET (D&D 5e, level 1):
- ${abilities} (5e point buy).
- skills: 4 proficient skills from: ${SKILL_LIST}.
- gear: 4 to 6 items of this class's starting kit, named for this hero (type is weapon, armor, potion, scroll, relic or misc).
- spells: real 5e cantrips and level-1 spells for a spellcasting class, 1 to 4; an empty list for a class that doesn't cast.`;
  }
  return `HERO SHEET (the game rolls a d20 plus an ability modifier for checks):
- ${abilities}.
- skills: 4 the hero is good at, from: ${SKILL_LIST}.
- gear: 4 to 6 things this hero carries when the story starts (type is weapon, armor, potion, scroll, relic or misc).
- spells: ${NO_POWERS.has(category) ? 'an empty list.' : 'only if this hero has magic or powers in this story, 1 to 4; otherwise an empty list.'}
The class, origin, scores, skills and gear should all fit the hero the story describes.`;
}

export const SHEET_EXAMPLE = `"sheet": {
    "abilityScores": { "str": 8, "dex": 15, "con": 13, "int": 12, "wis": 14, "cha": 10 },
    "skills": ["…", "…", "…", "…"],
    "gear": [{ "name": "…", "type": "misc", "quantity": 1, "equipped": true, "description": "…" }],
    "spells": []
  }`;
