/**
 * FRESH LANGUAGE (0.2, plan 4.8): phrases the game master keeps repeating, found in code.
 * Word 4-grams that appear in 2 or more of the last 4 replies, plus any 5-gram copied verbatim
 * from the category profile or the family palette, plus worn tic words used twice or more.
 */
import { STOPWORDS, ngrams, tokens } from './words';

/** Worn words the game master leans on; one use is fine, two is a habit. */
export const TIC_WORDS = ['ledger', 'rhythmic', 'ozone', 'hum', 'humming', 'trembling', 'tapestry', 'testament', 'palpable', 'whispers of', 'a sense of', 'sweaty palm'];

export const LANGUAGE_WINDOW = 4;
export const LANGUAGE_MAX = 6;

const allStop = (gram: string) => gram.split(' ').every((w) => STOPWORDS.has(w) || w.length <= 2);

/** Longest first, at most LANGUAGE_MAX; one entry per overlapping run (a longer phrase swallows its parts). */
export function repeatedPhrases(replies: readonly string[], profileText = ''): string[] {
  const recentReplies = replies.slice(-LANGUAGE_WINDOW);
  const counts = new Map<string, number>();
  for (const r of recentReplies) for (const g of new Set(ngrams(r, 4))) if (!allStop(g)) counts.set(g, (counts.get(g) ?? 0) + 1);
  const repeated = [...counts].filter(([, n]) => n >= 2).map(([g]) => g);

  const profileGrams = new Set(ngrams(profileText, 5).filter((g) => !allStop(g)));
  const copied = new Set<string>();
  if (profileGrams.size) for (const r of recentReplies) for (const g of ngrams(r, 5)) if (profileGrams.has(g)) copied.add(g);

  // Merge overlapping 4-grams into longer phrases where they chain ("a b c d" + "b c d e").
  const merged: string[] = [];
  const pool = [...new Set([...copied, ...repeated])].sort((a, b) => b.length - a.length);
  for (const g of pool) {
    if (merged.some((m) => m.includes(g))) continue;
    merged.push(g);
  }
  return merged.sort((a, b) => b.length - a.length).slice(0, LANGUAGE_MAX);
}

/** Tic words (and their forms: hums, humming, rhythmically) used twice or more across the recent replies. Counted in code, never listed in the prompt unless repeated. */
export const TIC_REPEAT = 2;
export function overusedTics(replies: readonly string[]): string[] {
  const text = replies.slice(-LANGUAGE_WINDOW).join(' \n ').toLowerCase();
  return TIC_WORDS.filter((w) => (text.match(new RegExp(`\\b${w.replace(/\s+/g, '\\s+')}(s|es|ed|ing|ming|ally)?\\b`, 'g')) ?? []).length >= TIC_REPEAT);
}

/** The FRESH LANGUAGE line for this turn, or '' when nothing repeats. */
export function freshLanguage(replies: readonly string[], profileText = ''): string {
  const phrases = repeatedPhrases(replies, profileText);
  const tics = overusedTics(replies).filter((t) => !phrases.some((p) => p.includes(t)));
  const items = [...phrases, ...tics].slice(0, LANGUAGE_MAX + 2);
  if (!items.length) return '';
  return `FRESH LANGUAGE: you have used these a lot lately; find new words: ${items.map((x) => `"${x}"`).join(', ')}.`;
}

/** Count of 4-grams shared by 2+ of the replies, per reply (the turn eval's repetition rate). */
export function repetitionRate(replies: readonly string[]): number {
  if (replies.length < 2) return 0;
  const counts = new Map<string, number>();
  for (const r of replies) for (const g of new Set(ngrams(r, 4))) if (!allStop(g)) counts.set(g, (counts.get(g) ?? 0) + 1);
  const total = replies.reduce((n, r) => n + Math.max(0, tokens(r).length - 3), 0);
  const rep = [...counts.values()].filter((n) => n >= 2).reduce((a, n) => a + n, 0);
  return total ? rep / total : 0;
}
