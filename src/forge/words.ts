/**
 * Small word helpers shared by the gate, the pitch picker and the fresh-language check.
 * All pure and deterministic.
 */

export const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by can
could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i
if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own
same she should so some such than that the their theirs them themselves then there these they this those through to too under until
up very was we were what when where which while who whom why will with would you your yours yourself yourselves one two three
every still yet ever even much many way into onto upon them its it's you're you've you'll don't can't won't isn't`.split(/\s+/)
);

/** Lower-case words, apostrophes kept inside words, everything else split. */
export function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+(?:['’][a-z]+)?/g) ?? []).map((w) => w.replace(/’/g, "'"));
}

/** Content words: 5+ letters (or minLen), not stopwords. */
export function contentWords(text: string, minLen = 5): Set<string> {
  return new Set(tokens(text).filter((w) => w.length >= minLen && !STOPWORDS.has(w)));
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}

/** Jaccard on content words (4+ letters) of two texts. */
export function overlap(a: string, b: string): number {
  return jaccard(contentWords(a, 4), contentWords(b, 4));
}

export function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?…])["”’)]*\s+(?=["“‘(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function wordCount(text: string): number {
  return tokens(text).length;
}

/** The first three words, lower-case, for "samey opening" checks. */
export function firstWords(text: string, n = 3): string {
  return tokens(text).slice(0, n).join(' ');
}

/** Word n-grams (lower-case, punctuation dropped). */
export function ngrams(text: string, n: number): string[] {
  const t = tokens(text);
  const out: string[] = [];
  for (let i = 0; i + n <= t.length; i++) out.push(t.slice(i, i + n).join(' '));
  return out;
}

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
