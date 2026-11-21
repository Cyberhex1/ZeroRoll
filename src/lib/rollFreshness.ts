/**
 * Keeps AI rolls on the setup screen fresh: remembers what was rolled recently (per
 * category and field) so the prompt can rule it out, bans the names every model reaches
 * for, and adds a random spark so two rolls in a row start from different places.
 */
import type { ExperienceCategory } from '../types';
import { getContent } from '../content';
import { OVERUSED_NAMES } from '../content/names';

const KEY = 'zeroroll_recent_rolls';
const KEEP = 12;

export { OVERUSED_NAMES };

type Field = 'title' | 'heroName' | 'roleClass' | 'raceOrigin' | 'premise';

function readAll(): Record<string, string[]> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function recentRolls(category: ExperienceCategory, field: Field): string[] {
  const list = readAll()[`${category}:${field}`];
  return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
}

export function rememberRoll(category: ExperienceCategory, field: Field, value: string | undefined): void {
  const v = value?.trim();
  if (!v) return;
  const all = readAll();
  const k = `${category}:${field}`;
  all[k] = [v.slice(0, 160), ...(all[k] ?? []).filter((x) => x !== v)].slice(0, KEEP);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: rolls still work, just with less memory.
  }
}

const pick = <T,>(xs: readonly T[]): T | undefined => (xs.length ? xs[Math.floor(Math.random() * xs.length)] : undefined);
const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWYZ';

/** Prompt lines that steer a roll away from repeats and stock names. */
export function freshnessLines(category: ExperienceCategory, fields: Field[]): string[] {
  const lines: string[] = [];
  for (const f of fields) {
    const recent = recentRolls(category, f);
    if (recent.length) lines.push(`Recently rolled ${f} values (do NOT reuse or closely echo any of them): ${recent.map((r) => `"${r}"`).join('; ')}.`);
  }
  if (fields.includes('heroName')) {
    lines.push(`Never use these overused names, as first or last names: ${OVERUSED_NAMES.join(', ')}.`);
    lines.push(`For variety this time, start the hero's first name with the letter ${pick([...LETTERS])}, and draw on a naming tradition that fits the setting rather than a generic fantasy or thriller name.`);
  }
  if (fields.includes('premise')) {
    const c = getContent(category);
    const spark = pick(c.tropes.map((t) => t.premise));
    if (spark) lines.push(`Spark for this roll (twist it into something new; do not copy it): ${spark}`);
  }
  return lines;
}
