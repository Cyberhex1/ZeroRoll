/**
 * The D&D rules, with the campaign's rules mode as a parameter:
 *   full5e     proficiency on trained skills, advantage, XP and levels, death saves at 0 HP
 *   narrative  d20 plus the ability modifier against a DC, HP and conditions, nothing else
 * Every roll, check outcome and level-up in the D&D mode goes through here.
 */
import type { CharacterSheet, DiceRollResult, StatBlock } from '../types';

export type RulesMode = 'full5e' | 'narrative';
export type Ability = keyof StatBlock;

export const RULES_MODES: Record<RulesMode, { name: string; blurb: string }> = {
  full5e: { name: 'Full 5e', blurb: 'Proficiency, advantage, XP and levels, death saves at 0 HP.' },
  narrative: { name: 'Narrative dice', blurb: 'A d20 plus your ability modifier against a DC. HP and conditions, nothing else.' }
};

export const ABILITIES: Ability[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const abilityMod = (score: number) => Math.floor(((Number.isFinite(score) ? score : 10) - 10) / 2);
export const fmtMod = (m: number) => (m >= 0 ? `+${m}` : String(m));

/** 5e proficiency bonus by level. */
export const proficiencyBonus = (level: number) => 2 + Math.floor((Math.max(1, Math.min(20, level)) - 1) / 4);

/** XP needed to reach each level (index = level). */
export const XP_FOR_LEVEL = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export function levelForXp(xp: number): number {
  let level = 1;
  for (let l = 2; l <= 20; l++) if (xp >= XP_FOR_LEVEL[l]) level = l;
  return level;
}

/** The 18 skills and the ability each uses. */
export const SKILLS: Record<string, Ability> = {
  acrobatics: 'dex', 'animal handling': 'wis', arcana: 'int', athletics: 'str', deception: 'cha', history: 'int',
  insight: 'wis', intimidation: 'cha', investigation: 'int', medicine: 'wis', nature: 'int', perception: 'wis',
  performance: 'cha', persuasion: 'cha', religion: 'int', 'sleight of hand': 'dex', stealth: 'dex', survival: 'wis'
};

const ABILITY_WORDS: Array<[RegExp, Ability]> = [
  [/\bstr(ength)?\b/, 'str'],
  [/\bdex(terity)?\b|dodge|reflex/, 'dex'],
  [/\bcon(stitution)?\b|endur|poison/, 'con'],
  [/\bint(elligence)?\b/, 'int'],
  [/\bwis(dom)?\b/, 'wis'],
  [/\bcha(risma)?\b/, 'cha']
];

/** The ability a check uses: the stated one if valid, else the skill's, else Wisdom. */
export function abilityForCheck(skill: string, stated?: string): Ability {
  const s = (stated ?? '').toLowerCase().trim().slice(0, 3) as Ability;
  if (ABILITIES.includes(s)) return s;
  const k = skill.toLowerCase();
  for (const [name, ab] of Object.entries(SKILLS)) if (k.includes(name)) return ab;
  for (const [re, ab] of ABILITY_WORDS) if (re.test(k)) return ab;
  return 'wis';
}

/** The skill named in a check, if it is one of the 18. */
export function skillOf(check: string): string | undefined {
  const k = check.toLowerCase();
  return Object.keys(SKILLS).find((name) => k.includes(name));
}

/** Skills a role is trained in, from keywords in its name. Used for Full 5e proficiency. */
const ROLE_SKILLS: Array<[RegExp, string[]]> = [
  [/rogue|thief|assassin|scout|spy|burglar|smuggler/, ['stealth', 'sleight of hand', 'acrobatics', 'deception', 'perception']],
  [/ranger|hunter|tracker|druid|warden/, ['survival', 'nature', 'perception', 'animal handling', 'stealth']],
  [/wizard|mage|sorcer|scholar|alchem|witch|warlock|hacker|scientist/, ['arcana', 'history', 'investigation', 'insight']],
  [/monk|kensei|martial artist|ninja/, ['acrobatics', 'athletics', 'stealth', 'insight']],
  [/cleric|priest|paladin|healer|oracle|shaman/, ['religion', 'medicine', 'insight', 'persuasion']],
  [/bard|noble|diplomat|heir|heiress|performer|influencer|merchant|courtier/, ['persuasion', 'performance', 'deception', 'insight']],
  [/fighter|warrior|knight|soldier|barbarian|gladiator|hoplite|mercenary|guard|brawler/, ['athletics', 'intimidation', 'perception', 'survival']],
  [/detective|investigator|journalist|inspector|agent/, ['investigation', 'insight', 'perception', 'persuasion']],
  [/doctor|nurse|medic/, ['medicine', 'insight', 'investigation']]
];

export function defaultProficiencies(roleClass: string): string[] {
  const r = roleClass.toLowerCase();
  const hit = ROLE_SKILLS.find(([re]) => re.test(r));
  return hit ? hit[1] : ['perception', 'insight', 'athletics'];
}

export function proficienciesOf(c: Pick<CharacterSheet, 'roleClass'> & { proficiencies?: string[] }): string[] {
  return c.proficiencies?.length ? c.proficiencies : defaultProficiencies(c.roleClass || '');
}

export interface CheckPlan {
  ability: Ability;
  modifier: number;
  proficient: boolean;
  /** "1d20+5" or "2d20kh1+5" with advantage. */
  formula: string;
  /** What makes up the modifier, for the roll screen. */
  breakdown: string;
}

/** How a check is rolled for this hero under the campaign's rules. */
export function planCheck(c: CharacterSheet, skill: string, statedAbility: string | undefined, mode: RulesMode, roll: 'normal' | 'advantage' | 'disadvantage' = 'normal'): CheckPlan {
  const ability = abilityForCheck(skill, statedAbility);
  const base = abilityMod(c.stats?.[ability] ?? 10);
  const sk = skillOf(skill);
  const proficient = mode === 'full5e' && !!sk && proficienciesOf(c).includes(sk);
  const prof = proficient ? proficiencyBonus(c.level || 1) : 0;
  const modifier = base + prof;
  const dice = mode === 'full5e' && roll !== 'normal' ? `2d20${roll === 'advantage' ? 'kh1' : 'kl1'}` : '1d20';
  const breakdown = `${ability.toUpperCase()} ${fmtMod(base)}${proficient ? `, proficiency ${fmtMod(prof)}` : ''}`;
  return { ability, modifier, proficient, formula: `${dice}${modifier ? fmtMod(modifier) : ''}`, breakdown };
}

/**
 * One outcome for an ability check, the same everywhere (S22). A natural 20 or 1 is noted,
 * but in 5e ability checks do not succeed or fail automatically on it.
 */
export function checkOutcome(total: number, dc: number, natural?: number): { success: boolean; text: string } {
  const success = total >= dc;
  const nat = natural === 20 ? ', natural 20' : natural === 1 ? ', natural 1' : '';
  return { success, text: `${success ? 'SUCCESS' : 'FAILURE'} (${total} vs DC ${dc}${nat})` };
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

/**
 * One death saving throw (Full 5e, at 0 HP): 10 or more succeeds, a natural 1 counts as two
 * failures, a natural 20 brings the hero back with 1 HP. Three successes stabilize, three
 * failures and the hero dies.
 */
export function deathSave(saves: DeathSaves, natural: number): { saves: DeathSaves; result: 'revived' | 'stable' | 'dead' | 'continue'; text: string } {
  if (natural === 20) return { saves: { successes: 0, failures: 0 }, result: 'revived', text: 'Natural 20 on the death save: the hero wakes with 1 HP.' };
  const next = { ...saves };
  if (natural >= 10) next.successes++;
  else next.failures += natural === 1 ? 2 : 1;
  if (next.failures >= 3) return { saves: next, result: 'dead', text: `Death save ${natural}: a third failure. The hero dies.` };
  if (next.successes >= 3) return { saves: { successes: 0, failures: 0 }, result: 'stable', text: `Death save ${natural}: a third success. The hero is stable at 0 HP.` };
  return { saves: next, result: 'continue', text: `Death save ${natural}: ${natural >= 10 ? 'success' : natural === 1 ? 'two failures' : 'failure'} (${next.successes} successes, ${next.failures} failures).` };
}

/** Average hit points gained per level, by role. */
export function hitDie(roleClass: string): number {
  const r = roleClass.toLowerCase();
  if (/barbarian|berserk/.test(r)) return 12;
  if (/fighter|warrior|knight|paladin|ranger|soldier|gladiator|hoplite|mercenary|guard/.test(r)) return 10;
  if (/wizard|mage|sorcer|scholar|hacker|scientist|influencer/.test(r)) return 6;
  return 8;
}

/** Applies XP under Full 5e: level, max HP and current HP rise with each level gained. */
export function gainXp(c: CharacterSheet & { xp?: number }, amount: number): { character: CharacterSheet & { xp?: number }; levelsGained: number } {
  const xp = Math.max(0, (c.xp ?? XP_FOR_LEVEL[c.level || 1] ?? 0) + amount);
  const level = Math.max(c.level || 1, levelForXp(xp));
  const levelsGained = level - (c.level || 1);
  const perLevel = Math.max(1, Math.floor(hitDie(c.roleClass || '') / 2) + 1 + abilityMod(c.stats?.con ?? 10));
  return {
    character: { ...c, xp, level, maxHp: c.maxHp + perLevel * levelsGained, hp: c.hp + perLevel * levelsGained },
    levelsGained
  };
}

/** One line for the prompt, so the model knows which rules are in force. */
export function rulesLine(mode: RulesMode): string {
  return mode === 'full5e'
    ? 'RULES: Full 5e. Call checks with the skill and DC; the app adds proficiency and handles advantage. Award XP with XP_GAINED in STATE_UPDATE. At 0 HP the hero makes death saves; do not kill or revive them yourself.'
    : 'RULES: Narrative dice. Checks are a d20 plus the ability modifier against a DC. Track only HP and conditions; do not mention XP, levels, proficiency or armour class.';
}

/** Stats, HP and spells that suit a role, for heroes made at setup (PS8, PS9). */
export function roleTemplate(roleClass: string, conScore?: number): { stats: StatBlock; maxHp: number; spells: string[]; armorClass: number } {
  const r = roleClass.toLowerCase();
  // Standard array, placed by the role's priorities.
  const arr = [15, 14, 13, 12, 10, 8];
  const order: Ability[] = /rogue|thief|assassin|scout|ranger|hunter|monk|acrobat|spy/.test(r)
    ? ['dex', 'wis', 'con', 'int', 'cha', 'str']
    : /wizard|mage|scholar|alchem|hacker|scientist|detective|investigator|inspector/.test(r)
      ? ['int', 'dex', 'con', 'wis', 'cha', 'str']
      : /cleric|priest|druid|healer|oracle|shaman|doctor|nurse|medic/.test(r)
        ? ['wis', 'con', 'str', 'int', 'cha', 'dex']
        : /bard|sorcer|warlock|witch|noble|diplomat|heir|performer|influencer|courtier|merchant/.test(r)
          ? ['cha', 'dex', 'con', 'wis', 'int', 'str']
          : /paladin|knight/.test(r)
            ? ['str', 'cha', 'con', 'wis', 'dex', 'int']
            : ['str', 'con', 'dex', 'wis', 'cha', 'int'];
  const stats = Object.fromEntries(order.map((a, i) => [a, arr[i]])) as unknown as StatBlock;
  const con = conScore ?? stats.con;
  const maxHp = Math.max(6, hitDie(roleClass) + abilityMod(con));
  const spells = /wizard|mage|sorcer/.test(r)
    ? ['Magic Missile', 'Shield', 'Mage Hand']
    : /cleric|priest|healer|oracle/.test(r)
      ? ['Cure Wounds', 'Guiding Bolt', 'Light']
      : /druid|shaman/.test(r)
        ? ['Entangle', 'Healing Word', 'Druidcraft']
        : /warlock|witch/.test(r)
          ? ['Eldritch Blast', 'Hex']
          : /bard/.test(r)
            ? ['Vicious Mockery', 'Healing Word', 'Charm Person']
            : /paladin/.test(r)
              ? ['Bless', 'Divine Smite']
              : [];
  const armorClass = 10 + abilityMod(stats.dex) + (/fighter|warrior|knight|paladin|soldier|hoplite|guard/.test(r) ? 6 : /cleric|ranger|barbarian|mercenary/.test(r) ? 3 : 1);
  return { stats, maxHp, spells, armorClass };
}

/** Rolls a planned check; with advantage or disadvantage (Full 5e) the better or worse d20 counts. */
export function rollPlan(plan: CheckPlan, reason: string, roll: 'normal' | 'advantage' | 'disadvantage' = 'normal', rand: () => number = Math.random): DiceRollResult {
  const d = () => Math.floor(rand() * 20) + 1;
  const rolls = roll === 'normal' ? [d()] : [d(), d()];
  const kept = roll === 'advantage' ? Math.max(...rolls) : roll === 'disadvantage' ? Math.min(...rolls) : rolls[0];
  return {
    formula: plan.formula,
    rolls,
    modifier: plan.modifier,
    total: kept + plan.modifier,
    isNat20: kept === 20,
    isNat1: kept === 1,
    reason
  };
}

/** The d20 that counted in a roll. */
export const naturalOf = (r: DiceRollResult) => r.total - r.modifier;
