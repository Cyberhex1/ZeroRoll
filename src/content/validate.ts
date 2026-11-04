/**
 * Checks the category content table. Errors fail CI; gaps (fewer openers than the target)
 * are reported until the content pass fills them, and fail too with { strict: true }.
 */
import type { CategoryContent } from './types';
import { OPENERS_PER_CATEGORY } from './types';

export interface ContentReport {
  errors: string[];
  gaps: string[];
}

// Text the turn parser treats as structure; content must never contain it.
const PARSER_TOKENS = /\[(?:STATE_UPDATE|AVATAR_EVOLUTION|COURSE_TRIGGER|CHECK_REQUIRED)|```|\{\{|\}\}|<\/?[a-z]+>/i;

// Words that make an origin a job or rank rather than a people, species or background.
const TITLE_WORDS = /\b(chief|director|officer|ceo|chairman|curator|historian|detective|agent|captain|doctor|dr|professor|manager|executive|heir|heiress|sovereign|knight|lord|lady|king|queen|prince|princess|commander|sergeant|general|priest|priestess|analyst|engineer|lawyer|attorney|nurse|surgeon|scholar|clerk|intern|assistant)\b/i;

const LIMITS = {
  title: [3, 70],
  tagline: [10, 140],
  premise: [80, 700],
  heroName: [2, 40],
  role: [3, 60],
  origin: [3, 60],
  action: [8, 160],
} as const;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function within(errors: string[], where: string, field: keyof typeof LIMITS, value: string): void {
  const [min, max] = LIMITS[field];
  const len = (value || '').trim().length;
  if (len < min || len > max) errors.push(`${where}: ${field} is ${len} characters (allowed ${min} to ${max}).`);
}

function hasKeyword(text: string, keyword: string): boolean {
  // Whole words (plus a plural s/es), so "demon" does not match "demonstration".
  // A trailing * makes it a prefix: "sorcer*" matches sorcerer and sorcery.
  const prefix = keyword.endsWith('*');
  const word = (prefix ? keyword.slice(0, -1) : keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(prefix ? `\\b${word}` : `\\b${word}(?:s|es)?\\b`, 'i').test(text);
}

export function validateContent(
  table: Record<string, CategoryContent>,
  expectedIds: string[],
  opts: { strict?: boolean } = {}
): ContentReport {
  const errors: string[] = [];
  const gaps: string[] = [];

  const keys = Object.keys(table).sort();
  const expected = [...expectedIds].sort();
  if (keys.join() !== expected.join()) {
    errors.push(`Category keys ${keys.join(', ')} do not match the ${expected.length} categories ${expected.join(', ')}.`);
  }

  const seen = { id: new Map<string, string>(), title: new Map<string, string>(), premise: new Map<string, string>(), hero: new Map<string, string>(), media: new Map<string, string>() };
  const claim = (kind: keyof typeof seen, value: string, where: string) => {
    const k = norm(value);
    if (!k) return;
    const prev = seen[kind].get(k);
    if (prev) errors.push(`${where}: ${kind} "${value}" is also used by ${prev}.`);
    else seen[kind].set(k, where);
  };

  for (const [cat, c] of Object.entries(table)) {
    if (!c.card?.name) errors.push(`${cat}: card.name is missing.`);
    if (!c.profile?.voice || !c.profile?.avoid) errors.push(`${cat}: profile needs a voice and an avoid line.`);
    if (!Array.isArray(c.profile?.sensoryMotifs) || c.profile.sensoryMotifs.length < 3) errors.push(`${cat}: profile needs at least 3 sensory motifs.`);
    if (!c.media?.length) errors.push(`${cat}: no media references.`);
    if (!c.tropes?.length) errors.push(`${cat}: no tropes.`);
    if (!c.procedural?.hooks?.length) errors.push(`${cat}: no procedural hooks.`);
    if (!c.starterInventory?.length) errors.push(`${cat}: no starter inventory.`);
    if (!c.ambient?.length) errors.push(`${cat}: no ambient lines.`);

    for (const m of c.media || []) claim('media', m.title, `${cat} media`);

    const count = c.openers?.length || 0;
    if (count < OPENERS_PER_CATEGORY) {
      const msg = `${cat}: ${count} of ${OPENERS_PER_CATEGORY} openers.`;
      (opts.strict ? errors : gaps).push(msg);
    } else if (count > OPENERS_PER_CATEGORY) {
      errors.push(`${cat}: ${count} openers (expected ${OPENERS_PER_CATEGORY}).`);
    }

    for (const o of c.openers || []) {
      const where = `${cat}/${o.id}`;
      if (!/^[a-z0-9_]+$/.test(o.id)) errors.push(`${where}: id must be lower-case letters, digits and underscores.`);
      claim('id', o.id, where);
      claim('title', o.title, where);
      claim('premise', o.premise, where);
      claim('hero', o.hero?.name || '', where);
      within(errors, where, 'title', o.title);
      within(errors, where, 'tagline', o.tagline);
      within(errors, where, 'premise', o.premise);
      within(errors, where, 'heroName', o.hero?.name);
      within(errors, where, 'role', o.hero?.role);
      within(errors, where, 'origin', o.hero?.origin);
      if (TITLE_WORDS.test(o.hero?.origin || '')) errors.push(`${where}: origin "${o.hero?.origin}" reads as a title or job; use a people or background.`);
      if (!Array.isArray(o.actions) || o.actions.length !== 3) errors.push(`${where}: needs exactly 3 actions.`);
      for (const a of o.actions || []) within(errors, where, 'action', a);
      if (!o.gear?.length) errors.push(`${where}: no gear.`);
      if (!Number.isInteger(o.hp) || o.hp < 4 || o.hp > 40) errors.push(`${where}: hp ${o.hp} is outside 4 to 40.`);

      const text = [o.title, o.tagline, o.premise, o.hero?.role, o.hero?.origin, ...(o.actions || []), ...(o.gear || []).map((g) => g.name)].join(' \n ');
      if (PARSER_TOKENS.test(text)) errors.push(`${where}: contains text the turn parser treats as structure.`);
      for (const kw of c.profile?.avoidKeywords || []) {
        if (hasKeyword(text, kw)) errors.push(`${where}: off-profile for ${c.card?.name || cat} (mentions "${kw}").`);
      }
    }
  }
  return { errors, gaps };
}
