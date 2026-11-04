import { GeminiModelOption } from '../types';
import { getUsableGeminiModels } from '../ai/transport';
import { AI_PROVIDERS } from './providersConfig';

// Single source of truth: the Gemini models offered in the AI provider settings.
export const GEMINI_MODELS: GeminiModelOption[] = AI_PROVIDERS.gemini.models.map((m) => ({
  id: m.id,
  name: m.name,
  tagline: m.badge || '',
  badge: m.badge || '',
  description: m.description,
  recommendedFor: m.description
}));

export const DEFAULT_GEMINI_MODEL = AI_PROVIDERS.gemini.defaultModel;

/** "gemini-3.8-flash" -> "Gemini 3.8 Flash" for models not in the curated list. */
export function prettyGeminiName(id: string): string {
  return id
    .replace(/^gemini-/, 'Gemini ')
    .split(/[-\s]/)
    .filter(Boolean)
    .map((w) => (/^\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
    .replace(/^Gemini Gemini/, 'Gemini');
}

/**
 * The Gemini models to offer: once the key's models have been probed, only the ones that
 * answered (curated ones first, with their descriptions); before that, the curated list.
 */
export function usableGeminiModelOptions(usable: string[] | null = getUsableGeminiModels()): GeminiModelOption[] {
  if (!usable || !usable.length) return GEMINI_MODELS;
  const curated = GEMINI_MODELS.filter((m) => usable.includes(m.id));
  const extra = usable
    .filter((id) => !GEMINI_MODELS.some((m) => m.id === id))
    .map((id) => ({ id, name: prettyGeminiName(id), tagline: '', badge: 'Works with your key', description: 'Answered a test request with your key.', recommendedFor: '' }));
  return [...curated, ...extra];
}
