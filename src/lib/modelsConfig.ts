import { GeminiModelOption } from '../types';

export const GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    tagline: 'Recommended Default',
    badge: 'Flagship',
    description: 'Fast, highly creative, and resilient model with exceptional narrative atmosphere building and rules comprehension.',
    recommendedFor: 'Epic cinematic sagas, worldbuilding, and immersive narrative roleplay.'
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite Latest',
    tagline: 'High Speed',
    badge: 'Fast',
    description: 'Ultra-responsive storytelling, quick turn processing, and vivid narrative descriptions.',
    recommendedFor: 'General gameplay, fast-paced combat, and interactive narrative flow.'
  },
  {
    id: 'gemini-pro-latest',
    name: 'Gemini Pro Latest',
    tagline: 'Deep Reasoning GM',
    badge: 'Pro DM',
    description: 'High-level tactical AI, deep lore consistency, complex rule adjudication, and psychological depth.',
    recommendedFor: 'Complex boss encounters, mystery campaigns, and intricate rules adjudication.'
  }
];

export const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';


