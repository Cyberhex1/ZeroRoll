/**
 * One-time switch for players who were on the old default (gemini-flash-latest). Free keys get
 * only about 20 Flash requests a day, so Flash-Lite is the default now (ohnna, 2026-11-21).
 * The player is told, and can pick Flash again in AI settings; after that their pick stays.
 */
import { getSavedProviderModel, setProviderModel } from '../lib/geminiService';
import { reportAINotice } from '../lib/aiStatus';
import { GEMINI_DEFAULT_MODEL } from './transport';

const DONE_KEY = 'zeroroll_default_model_migrated_2026_11';
const OLD_DEFAULT = 'gemini-flash-latest';

export function migrateGeminiDefaultModel(): boolean {
  try {
    if (localStorage.getItem(DONE_KEY)) return false;
    localStorage.setItem(DONE_KEY, '1');
  } catch (_) {
    return false;
  }
  if (getSavedProviderModel('gemini') !== OLD_DEFAULT) return false;
  setProviderModel('gemini', GEMINI_DEFAULT_MODEL);
  reportAINotice(
    'Model',
    'ZeroRoll now uses Gemini 3.5 Flash-Lite by default: free keys get hundreds of Flash-Lite requests a day but only about 20 on Flash. To keep using Flash, pick it again in AI settings.'
  );
  return true;
}
