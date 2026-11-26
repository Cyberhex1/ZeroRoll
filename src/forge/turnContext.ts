/**
 * Everything the Director adds to one play turn (0.2, plan 4.8), all code, no extra calls:
 * the DIRECTOR NOTE, the FRESH LANGUAGE line and names on hand.
 */
import type { Experience } from '../types';
import { getCategoryProfile } from '../content';
import { DirectorNote, directorNote } from './director';
import { freshLanguage } from './language';
import { namesOnHandFrom, traditionsFor } from './names';
import { tokens } from './words';

export interface TurnDirection {
  note: DirectorNote | null;
  language: string;
  names: string;
  /** For turnContextBlock. */
  context: { turn: number };
}

/** Words already used as names in this campaign (capitalized words in logs, outline and memory). */
function usedNames(exp: Experience): string[] {
  const texts = [
    exp.character?.name ?? '',
    ...(exp.storyOutline?.keyNpcs ?? []).map((n) => n.name),
    ...exp.logs.slice(-40).map((l) => l.text),
    ...(exp.memory?.entries ?? []).map((e) => e.text)
  ];
  const out = new Set<string>();
  for (const t of texts) for (const w of t.match(/\b[A-Z][a-z]{2,}\b/g) ?? []) out.add(w);
  return [...out];
}

/** "New characters, if any, can take names like: A, B, C, D." or '' when the bank has none. */
export function namesOnHand(exp: Experience, rand: () => number = Math.random): string {
  const n = namesOnHandFrom(traditionsFor(exp.category), { exclude: usedNames(exp), given: 3, family: 1, rand });
  const list = [...n.given, ...n.family];
  return list.length ? `New characters, if any, can take names like: ${list.join(', ')}.` : '';
}

/** The DM replies so far, oldest first (referee answers excluded). */
export function dmReplies(exp: Pick<Experience, 'logs'>): string[] {
  return exp.logs.filter((l) => l.sender === 'dm' && l.text).map((l) => l.text);
}

export function turnDirection(exp: Experience, turn: number, opts: { director?: boolean; rand?: () => number } = {}): TurnDirection {
  const profile = getCategoryProfile(exp.category);
  const profileText = [profile.voice, profile.atmosphere, ...profile.sensoryMotifs].join(' \n ');
  const note = opts.director === false ? null : directorNote(exp, turn);
  return {
    note,
    language: freshLanguage(dmReplies(exp), profileText),
    names: namesOnHand(exp, opts.rand),
    context: { turn }
  };
}

/** True when a reply leaked the Director's machinery into the story. */
export function leaksDirector(text: string): boolean {
  const t = tokens(text).join(' ');
  return /director note|fresh language|names on hand/.test(t);
}
