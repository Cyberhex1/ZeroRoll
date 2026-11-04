/**
 * Embedding recall for a turn, with the player's own Gemini key. Only used when Gemini is
 * the active provider, so story text never goes to a provider the player did not pick.
 * Failures are reported (never silent) and the turn uses lexical recall.
 */
import { getActiveProvider, getProviderKey } from '../lib/geminiService';
import { reportAINotice } from '../lib/aiStatus';
import type { MemoryState } from './memoryStore';
import { EMBED_AFTER, embeddingScores, geminiEmbedder, recallQuery } from './recall';

export async function turnRecallScores(memory: MemoryState, turns: { content: string }[], signal?: AbortSignal): Promise<Record<string, number> | null> {
  if (memory.entries.filter((e) => !e.pinned).length < EMBED_AFTER) return null;
  if (getActiveProvider() !== 'gemini') return null;
  const key = getProviderKey('gemini');
  if (!key) return null;
  try {
    return await embeddingScores(memory.entries, recallQuery(turns), geminiEmbedder(key), signal);
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    reportAINotice('Memory recall', `Embedding recall failed (${e instanceof Error ? e.message : String(e)}); this turn picked memories by matching words instead.`);
    return null;
  }
}
