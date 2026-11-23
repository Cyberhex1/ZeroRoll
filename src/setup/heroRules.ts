/**
 * Who the hero is: shared by the story build and the class/origin rerolls, so a reroll keeps
 * the fit (ohnna, 2026-11-21). 0.2: the examples come from many genres; before, every example
 * was the Revenge bookkeeper, and every genre's rolls copied it.
 */
import { SKILLS } from '../dnd/rules';
import { POINT_BUY_BUDGET } from './pointBuy';

const SKILL_LIST = Object.keys(SKILLS).join(', ');

export const CLASS_RULE =
  'roleClass: who the hero is when the story starts, in two to four words: their job, calling or place in life, exactly as the premise describes them (e.g. "Tomb Painter", "Wedding DJ", "Ferry Witch", "Hotel Heiress", "Battle Mage"). Use an adventurer archetype (rogue, ranger, paladin, warlock) only when the premise makes them one: a tomb painter is a tomb painter, not a rogue.';

export const ORIGIN_RULE =
  'origin: where the hero comes from or what people they belong to (e.g. "Harbor-born human", "West-bank Theban", "Half-elf of the Marches"). Never a job or rank: "tomb painter", "DJ", "sailor" and "captain" are jobs. It must agree with the premise; don\'t give them a past the premise contradicts.';

export const HERO_FIT =
  'HERO FIT: before you reply, read only the premise and check the hero against it. Someone who knows nothing else should recognise this class, origin, ability scores and gear as the person the premise describes. If anything clashes, change the hero, not the premise.';

export const SHEET_RULES = `HERO SHEET (D&D 5e, level 1). It must make sense for this hero in this story:
- abilityScores: 5e point buy. Every score from 8 to 15, total cost at most ${POINT_BUY_BUDGET} (8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9). Put the high scores where this hero's life and this story need them.
- skills: exactly 4, chosen from: ${SKILL_LIST}. Pick the ones this hero would really have learned.
- abilityScores and skills follow from the life the hero has lived so far, not from an adventurer template.
- gear: 4 to 6 things this person carries in the first scene of this story, named for this story (type is weapon, armor, potion, scroll, relic or misc). A tomb painter carries brushes, pigments and a lamp, not a hidden blade. Give weapons or armor only when their life gives them a reason (a soldier, guard, thief, hunter or duelist, or a setting where everyone goes armed). No generic filler like "Adventurer Tool".
- spells: only for a hero whose class really casts spells or wields supernatural power in this setting (a wizard, a priestess, a witch): 1 to 4, in the genre's own flavour. Everyone else (fighters, thieves, scouts, soldiers, nurses, detectives, nobles, ordinary people) gets an empty list. Don't invent powers or "abilities" to fill it.`;

export const SHEET_EXAMPLE = `"sheet": {
    "abilityScores": { "str": 8, "dex": 15, "con": 13, "int": 12, "wis": 14, "cha": 10 },
    "skills": ["stealth", "perception", "insight", "sleight of hand"],
    "gear": [{ "name": "…", "type": "misc", "quantity": 1, "equipped": true, "description": "…" }],
    "spells": []
  }`;
