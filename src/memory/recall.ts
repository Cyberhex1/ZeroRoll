/**
 * Memory recall (Phase 5): when a long game has more unpinned memories than the prompt
 * budget holds, the ones kept are the ones that matter to what is happening now, not just
 * the newest. Pinned entries are always kept by the prompt builder; this only orders the rest.
 *
 * Two scorers:
 *   - lexical: TF-IDF cosine between each entry and the recent turns. Runs everywhere,
 *     offline, synchronously, so the meter and the prompt always agree.
 *   - embeddings: past EMBED_AFTER entries, with a Gemini key, entries and the recent turns
 *     are embedded (gemini-embedding-001) and ranked by cosine. Vectors are cached per text
 *     for the session. A failure is reported and the lexical order is used for that turn.
 */
import type { MemoryEntry } from './memoryStore';

/** Entries past which embedding recall is worth a request. */
export const EMBED_AFTER = 200;
/** How much a newer entry is preferred when relevance ties (per 100 turns of age). */
const RECENCY_WEIGHT = 0.05;

const STOP = new Set(
  'a an the and or but of to in on at for with by from as is are was were be been it its this that these those he she they them his her their you your i we our not no so then than there here have has had do does did into out up down over under again very can will would just'.split(' ')
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/'s$/, '').replace(/'/g, ''))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Relevance of each entry to `query`, 0..1, by TF-IDF cosine. */
export function lexicalScores(entries: Pick<MemoryEntry, 'id' | 'text'>[], query: string): Record<string, number> {
  const docs = entries.map((e) => tokenize(e.text));
  const q = tokenize(query);
  const df = new Map<string, number>();
  for (const d of docs) for (const w of new Set(d)) df.set(w, (df.get(w) ?? 0) + 1);
  const n = docs.length || 1;
  const idf = (w: string) => Math.log(1 + n / (1 + (df.get(w) ?? 0)));
  const vec = (words: string[]) => {
    const tf = new Map<string, number>();
    for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
    const v = new Map<string, number>();
    for (const [w, c] of tf) v.set(w, c * idf(w));
    return v;
  };
  const qv = vec(q);
  const qn = Math.sqrt([...qv.values()].reduce((s, x) => s + x * x, 0)) || 1;
  const out: Record<string, number> = {};
  entries.forEach((e, i) => {
    const dv = vec(docs[i]);
    let dot = 0;
    for (const [w, x] of dv) dot += x * (qv.get(w) ?? 0);
    const dn = Math.sqrt([...dv.values()].reduce((s, x) => s + x * x, 0)) || 1;
    out[e.id] = dot / (dn * qn);
  });
  return out;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * Unpinned entries in the order the prompt should keep them: most relevant first, recency
 * breaking ties. Without a query (or scores), newest first, as before.
 */
export function recallOrder(unpinned: MemoryEntry[], query: string | undefined, scores?: Record<string, number> | null): MemoryEntry[] {
  const byAge = [...unpinned].sort((a, b) => b.createdTurn - a.createdTurn);
  if (!query?.trim() && !scores) return byAge;
  const s = scores ?? lexicalScores(unpinned, query ?? '');
  const newest = byAge[0]?.createdTurn ?? 0;
  const score = (e: MemoryEntry) => (s[e.id] ?? 0) - (RECENCY_WEIGHT * (newest - e.createdTurn)) / 100;
  return byAge.map((e, i) => ({ e, i, v: score(e) })).sort((a, b) => b.v - a.v || a.i - b.i).map((x) => x.e);
}

/** The text recall is matched against: the last few turns. */
export function recallQuery(turns: { content: string }[], last = 3): string {
  return turns.slice(-last).map((t) => t.content).join('\n').slice(-2000);
}

/* ------------------------------ embeddings ------------------------------ */

export type Embedder = (texts: string[], signal?: AbortSignal) => Promise<number[][]>;

const EMBED_MODEL = 'gemini-embedding-001';
const BATCH = 100;

/** Gemini embeddings with the player's own key (sent in the x-goog-api-key header). */
export function geminiEmbedder(apiKey: string): Embedder {
  return async (texts, signal) => {
    const out: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH) {
      const chunk = texts.slice(i, i + BATCH);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey.trim() },
        body: JSON.stringify({
          requests: chunk.map((text) => ({
            model: `models/${EMBED_MODEL}`,
            content: { parts: [{ text }] },
            taskType: 'SEMANTIC_SIMILARITY',
            outputDimensionality: 256
          }))
        }),
        signal
      });
      if (!res.ok) throw new Error(`the embedding service answered ${res.status}`);
      const data = await res.json();
      const vecs: number[][] = (data.embeddings ?? []).map((e: { values?: number[] }) => e.values ?? []);
      if (vecs.length !== chunk.length) throw new Error('the embedding service sent the wrong number of vectors');
      out.push(...vecs);
    }
    return out;
  };
}

const cache = new Map<string, number[]>();
const CACHE_MAX = 2000;

/** Clears the per-session vector cache (tests, sign-out). */
export function clearRecallCache(): void {
  cache.clear();
}

/**
 * Embedding relevance for each unpinned entry, or null when recall does not need it
 * (few entries). Throws when the embedder fails, so the caller can report it.
 */
export async function embeddingScores(entries: MemoryEntry[], query: string, embed: Embedder, signal?: AbortSignal): Promise<Record<string, number> | null> {
  const unpinned = entries.filter((e) => !e.pinned);
  if (unpinned.length < EMBED_AFTER || !query.trim()) return null;
  const missing = [...new Set([query, ...unpinned.map((e) => e.text)].filter((t) => !cache.has(t)))];
  if (missing.length) {
    const vecs = await embed(missing, signal);
    missing.forEach((t, i) => cache.set(t, vecs[i]));
    while (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
  }
  const qv = cache.get(query)!;
  const out: Record<string, number> = {};
  for (const e of unpinned) out[e.id] = cosine(qv, cache.get(e.text) ?? []);
  return out;
}
