/**
 * In-app half of the weekly latest-model check. At most once a week, when the player uses
 * Gemini, list the models their key can call and compare them with models.json and with the
 * model they picked. Retired ladder models are patched locally so the router stops calling
 * them; anything the player should act on is shown as a status notice.
 */
import modelsJson from './models.json';
import { suggestModelUpdates, ModelSuggestion } from './modelCheck';
import type { Tier } from './router';
import { getActiveProvider, getProviderKey, getSavedProviderModel, refreshUsableGeminiModels } from '../lib/geminiService';
import { reportAINotice } from '../lib/aiStatus';

const LAST_CHECK_KEY = 'zeroroll_model_check_at';
const PATCH_KEY = 'zeroroll_ladder_patch';
const NOTICE_KEY = 'zeroroll_model_check_notice';
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Local replacements for retired models.json entries, by provider and tier. */
export function getLadderPatch(provider: string): Partial<Record<Tier, string>> {
  try {
    return JSON.parse(localStorage.getItem(PATCH_KEY) || '{}')?.[provider] || {};
  } catch (_) {
    return {};
  }
}

function savePatch(provider: string, patch: Partial<Record<Tier, string>>): void {
  try {
    const all = JSON.parse(localStorage.getItem(PATCH_KEY) || '{}');
    all[provider] = patch;
    localStorage.setItem(PATCH_KEY, JSON.stringify(all));
  } catch (_) {}
}

export function isCheckDue(now = Date.now()): boolean {
  try {
    const last = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    return !last || now - last >= WEEK_MS;
  } catch (_) {
    return false;
  }
}

/** Returns the suggestions found, or null when no check ran (not due, not Gemini, no key, or offline). */
export async function runWeeklyModelCheck(force = false): Promise<ModelSuggestion[] | null> {
  if (getActiveProvider() !== 'gemini') return null;
  const key = getProviderKey('gemini');
  if (!key.trim() || (!force && !isCheckDue())) return null;

  let available: string[];
  try {
    // Also re-probes which models answer, so the pickers drop models that stopped working.
    available = (await refreshUsableGeminiModels(key)).listed;
  } catch (err) {
    // A failed check is retried next session; real calls report their own errors.
    console.warn('[Model check] could not list Gemini models:', err);
    return null;
  }
  try {
    localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));
  } catch (_) {}

  const ladder = (modelsJson.providers as Record<string, Partial<Record<Tier, string>>>).gemini || {};
  const suggestions = suggestModelUpdates('gemini', ladder, available);
  const patch: Partial<Record<Tier, string>> = {};
  for (const s of suggestions) if (s.reason === 'retired' && s.suggested) patch[s.tier] = s.suggested;
  savePatch('gemini', patch);

  // The player's own pick is checked as their "good" model.
  const chosen = getSavedProviderModel('gemini');
  const mine = chosen ? suggestModelUpdates('gemini', { good: chosen }, available) : [];
  const all = [...suggestions, ...mine.map((s) => ({ ...s, provider: 'your pick' }))];

  const message = mine.length
    ? mine[0].reason === 'retired'
      ? `Your chosen model ${mine[0].current} is no longer available to your key${mine[0].suggested ? `. ${mine[0].suggested} is the closest current model; pick it in Connect AI` : '. Pick another model in Connect AI'}.`
      : `${mine[0].suggested} is newer than your chosen model ${mine[0].current}. You can switch in Connect AI.`
    : Object.keys(patch).length
      ? `Some built-in models were retired, so ZeroRoll now uses ${Object.values(patch).join(', ')} instead.`
      : '';
  if (message) {
    let last = '';
    try {
      last = localStorage.getItem(NOTICE_KEY) || '';
      localStorage.setItem(NOTICE_KEY, message);
    } catch (_) {}
    if (message !== last) reportAINotice('Model check', message);
  }
  return all;
}
