/**
 * Everything the Director adds to one play turn (0.2, plan 4.8), all code, no extra calls:
 * the DIRECTOR NOTE and the FRESH LANGUAGE line. Names on hand were dropped (ohnna, 2026-11-26).
 */
import type { Experience } from '../types';
import { getCategoryProfile } from '../content';
import { DirectorNote, directorNote } from './director';
import { freshLanguage } from './language';
import { tokens } from './words';

export interface TurnDirection {
  note: DirectorNote | null;
  language: string;
  /** For turnContextBlock. */
  context: { turn: number };
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
    context: { turn }
  };
}

/** True when a reply leaked the Director's machinery into the story. */
export function leaksDirector(text: string): boolean {
  const t = tokens(text).join(' ');
  return /director note|fresh language|names on hand/.test(t);
}
