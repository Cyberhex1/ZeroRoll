import { GeminiModelOption } from '../types';
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
