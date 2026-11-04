/**
 * Cheap token estimates for the prompt budget and meter. Real tokenizers differ by
 * provider; characters / 3.6 is close for English prose across Gemini, Claude, GPT and
 * Llama-family models, and errs on the side of overcounting slightly for safety.
 */
import type { Tier } from '../ai/router';

const CHARS_PER_TOKEN = 3.6;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * The context the prompt may use for a tier. Local models run with the context the PC
 * app set (8k by default) whenever they answer the tier (callers pass it only then); hosted models get a generous but bounded window so long
 * stories stay affordable.
 */
export function contextTokensFor(tier: Tier, localContext?: number): number {
  if (localContext) return localContext;
  return tier === 'basic' ? 16_000 : 32_000;
}
