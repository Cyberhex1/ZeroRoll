/**
 * Names in code, not banned-name lists (plan 4.5). A roll's story family maps to one to three
 * naming traditions; the hero and any NPC with a stock name get a name from them.
 */
import type { DMStoryOutline } from '../types';
import { NAME_TRADITIONS, NameTradition, TraditionId, traditionsFor } from '../content/forge/names';
import { OVERUSED_NAMES, givenName, isFreshName, nameFitsPronouns, pronounGender } from '../content/names';
import { escapeRegex } from './words';

export { traditionsFor };
export type { TraditionId };

function pool(traditions: readonly TraditionId[], pick: (t: NameTradition) => string[]): string[] {
  return [...new Set(traditions.flatMap((t) => pick((NAME_TRADITIONS as Record<string, NameTradition>)[t] ?? { feminine: [], masculine: [], neutral: [], family: [] })))].filter((n) => n && isFreshName(n));
}

/** Given names that suit the pronouns (feminine or masculine plus neutral; all three for they/them). */
export function givenPool(traditions: readonly TraditionId[], pronouns?: string): string[] {
  const g = pronounGender(pronouns);
  return pool(traditions, (t) => (g === 'she' ? [...t.feminine, ...t.neutral] : g === 'he' ? [...t.masculine, ...t.neutral] : [...t.neutral, ...t.feminine, ...t.masculine]));
}

export function familyPool(traditions: readonly TraditionId[]): string[] {
  return pool(traditions, (t) => t.family);
}

function sample<T>(xs: readonly T[], n: number, rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

const lower = (xs: Iterable<string>) => new Set([...xs].map((x) => x.toLowerCase()));

/** Names on hand for a prompt: given names (pronoun-fit plus neutral) and family names, none recently used. */
export function namesOnHandFrom(
  traditions: readonly TraditionId[],
  opts: { pronouns?: string; exclude?: Iterable<string>; given?: number; family?: number; rand?: () => number } = {}
): { given: string[]; family: string[] } {
  const rand = opts.rand ?? Math.random;
  const ex = lower(opts.exclude ?? []);
  const given = givenPool(traditions, opts.pronouns).filter((n) => !ex.has(n.toLowerCase()));
  const family = familyPool(traditions).filter((n) => !ex.has(n.toLowerCase()));
  return { given: sample(given, opts.given ?? 4, rand), family: sample(family, opts.family ?? 3, rand) };
}

/** A full name from the traditions that fits the pronouns, or undefined when the bank has nothing. */
export function bankName(traditions: readonly TraditionId[], pronouns: string | undefined, exclude: Iterable<string>, rand: () => number = Math.random): string | undefined {
  const ex = lower(exclude);
  const firsts = givenPool(traditions, pronouns).filter((n) => !ex.has(n.toLowerCase()) && nameFitsPronouns(n, pronouns));
  const lasts = familyPool(traditions).filter((n) => !ex.has(n.toLowerCase()));
  if (!firsts.length) return undefined;
  const first = firsts[Math.floor(rand() * firsts.length)];
  const last = lasts.length ? lasts[Math.floor(rand() * lasts.length)] : '';
  return `${first} ${last}`.trim();
}

/** "she", "he" or undefined, read from a name's given part (for keeping an NPC's gender cue). */
function genderCue(name: string): string | undefined {
  if (!nameFitsPronouns(name, 'he/him')) return 'she/her';
  if (!nameFitsPronouns(name, 'she/her')) return 'he/him';
  return undefined;
}

/** Replaces `from` with `to` as whole words in a string (a full name, then the given name alone). */
function swapName(text: string, from: string, to: string): string {
  if (!text || !from || from === to) return text;
  let out = text.replace(new RegExp(`\\b${escapeRegex(from)}\\b`, 'g'), to);
  const fromFirst = givenName(from);
  const toFirst = givenName(to);
  if (fromFirst && toFirst && fromFirst !== from) out = out.replace(new RegExp(`\\b${escapeRegex(fromFirst)}\\b`, 'g'), toFirst);
  const fromLast = from.split(/\s+/).slice(1).join(' ');
  const toLast = to.split(/\s+/).slice(1).join(' ');
  if (fromLast && toLast && !isFreshName(fromLast)) out = out.replace(new RegExp(`\\b${escapeRegex(fromLast)}\\b`, 'g'), toLast);
  return out;
}

function mapOutline(o: DMStoryOutline, f: (s: string) => string): DMStoryOutline {
  const list = (xs?: string[]) => (Array.isArray(xs) ? xs.map(f) : xs);
  return {
    ...o,
    startingCircumstances: f(o.startingCircumstances ?? ''),
    backstory: f(o.backstory ?? ''),
    incitingIncident: f(o.incitingIncident ?? ''),
    immediateGoal: f(o.immediateGoal ?? ''),
    keyNpcs: (o.keyNpcs ?? []).map((n) => ({ ...n, name: f(n.name), role: f(n.role), motivation: f(n.motivation), ...(n.secret ? { secret: f(n.secret) } : {}), ...(n.move ? { move: f(n.move) } : {}) })),
    majorConflicts: list(o.majorConflicts) ?? [],
    secretsAndReveals: list(o.secretsAndReveals) ?? [],
    chapters: list(o.chapters) ?? [],
    potentialEndings: list(o.potentialEndings) ?? [],
    ...(o.turningPoint ? { turningPoint: f(o.turningPoint) } : {}),
    ...(o.fronts ? { fronts: o.fronts.map((fr) => ({ name: f(fr.name), agenda: f(fr.agenda), portents: fr.portents.map(f) })) } : {}),
    ...(o.setPieces ? { setPieces: o.setPieces.map(f) } : {})
  };
}

export interface NamedPackage {
  title: string;
  premise: string;
  outline: DMStoryOutline;
  actions: string[];
  heroName: string;
}

/**
 * Any key NPC whose name is a stock name gets one from the bank, replaced everywhere it appears
 * (premise, title, outline, opening moves). Keeps the old name's gender cue where it has one.
 * Returns the input unchanged when the bank has no names for these traditions.
 */
export function fixNpcNames(pkg: NamedPackage, traditions: readonly TraditionId[], rand: () => number = Math.random): NamedPackage & { renamed: Array<[string, string]> } {
  const renamed: Array<[string, string]> = [];
  const used = new Set<string>([...pkg.heroName.split(/\s+/), ...(pkg.outline.keyNpcs ?? []).flatMap((n) => n.name.split(/\s+/)), ...OVERUSED_NAMES]);
  for (const npc of pkg.outline.keyNpcs ?? []) {
    if (isFreshName(npc.name)) continue;
    const next = bankName(traditions, genderCue(npc.name), used, rand);
    if (!next) continue;
    // Keep a title ("Captain", "Lady") in front of the new name.
    const title = npc.name.match(/^((?:dr|doctor|captain|lady|lord|sir|madam|mother|father|brother|sister|old)\.?\s+)/i)?.[1] ?? '';
    const bare = title ? npc.name.slice(title.length) : npc.name;
    const to = bare.split(/\s+/).length === 1 ? givenName(next) : next;
    renamed.push([bare, to]);
    for (const part of to.split(/\s+/)) used.add(part);
  }
  if (!renamed.length) return { ...pkg, renamed };
  const f = (s: string) => renamed.reduce((acc, [from, to]) => swapName(acc, from, to), s);
  return { title: f(pkg.title), premise: f(pkg.premise), outline: mapOutline(pkg.outline, f), actions: pkg.actions.map(f), heroName: pkg.heroName, renamed };
}
