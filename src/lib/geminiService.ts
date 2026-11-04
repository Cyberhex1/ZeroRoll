import firebaseConfig from '../../firebase-applet-config.json';
import { uid } from './ids';
import { currentStateBlock } from '../dnd/memory';
import { leadAlert, parseGmReply } from '../dnd/turnParser';
import { RulesMode, rulesLine } from '../dnd/rules';
import {
  ExperienceCategory,
  DiceRollResult,
  ActionTurnResult,
  DMStoryOutline,
  CampaignInspiration,
  GameWorldState
} from '../types';

/** A brainstorm list for the Story Seeds tab (AI refresh or the category's own tropes). */
export interface CategorySeedInfo {
  categoryId: string;
  categoryName: string;
  mediaReferences: string[];
  prompts: string[];
}
import { generateRandomScenarioSetup, RandomizedScenarioData } from '../content/procedural';
import { getCategoryFallbackActions, getCategoryProfile, getContent } from '../content';
import { fullProfileBlock, turnContextBlock } from '../content/injection';
import { AIProviderId, AI_PROVIDERS, DEFAULT_AI_PROVIDER } from './providersConfig';
import { AIError, classifyAIError, describeAIError } from './aiErrors';
import { reportAIFailure, reportAINotice, reportAISuccess, resetAIStatus } from './aiStatus';

import {
  AI_REQUEST_TIMEOUT_MS,
  AI_TURN_DEADLINE_MS,
  DEFAULT_MAX_OUTPUT_TOKENS,
  FALLBACK_MODELS,
  GEMINI_DEFAULT_MODEL,
  ProviderCallConfig,
  callProvider,
  getCachedGeminiModels,
  getGeminiCandidateModels,
  listGeminiModels,
  normalizeGeminiModelName,
  parseRetryDelayMs,
  setCachedGeminiModels,
  supportsJsonMode
} from '../ai/transport';

export {
  AI_REQUEST_TIMEOUT_MS,
  AI_TURN_DEADLINE_MS,
  DEFAULT_MAX_OUTPUT_TOKENS,
  FALLBACK_MODELS,
  GEMINI_DEFAULT_MODEL,
  getCachedGeminiModels,
  getGeminiCandidateModels,
  listGeminiModels,
  parseRetryDelayMs,
  supportsJsonMode
};


// The Firebase web API key in firebase-applet-config.json is NOT a Gemini key: Google
// blocks it for the Generative Language API (403 API_KEY_SERVICE_BLOCKED). Older builds
// used it as a silent fallback and synced it to the cloud, so treat it as "no key".
const FIREBASE_WEB_API_KEY: string = ((firebaseConfig as any)?.apiKey || '').trim();

function isUnusableKey(provider: string, key: string): boolean {
  return provider === 'gemini' && !!FIREBASE_WEB_API_KEY && key.trim() === FIREBASE_WEB_API_KEY;
}

/* -------------------------------------------------------------------------- */
/*                        PROVIDER CONFIGURATION & STORAGE                    */
/* -------------------------------------------------------------------------- */

export function getActiveProvider(): AIProviderId {
  try {
    const saved = localStorage.getItem('zeroroll_ai_provider');
    if (saved && AI_PROVIDERS[saved as AIProviderId]) {
      return saved as AIProviderId;
    }
  } catch (_) {}
  return DEFAULT_AI_PROVIDER;
}

export function setActiveProvider(provider: AIProviderId): void {
  try {
    localStorage.setItem('zeroroll_ai_provider', provider);
  } catch (_) {}
}

/** Key the player saved on this device (never env or config fallbacks). */
function getStoredProviderKey(provider: AIProviderId): string {
  try {
    const perProvider = localStorage.getItem(`zeroroll_key_${provider}`)?.trim();
    if (perProvider && !isUnusableKey(provider, perProvider)) return perProvider;

    if (provider === 'gemini') {
      const legacyGemini = localStorage.getItem('dnd_gemini_api_key')?.trim();
      if (legacyGemini && !isUnusableKey(provider, legacyGemini)) return legacyGemini;
    }
  } catch (_) {}
  return '';
}

export function getProviderKey(provider: AIProviderId): string {
  // A player's own key or nothing: no build-time or project key is ever substituted.
  return getStoredProviderKey(provider);
}

// Listeners for key changes (opt-in key sync re-seals the vault when a key changes).
const keyListeners = new Set<() => void>();
export function subscribeProviderKeyChanges(listener: () => void): () => void {
  keyListeners.add(listener);
  return () => keyListeners.delete(listener);
}

export function setProviderKey(provider: AIProviderId, key: string): void {
  queueMicrotask(() => keyListeners.forEach((l) => l()));
  try {
    if (key && key.trim()) {
      localStorage.setItem(`zeroroll_key_${provider}`, key.trim());
      if (provider === 'gemini') {
        localStorage.setItem('dnd_gemini_api_key', key.trim());
      }
    } else {
      localStorage.removeItem(`zeroroll_key_${provider}`);
      if (provider === 'gemini') {
        localStorage.removeItem('dnd_gemini_api_key');
      }
    }
  } catch (_) {}
}

/**
 * Removes the Firebase web key if an older build stored it as the Gemini key.
 * Returns true when something was removed (callers should re-sync cloud settings).
 */
export function purgeUnusableStoredKeys(): boolean {
  let removed = false;
  try {
    for (const storageKey of ['zeroroll_key_gemini', 'dnd_gemini_api_key']) {
      const value = localStorage.getItem(storageKey);
      if (value && isUnusableKey('gemini', value)) {
        localStorage.removeItem(storageKey);
        removed = true;
      }
    }
  } catch (_) {}
  return removed;
}

/** The model the player picked for this provider, or '' if they never chose one. */
export function getSavedProviderModel(provider: AIProviderId): string {
  try {
    return (localStorage.getItem(`zeroroll_model_${provider}`) || '').trim();
  } catch (_) {
    return '';
  }
}

export function getProviderModel(provider: AIProviderId): string {
  try {
    const saved = localStorage.getItem(`zeroroll_model_${provider}`);
    if (saved && saved.trim()) return saved.trim();
  } catch (_) {}
  return AI_PROVIDERS[provider]?.defaultModel || GEMINI_DEFAULT_MODEL;
}

export function setProviderModel(provider: AIProviderId, model: string): void {
  try {
    if (model && model.trim()) {
      localStorage.setItem(`zeroroll_model_${provider}`, model.trim());
    } else {
      localStorage.removeItem(`zeroroll_model_${provider}`);
    }
  } catch (_) {}
}

export function getProviderBaseUrl(provider: AIProviderId): string {
  try {
    const custom = localStorage.getItem(`zeroroll_baseurl_${provider}`);
    if (custom && custom.trim()) return custom.trim();
  } catch (_) {}
  return AI_PROVIDERS[provider]?.defaultBaseUrl || '';
}

export function setProviderBaseUrl(provider: AIProviderId, url: string): void {
  try {
    if (url && url.trim()) {
      localStorage.setItem(`zeroroll_baseurl_${provider}`, url.trim());
    } else {
      localStorage.removeItem(`zeroroll_baseurl_${provider}`);
    }
  } catch (_) {}
}

/* ------------------------------ Offline mode ------------------------------ */

/** Offline mode is the only way the game uses procedural content on purpose. */
export function isOfflineMode(): boolean {
  try {
    return localStorage.getItem('zeroroll_offline_mode') === 'true';
  } catch (_) {
    return false;
  }
}

export function setOfflineMode(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem('zeroroll_offline_mode', 'true');
    else localStorage.removeItem('zeroroll_offline_mode');
  } catch (_) {}
  resetAIStatus();
}

// Export and import provider settings for cloud synchronization.
// API keys are never exported: they stay on this device (opt-in encrypted sync comes later).
export function exportAllProviderSettings(): {
  activeProvider: AIProviderId;
  providerModels: Record<string, string>;
  providerBaseUrls: Record<string, string>;
} {
  const providerModels: Record<string, string> = {};
  const providerBaseUrls: Record<string, string> = {};

  const providerIds = Object.keys(AI_PROVIDERS) as AIProviderId[];
  for (const pid of providerIds) {
    const m = getProviderModel(pid);
    if (m && m !== AI_PROVIDERS[pid]?.defaultModel) providerModels[pid] = m;
    const u = getProviderBaseUrl(pid);
    if (u && u !== AI_PROVIDERS[pid]?.defaultBaseUrl) providerBaseUrls[pid] = u;
  }

  return {
    activeProvider: getActiveProvider(),
    providerModels,
    providerBaseUrls
  };
}

/**
 * Merges cloud provider settings into this device. Settings already present on this
 * device win, so a stale cloud copy can never overwrite a key the player just entered.
 *
 * `providerKeys` only exists on profiles written by older builds, which synced keys in
 * plain text. They are copied to this device once (so nobody loses a key) and the caller
 * then deletes them from the cloud with purgeCloudProviderKeys.
 */
export function importAllProviderSettings(settings?: {
  activeProvider?: string;
  providerKeys?: Record<string, string>;
  providerModels?: Record<string, string>;
  providerBaseUrls?: Record<string, string>;
}): void {
  if (!settings) return;
  let hasLocalProvider = false;
  try {
    hasLocalProvider = !!localStorage.getItem('zeroroll_ai_provider');
  } catch (_) {}

  if (!hasLocalProvider && settings.activeProvider && AI_PROVIDERS[settings.activeProvider as AIProviderId]) {
    setActiveProvider(settings.activeProvider as AIProviderId);
  }
  if (settings.providerKeys) {
    for (const [pid, key] of Object.entries(settings.providerKeys)) {
      if (!AI_PROVIDERS[pid as AIProviderId] || !key || isUnusableKey(pid, key)) continue;
      if (!getStoredProviderKey(pid as AIProviderId)) setProviderKey(pid as AIProviderId, key);
    }
  }
  if (settings.providerModels) {
    for (const [pid, model] of Object.entries(settings.providerModels)) {
      if (!AI_PROVIDERS[pid as AIProviderId] || !model) continue;
      let hasLocal = false;
      try { hasLocal = !!localStorage.getItem(`zeroroll_model_${pid}`); } catch (_) {}
      if (!hasLocal) setProviderModel(pid as AIProviderId, model);
    }
  }
  if (settings.providerBaseUrls) {
    for (const [pid, url] of Object.entries(settings.providerBaseUrls)) {
      if (!AI_PROVIDERS[pid as AIProviderId] || !url) continue;
      let hasLocal = false;
      try { hasLocal = !!localStorage.getItem(`zeroroll_baseurl_${pid}`); } catch (_) {}
      if (!hasLocal) setProviderBaseUrl(pid as AIProviderId, url);
    }
  }
}

// Backward compatibility helper functions
export function getStoredApiKey(): string {
  return getProviderKey(getActiveProvider());
}

export function saveStoredApiKey(apiKey: string): void {
  setProviderKey(getActiveProvider(), apiKey);
}

export function getCustomApiKey(): string {
  return getStoredApiKey();
}

/** True when AI calls should be attempted: not in Offline mode and a key is configured. */
export function hasActiveGeminiKey(): boolean {
  if (isOfflineMode()) return false;
  const provider = getActiveProvider();
  // Custom local LLM might not require a key if local
  if (provider === 'custom') return true;
  return getProviderKey(provider).length > 5;
}

export function hasActiveAIKey(): boolean {
  return hasActiveGeminiKey();
}

/* -------------------------------------------------------------------------- */
/*                  UNIVERSAL CLIENT-SIDE MULTI-PROVIDER CALLER               */
/* -------------------------------------------------------------------------- */
// The transports, Gemini model discovery and cascade live in src/ai/transport.ts.

export interface UniversalPromptOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  responseJson?: boolean;
  /**
   * How much hidden reasoning Gemini may do before answering. Lower is much faster;
   * story writing doesn't need deep reasoning. Default 'low'.
   */
  thinking?: 'minimal' | 'low';
  /** Upper bound on the reply length. Defaults per provider (see DEFAULT_MAX_OUTPUT_TOKENS). */
  maxTokens?: number;
  /** Feature name used in status-line notices, e.g. "Story turn". */
  feature?: string;
}

/** Details of the last successful call, for status lines and Continue offers. */
export interface AICallMeta {
  provider: AIProviderId;
  model: string;
  truncated: boolean;
  /** Set when the Gemini cascade answered with a different model than the one chosen. */
  swappedFrom?: string;
  /** Why the chosen model was skipped. */
  swapReason?: string;
}

let lastModelUsed = '';
let lastCallMeta: AICallMeta | null = null;

/** Label of the provider/model that produced the most recent successful reply. */
export function getLastModelUsedLabel(): string {
  const provider = lastCallMeta?.provider || getActiveProvider();
  return `${AI_PROVIDERS[provider]?.name || provider} (${lastModelUsed || getProviderModel(provider)})`;
}

export function getLastCallMeta(): AICallMeta | null {
  return lastCallMeta;
}

/**
 * Executes a raw prompt against the currently configured AI provider.
 * Throws an AIError (never falls back silently). Soft problems on a successful call
 * (model swap, cut-off reply) are reported to the status line.
 */
export async function executeUniversalPrompt(options: UniversalPromptOptions): Promise<string> {
  const provider = getActiveProvider();
  const text = await runProviderPrompt(
    {
      provider,
      apiKey: getProviderKey(provider),
      model: getProviderModel(provider),
      baseUrl: getProviderBaseUrl(provider)
    },
    options
  );
  reportAISuccess(getLastModelUsedLabel());
  const meta = lastCallMeta;
  const feature = options.feature || 'AI reply';
  if (meta?.swappedFrom) {
    reportAINotice(feature, `${meta.swappedFrom} was unavailable (${meta.swapReason || 'error'}), so ${meta.model} answered instead.`);
  }
  if (meta?.truncated) {
    reportAINotice(feature, 'The reply was cut short by the model\'s length limit. Use Continue to pick up where it stopped.');
  }
  return text;
}

async function runProviderPrompt(cfg: ProviderCallConfig, options: UniversalPromptOptions): Promise<string> {
  const { systemPrompt, userPrompt, temperature = 0.8, responseJson = false, thinking = 'low', maxTokens } = options;
  const reply = await callProvider(cfg, {
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    temperature,
    json: responseJson,
    thinking,
    maxTokens
  });
  lastModelUsed = reply.model;
  lastCallMeta = {
    provider: reply.provider,
    model: reply.model,
    truncated: reply.truncated,
    swappedFrom: reply.swappedFrom,
    swapReason: reply.swapReason
  };
  return reply.text;
}

/* -------------------------------------------------------------------------- */
/*                        RESPONSE PARSING & FAILURE REPORTING                */
/* -------------------------------------------------------------------------- */

/** Parses a JSON object out of a model reply, tolerating code fences and stray prose. */
export function parseJsonReply<T = any>(raw: string): T {
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(stripped);
  } catch (_) {}
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(stripped.slice(start, end + 1));
    } catch (_) {}
  }
  throw new AIError('bad_output', `Reply was not valid JSON: ${stripped.slice(0, 120)}`);
}

/**
 * Runs a JSON prompt and validates it, re-asking once if the reply is unusable.
 */
async function executeJsonPrompt<T>(
  options: UniversalPromptOptions,
  isValid: (value: any) => boolean
): Promise<T> {
  let lastError: AIError | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = attempt === 0
      ? options.userPrompt
      : `${options.userPrompt}\n\nYour previous reply could not be parsed. Reply with ONLY the JSON object, no commentary.`;
    const raw = await executeUniversalPrompt({ ...options, userPrompt: prompt, responseJson: true });
    try {
      const parsed = parseJsonReply<T>(raw);
      if (isValid(parsed)) return parsed;
      lastError = new AIError('bad_output', 'Reply JSON was missing required fields.');
    } catch (err) {
      lastError = classifyAIError(err);
    }
  }
  throw lastError!;
}

/**
 * Records a failed AI feature so the player sees it (banner + navbar badge),
 * and returns the classified error.
 */
function reportFeatureFailure(err: unknown, feature: string, usedFallback: boolean): { error: AIError; message: string } {
  const provider = getActiveProvider();
  const aiErr = classifyAIError(err, provider);
  const message = describeAIError(aiErr, AI_PROVIDERS[provider]?.name || 'The AI provider');
  console.warn(`[AI] ${feature} failed${usedFallback ? ' — using offline generator' : ''}:`, aiErr);
  reportAIFailure(aiErr, message, { feature, usedFallback });
  return { error: aiErr, message };
}

/** No key and not in Offline mode: the player hasn't chosen procedural, so tell them. */
function reportMissingKey(feature: string): void {
  if (isOfflineMode()) return;
  const provider = getActiveProvider();
  reportFeatureFailure(
    new AIError('no_key', 'No API key configured.', { provider }),
    feature,
    true
  );
}

/* -------------------------------------------------------------------------- */
/*                       CONNECTION TESTER FOR THE UI                         */
/* -------------------------------------------------------------------------- */

export async function testProviderConnection(params: {
  provider: AIProviderId;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}): Promise<{
  success: boolean;
  latencyMs: number;
  message: string;
  reply?: string;
  modelUsed?: string;
  availableModels?: string[];
}> {
  const { provider, apiKey = '', baseUrl } = params;
  const model = params.model || AI_PROVIDERS[provider]?.defaultModel || '';
  const providerName = AI_PROVIDERS[provider]?.name || provider;
  const start = Date.now();
  let availableModels: string[] | undefined;

  try {
    if (provider === 'gemini') {
      // Validates the key and records which models it can use for the fallback cascade.
      availableModels = await listGeminiModels(apiKey);
      setCachedGeminiModels(availableModels);
    }

    // Same path as real gameplay calls, including the model cascade. JSON mode only where the
    // provider supports it, so a local model that answers in prose still passes.
    const jsonMode = supportsJsonMode(provider);
    const raw = await runProviderPrompt(
      { provider, apiKey: apiKey.trim(), model, baseUrl: baseUrl || getProviderBaseUrl(provider) },
      {
        userPrompt: jsonMode
          ? 'Reply with this exact JSON object: {"status": "Ready for adventure"}'
          : 'Reply with exactly these words and nothing else: Ready for adventure',
        temperature: 0.2,
        responseJson: jsonMode,
        thinking: 'minimal',
        maxTokens: provider === 'gemini' ? 1024 : 256
      }
    );
    let replyText = raw.trim().slice(0, 80);
    if (jsonMode) {
      try {
        replyText = parseJsonReply<{ status?: string }>(raw)?.status || replyText;
      } catch (_) {
        // JSON mode is requested, but a readable reply still proves the connection works.
      }
    }
    const latencyMs = Date.now() - start;
    const modelUsed = lastModelUsed || model;
    const swapped = provider === 'gemini' && normalizeGeminiModelName(model) !== modelUsed;
    // Only a test of the provider the game is actually using marks the navbar as connected.
    if (provider === getActiveProvider()) reportAISuccess(`${providerName} (${modelUsed})`);

    return {
      success: true,
      latencyMs,
      message: swapped
        ? `Connected in ${latencyMs}ms, but ${normalizeGeminiModelName(model)} isn't available to this key, so ${modelUsed} answered. Pick an available model below.`
        : `Connected to ${modelUsed} in ${latencyMs}ms.`,
      reply: replyText,
      modelUsed,
      availableModels
    };
  } catch (err: any) {
    const aiErr = classifyAIError(err, provider);
    return {
      success: false,
      latencyMs: Date.now() - start,
      message: `${describeAIError(aiErr, providerName)}\n\nDetails: ${aiErr.message}`,
      availableModels
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                        GAMEPLAY AI FEATURE ENDPOINTS                       */
/* -------------------------------------------------------------------------- */

/**
 * Outline lines for a prompt, with only the fields that have content. Campaigns started
 * from a seed or a typed premise have a partial outline; missing fields used to reach
 * the model as the word "undefined" (SL4). Returns '' when nothing is usable.
 */
export function formatOutlineForPrompt(outline: Partial<DMStoryOutline> | undefined | null, detail: 'full' | 'brief'): string {
  if (!outline) return '';
  const text = (v: unknown) => (typeof v === 'string' && v.trim() && v.trim() !== 'undefined' ? v.trim() : '');
  const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean) : []);
  const lines: string[] = [];
  const add = (label: string, value: string) => { if (value) lines.push(`- ${label}: ${value}`); };
  add('Starting Circumstances', text(outline.startingCircumstances));
  add('Backstory', text(outline.backstory));
  add('Inciting Incident', text(outline.incitingIncident));
  add('Immediate Goal', text(outline.immediateGoal));
  const npcs = Array.isArray(outline.keyNpcs) ? outline.keyNpcs.filter((n) => n && text(n.name)) : [];
  add('Key NPCs', npcs.map((n) => detail === 'full'
    ? `${text(n.name)} (${[text(n.role), text(n.motivation) && `Motivation: ${text(n.motivation)}`, text(n.secret) && `Secret: ${text(n.secret)}`].filter(Boolean).join(', ')})`
    : `${text(n.name)}${text(n.role) ? ` (${text(n.role)})` : ''}`).join('; '));
  if (detail === 'full') {
    add('Major Conflicts', list(outline.majorConflicts).join('; '));
    add('Hidden Secrets / Reveals', list(outline.secretsAndReveals).join('; '));
  }
  add('Chapter Progression', list(outline.chapters).join(' | '));
  return lines.join('\n');
}

/** Chip offered when a reply was cut short by the length limit. */
export const CONTINUE_ACTION = 'Continue';

const BLOCK_MARKERS = ['STATE_UPDATE', 'AVATAR_EVOLUTION', 'COURSE_TRIGGER', 'CHECK_REQUIRED'];

/** Removes a trailing block that was opened but never closed (reply cut off mid-block). */
export function stripUnterminatedBlocks(text: string): string {
  let out = text;
  for (const name of BLOCK_MARKERS) {
    const open = out.lastIndexOf(`---${name}---`);
    if (open === -1) continue;
    const closeName = name === 'COURSE_TRIGGER' ? 'END_TRIGGER' : name === 'CHECK_REQUIRED' ? 'END_CHECK' : `END_${name}`;
    if (out.indexOf(`---${closeName}---`, open) === -1) out = out.slice(0, open);
  }
  return out.trimEnd();
}

/**
 * Executes a player's narrative turn with the configured AI provider or procedural fallback.
 */
export async function executeActionTurn(params: {
  contents: string;
  category: ExperienceCategory;
  model: string;
  systemInstruction?: string;
  characterState?: any;
  diceRoll?: DiceRollResult;
  storyOutline?: DMStoryOutline;
  /** The campaign's stored inspiration, sent verbatim every turn. */
  inspiration?: CampaignInspiration;
  /** Location and quest for the CURRENT STATE sheet. */
  world?: Partial<GameWorldState>;
  /** The campaign's rules mode, stated in the prompt. */
  rulesMode?: RulesMode;
  /** 'referee' is the free-text Rules Referee: no genre corpus and no outline (injection policy). */
  purpose?: 'turn' | 'referee';
}): Promise<ActionTurnResult> {
  const { contents, category, model, systemInstruction, characterState, diceRoll, inspiration, purpose = 'turn' } = params;
  const isReferee = purpose === 'referee';
  const storyOutline = isReferee ? undefined : params.storyOutline;
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const narrativeCorpus = isReferee ? '' : turnContextBlock(category, inspiration);
      // Issue #5: ALWAYS include the base GM prompt + narrative corpus +
      // story outline. The user's custom system instruction is appended as
      // a stylistic flavor on top, so the AI always has the campaign
      // context regardless of whether the user wrote a custom system
      // prompt or not.
      const basePrompt = `You are a master interactive author writing a deeply immersive Choose-Your-Own-Adventure novel in the "${category}" genre with D&D 5e mechanics.

${narrativeCorpus}

${formatOutlineForPrompt(storyOutline, 'full') ? `DM STORY ROADMAP & INTERNAL OUTLINE (Dynamic Reference - NOT a rigid script):
${formatOutlineForPrompt(storyOutline, 'full')}

ROADMAP GM PRINCIPLES:
1. DYNAMIC ADAPTATION: The outline is a living roadmap, not a railroad script. Player decisions shape reality. If the player outsmarts an obstacle, befriends an enemy, or takes an unexpected path, adapt the story organically.
2. TIMELINE INTEGRITY: What is happening right now is the present scene. Never casually reveal or treat future chapter developments as though they have already occurred.` : ''}

GAMEPLAY GM DIRECTIVES:
- Address the player as "you". Keep the narrative in present tense.
- The CURRENT STATE, MEMORY and STORY SO FAR blocks in the player message are true. Never contradict them: the hero only uses items in their inventory, conditions stay until removed, and a hero at 0 HP is down until healed or stabilized.
- Faithfully reflect the category's narrative profile: voice, atmospheric sensory details, scene architecture, and dramatic pacing.
- The player's actions, choices, and premise are authoritative. Ground your storytelling craft and encounter emergence in the category profile without overriding the player's choices.
- PACING: Maintain genre-specific pacing based on the provided narrative profile and seed inspiration. Do not rush to the climax unless the genre demands high-octane speed. Let the plot unfold naturally chapter by chapter, allowing the player to immerse deeply in the environment and conversations.
- CHAPTER PROGRESSION: When the current chapter concludes and the story organically transitions to the next chapter of the roadmap, you MUST output a COURSE_TRIGGER with type "chapter_transition".
- STORY CONCLUSION: When the final chapter resolves and the overarching plot is fully complete, you MUST output a COURSE_TRIGGER with type "story_conclusion".
- React dynamically to player rolls and decisions, maintaining excitement, atmosphere, and authentic stakes without accelerating the timeline prematurely.

Output a state update block if inventory, conditions, or HP change:
---STATE_UPDATE---
HP_DELTA: <-3 or +4 or 0>
ITEMS_GAINED: ["Item Name"]
ITEMS_LOST: ["Item Name"]
CONDITIONS_ADDED: ["Condition Name"]
CONDITIONS_REMOVED: ["Condition Name"]
GOLD_DELTA: <-5 or +20 or 0>
XP_GAINED: <0, or XP earned this turn (Full 5e only)>
SPELLS_GAINED: ["Spell Name"]
LOCATION: <Location Name>
---END_STATE_UPDATE---
Use one STATE_UPDATE block per reply. Name items exactly as they appear in the inventory when they are used up or lost.

If a MAJOR STORY BEAT or visual change occurs (e.g. Leveling up, acquiring visible legendary weapon/armor, suffering visible battle scars/burns, magical transformation, surviving a boss climax), output:
---AVATAR_EVOLUTION---
EVOLVED: true
REASON: <Brief explanation of visual change, e.g. "Wields the blazing runic sword, donning scorched wyrmscale armor">
PHYSICAL_DESCRIPTION: <Updated complete physical appearance description reflecting current story state>
---END_AVATAR_EVOLUTION---

If an event changes the course of the story, or advances the chapter/concludes the story, output:
---COURSE_TRIGGER---
TITLE: <Alert Title>
TYPE: <course_change | ambush | crisis | opportunity | twist | chapter_transition | story_conclusion>
SUBTITLE: <Warning sentence>
DESCRIPTION: <Details>
---END_TRIGGER---

If a D&D check is required:
---CHECK_REQUIRED---
SKILL: <Skill Name>
STAT: <str | dex | con | int | wis | cha>
DC: <Difficulty 10-20>
REASON: <Reason>
ADVANTAGE: <none | advantage | disadvantage> (Full 5e only)
---END_CHECK---
Only a CHECK_REQUIRED block asks for a roll; do not ask for rolls in the story text.

At the end, provide 3 suggested actions formatted as:
---OPTIONS---
[1] Action 1
[2] Action 2
[3] Action 3`;

      const promptInstruction = systemInstruction
        ? `${basePrompt}\n\nGM STYLE / VOICE OVERLAY (from user settings):\n${systemInstruction}`
        : basePrompt;

      const stateSheet = isReferee ? '' : [currentStateBlock(characterState, params.world, storyOutline), rulesLine(params.rulesMode ?? 'narrative')].filter(Boolean).join('\n');
      const userMessage = `${stateSheet ? `${stateSheet}\n\n` : ''}${/Recent Story Log:/.test(contents) || isReferee ? contents : `Recent Story Log:\n${contents}`}

${diceRoll ? `[PLAYER ROLLED ${diceRoll.formula} = ${diceRoll.total} (${diceRoll.isNat20 ? 'NATURAL 20 CRITICAL SUCCESS!' : diceRoll.isNat1 ? 'NATURAL 1 CRITICAL FUMBLE!' : 'Roll result'})]` : ''}`;

      let text = await executeUniversalPrompt({
        systemPrompt: promptInstruction,
        userPrompt: userMessage,
        temperature: 0.9,
        feature: 'Story turn'
      });
      const truncated = !!getLastCallMeta()?.truncated;
      // A cut-off reply can end inside a block; never show raw block markup to the player.
      if (truncated) text = stripUnterminatedBlocks(text);

      const parsed = parseGmReply(text);
      text = parsed.text;
      let suggestedActions: string[] = parsed.options;
      const courseChangeAlert = leadAlert(parsed.alerts);
      const requiredCheck = parsed.check;
      const stateDelta = parsed.delta;
      const avatarEvolution = parsed.avatarEvolution;

      // Fallback suggested actions — pull from category-flavored pool
      // instead of the old hardcoded "investigate / speak / ready" trio.
      // Reported, so generic chips are never passed off as the GM's suggestions.
      let fallbackActions = false;
      if (suggestedActions.length === 0) {
        suggestedActions = getCategoryFallbackActions(category);
        fallbackActions = true;
        if (!truncated) {
          reportAINotice('Story turn', 'The AI did not suggest actions this turn, so generic ones are shown.');
        }
      }
      suggestedActions = suggestedActions.slice(0, 3);
      if (truncated) suggestedActions = [CONTINUE_ACTION, ...suggestedActions.slice(0, 2)];

      return {
        text,
        truncated,
        fallbackActions,
        suggestedActions,
        courseChangeAlert,
        alerts: parsed.alerts,
        requiredCheck,
        stateDelta,
        avatarEvolution,
        modelUsed: getLastModelUsedLabel()
      };
    } catch (err: any) {
      // No procedural substitute mid-story: surface the real reason so the player can retry or fix settings.
      const { message } = reportFeatureFailure(err, 'Story turn', false);
      throw new Error(message);
    }
  }

  // Procedural turn only in Offline mode or when no key is configured (reported to the player).
  reportMissingKey('Story turn');
  return generateProceduralTurn(category, contents, characterState, diceRoll, model);
}

/**
 * Generates a completely randomized 5-field campaign setup using AI or procedural engine.
 * Considers user prompt/concept deeply to craft genre-authentic character details.
 */
export async function generateScenarioAI(params: {
  category: ExperienceCategory;
  model?: string;
  userPrompt?: string;
  gender?: string;
  characterName?: string;
  classRole?: string;
  raceOrigin?: string;
  /** When false, AI failures throw instead of returning a procedural scenario. */
  allowFallback?: boolean;
  /** Inspiration picked for this setup; stored on the campaign if the player keeps it. */
  inspiration?: CampaignInspiration;
}): Promise<{ scenario: RandomizedScenarioData; source: 'ai' | 'procedural' }> {
  const { category, model, userPrompt, gender, characterName, classRole, raceOrigin, allowFallback = true, inspiration } = params;
  const hasKey = hasActiveGeminiKey();

  if (!hasKey && !allowFallback) {
    const provider = getActiveProvider();
    const { message } = reportFeatureFailure(
      new AIError('no_key', 'No API key configured.', { provider }),
      'Scenario generation',
      false
    );
    throw new Error(message);
  }

  if (hasKey) {
    try {
      const narrativeCorpus = fullProfileBlock(category, inspiration);
      const prompt = `You are a master tabletop RPG Game Master, author, and worldbuilder.

${narrativeCorpus}

CREATIVE ASSIGNMENT:
Generate a COMPLETELY ORIGINAL "Story Prompt" (a back-of-the-book blurb) and an internal DM Story Outline for a "${category}" tabletop roleplaying experience.
Every single field MUST be uniquely invented, highly imaginative, and deeply grounded in the category's narrative profile and learned corpus patterns above.

CRITICAL CAUSAL BEGINNING & ANTI-SKIPPING DIRECTIVE:
1. START AT THE GENUINE NARRATIVE BEGINNING: The blurb should pitch a deeply immersive Choose-Your-Own-Adventure story that begins at the earliest meaningful point:
   [Starting situation] -> [Inciting incident] -> [Immediate consequences] -> [Player agency].
2. DO NOT SKIP TO THE LATE-GAME PAYOFF: Do not pitch a story where the hero has already won or achieved their ultimate goal. The payoff must be earned through play!
3. INTERNAL GM CHECK: Ask yourself: "If I pitched this blurb, does it sound like a compelling, deeply immersive book?" 
4. FLASHBACK USAGE: If critical backstory is essential, a concise flashback may occupy part of the blurb, but the active pitch must firmly land in the present dilemma.

CRITICAL USER AUTHORITY:
${userPrompt ? `USER CONCEPT & INSPIRATION: "${userPrompt}"\n-> The user's concept is strictly authoritative. Weave their premise seamlessly into the title, hero identity, background, and opening hook while using the category's narrative rhythm and sensory density!` : 'The player has not provided a custom premise; invent a stunning, genre-defining scenario that exemplifies the category profile.'}

${gender ? `HERO GENDER IDENTITY & PRONOUNS: "${gender}"\n-> IMPORTANT: Strictly use and embody this gender identity ("${gender}") across the hero's name, physical description, and narrative pronouns in the opening hook!` : ''}
${characterName ? `Hero Name to use: "${characterName}"` : 'Invent a unique, memorable genre-authentic first and last name matching the specified gender.'}
${classRole ? `Class/Role to use: "${classRole}"` : 'Invent a creative class/archetype deeply rooted in this genre.'}
${raceOrigin ? `Origin/Heritage to use: "${raceOrigin}"` : 'Invent an evocative race or origin fitting the genre.'}

SCENE STRUCTURE REQUIREMENT:
The storyBlurb MUST read like a compelling back-of-the-book summary, establishing the atmospheric stakes and the impending dilemma without resolving it.

Output MUST be strictly valid JSON matching this schema with no markdown fences:
{
  "title": "Evocative Chapter I Campaign Title",
  "heroName": "First and Last Name",
  "gender": "${gender || 'she/her'}",
  "roleClass": "Creative Class / Archetype",
  "raceOrigin": "Evocative Heritage / Origin",
  "storyBlurb": "Atmospheric 3-4 sentence back-of-the-book story prompt establishing who the hero is, their immediate situation, and the central, slow-burn premise of this Choose-Your-Own-Adventure.",
  "physicalDescription": "Vivid 1-2 sentence physical description of build, hair, eyes, facial expression, and distinctive gear.",
  "suggestedActions": [
    "Opening action option 1",
    "Opening action option 2",
    "Opening action option 3"
  ],
  "storyOutline": {
    "startingCircumstances": "The hero's starting physical and social situation at Chapter 1",
    "backstory": "Relevant history and root cause of the dilemma",
    "incitingIncident": "The exact event that disrupts the status quo right now",
    "immediateGoal": "The clear, actionable problem the player must address early on",
    "keyNpcs": [
      { "name": "NPC Name", "role": "Rival/Ally/Patron", "motivation": "What they want", "secret": "What they are hiding" }
    ],
    "majorConflicts": ["Primary external conflict", "Secondary interpersonal conflict"],
    "secretsAndReveals": ["Hidden truth 1", "Major twist 2 to be discovered later"],
    "chapters": [
      "Chapter 1: The opening crisis, investigation & initial choices",
      "Chapter 2: Rising complications, early confrontations",
      "Chapter 3: Deepening mystery and shocking discoveries",
      "Chapter 4: The climax, major revelation, and resolution"
    ],
    "potentialEndings": ["Triumphant vindication", "Bittersweet compromise", "Tragic sacrifice"]
  },
  "initialInventory": [
    { "name": "Primary Weapon / Tool", "type": "weapon", "quantity": 1, "isEquipped": true, "description": "Thematic starter item" },
    { "name": "Protective Attire / Armor", "type": "armor", "quantity": 1, "isEquipped": true },
    { "name": "Healing / Consumable Item", "type": "potion", "quantity": 2 },
    { "name": "Signature Keepsake / Trinket", "type": "relic", "quantity": 1 },
    { "name": "Travel Supplies / Pouch", "type": "misc", "quantity": 1 }
  ],
  "initialSpells": [
    "Signature Ability / Cantrip 1",
    "Signature Technique 2"
  ],
  "initialConditions": ["Well-Rested"],
  "startingHp": 12
}`;

      const scenario = await executeJsonPrompt<any>(
        { userPrompt: prompt, temperature: 0.9 },
        (v) => !!(v && v.title && v.storyBlurb)
      );
      // Generate initial avatar image tailored to this character
      let avatarUrl: string | undefined = undefined;
      try {
        const avatarData = await generateAvatarAI({
          characterName: scenario.heroName,
          gender: gender || scenario.gender,
          roleClass: scenario.roleClass,
          raceOrigin: scenario.raceOrigin,
          category,
          physicalDescription: scenario.physicalDescription,
          model
        });
        avatarUrl = avatarData.avatarUrl;
      } catch (_) {}

      return {
        source: 'ai',
        scenario: {
          ...scenario,
          gender: gender || scenario.gender,
          avatarUrl,
          initialInventory: (scenario.initialInventory || []).map((item: any, idx: number) => ({
            id: `item_ai_${uid()}_${idx}`,
            name: item.name || 'Equipment',
            type: item.type || 'misc',
            quantity: item.quantity || 1,
            isEquipped: !!item.isEquipped,
            description: item.description
          }))
        }
      };
    } catch (err: any) {
      const { message } = reportFeatureFailure(err, 'Scenario generation', allowFallback);
      if (!allowFallback) throw new Error(message);
    }
  } else {
    reportMissingKey('Scenario generation');
  }

  // Fallback to high-entropy procedural generator
  const scenario = generateRandomScenarioSetup(category);
  if (gender) scenario.gender = gender;
  if (characterName) scenario.heroName = characterName;
  if (classRole) scenario.roleClass = classRole;
  if (raceOrigin) scenario.raceOrigin = raceOrigin;
  return { scenario, source: 'procedural' };
}

/**
 * Regenerates fresh, dynamic seedlist ideas and tropes using AI.
 */
export async function generateSeedlistAI(params: {
  category: ExperienceCategory;
  model?: string;
}): Promise<{ seedlist: CategorySeedInfo }> {
  const { category } = params;
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const prompt = `You are a creative director for tabletop RPGs. Generate a fresh, highly imaginative brainstorm seedlist for the "${category}" genre.
Invent completely NEW tropes, themes, hooks, and 3 full starting presets.

Output MUST be strictly valid JSON matching this schema:
{
  "categoryId": "${category}",
  "categoryName": "${category.replace('_', ' ').toUpperCase()}",
  "mediaReferences": [
    "Media reference 1 (e.g. The Lord of the Rings)",
    "Media reference 2",
    "Media reference 3"
  ],
  "prompts": [
    "Immersive prompt 1",
    "Immersive prompt 2",
    "Immersive prompt 3",
    "Immersive prompt 4",
    "Immersive prompt 5"
  ]
}`;

      const seedlist = await executeJsonPrompt<CategorySeedInfo>(
        { userPrompt: prompt, temperature: 0.95 },
        (v) => Array.isArray(v?.prompts) && v.prompts.length > 0
      );
      return { seedlist };
    } catch (err: any) {
      reportFeatureFailure(err, 'Seedlist refresh', true);
    }
  } else {
    reportMissingKey('Seedlist refresh');
  }

  const c = getContent(category);
  return {
    seedlist: {
      categoryId: category,
      categoryName: c.card.name,
      mediaReferences: c.media.map((m) => `${m.title} (${m.medium})`),
      prompts: c.tropes.map((t) => t.premise)
    }
  };
}

/**
 * Rolls a single character/scenario field using AI with fallback.
 */
export async function rollSingleFieldAI(
  category: ExperienceCategory,
  fieldType: 'title' | 'heroName' | 'roleClass' | 'raceOrigin' | 'hookText',
  model?: string,
  contextPrompt?: string,
  /** When false, AI failures throw instead of returning a procedural value. */
  allowFallback = true
): Promise<string> {
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const profile = getCategoryProfile(category);
      const prompt = `You are a creative tabletop RPG generator. Generate a SINGLE unique, imaginative "${fieldType}" for a "${profile.name}" campaign.
${contextPrompt ? `Context / Story Theme: "${contextPrompt}"` : ''}
Genre Profile: ${profile.name} (${profile.voice}).
Sensory Motifs: ${profile.sensoryMotifs.slice(0, 2).join(', ')}.
Output ONLY the generated text with no extra commentary, quotes, or formatting.`;

      const text = await executeUniversalPrompt({
        userPrompt: prompt,
        temperature: 1.0,
        thinking: 'minimal',
        feature: 'Field roll'
      });

      const clean = text.trim().replace(/^["']|["']$/g, '');
      if (clean && clean.length > 1) return clean;
      throw new AIError('bad_output', 'Reply was empty.');
    } catch (err) {
      const { message } = reportFeatureFailure(err, 'Field roll', allowFallback);
      if (!allowFallback) throw new Error(message);
    }
  } else {
    reportMissingKey('Field roll');
  }

  // Fallback to procedural generator
  const setup = generateRandomScenarioSetup(category);
  if (fieldType === 'title') return setup.title;
  if (fieldType === 'heroName') return setup.heroName;
  if (fieldType === 'roleClass') return setup.roleClass;
  if (fieldType === 'raceOrigin') return setup.raceOrigin;
  return setup.storyBlurb;
}

/**
 * Pronouns are not a visual description: "portrait of she/her High Elf" confused image
 * models (PS13). Map the common sets to a visual term; leave custom pronouns out.
 */
export function pronounsToVisual(pronouns?: string): string {
  const p = (pronouns || '').toLowerCase().replace(/\s+/g, '');
  if (p.startsWith('she')) return 'feminine';
  if (p.startsWith('he/') || p === 'he') return 'masculine';
  if (p.startsWith('they')) return 'androgynous';
  return '';
}

/**
 * Generates a dramatic cartoonized profile picture character portrait.
 * Supports OpenAI DALL-E, Google Imagen, and high-fidelity Flux AI image engine.
 */
export async function generateAvatarAI(params: {
  characterName: string;
  roleClass: string;
  raceOrigin: string;
  category: ExperienceCategory;
  gender?: string;
  physicalDescription?: string;
  recentStoryContext?: string;
  model?: string;
}): Promise<{ avatarUrl: string; engine: string }> {
  const { characterName, roleClass, raceOrigin, category, gender, physicalDescription, recentStoryContext } = params;
  
  // Format prompt for dramatic cartoonized graphic novel profile picture
  const cleanDesc = physicalDescription || 'piercing expressive eyes, impeccable posture, distinctive attire';
  const storyEvolution = recentStoryContext ? `reflecting recent dramatic story events: ${recentStoryContext.slice(-200)}` : '';
  const genreTheme = (category || 'fantasy').replace('_', ' ');

  const visual = pronounsToVisual(gender);
  const imagePrompt = `dramatic cartoonised profile picture, graphic novel character portrait of ${visual ? `${visual} ` : ''}${raceOrigin} ${roleClass} named ${characterName}, ${cleanDesc}, ${storyEvolution}, ${genreTheme} aesthetic, cinematic lighting, rich shadows, cel shaded comic book art, sharp outlines, vibrant colors, centered avatar, masterpiece`;

  const seed = Math.floor(Math.random() * 999999);

  // Check active provider for direct image generation APIs
  const provider = getActiveProvider();
  const apiKey = getProviderKey(provider);

  // 1. OpenAI DALL-E 3 (if OpenAI provider key is provided)
  if (provider === 'openai' && apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'url'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.[0]?.url) {
          return { avatarUrl: data.data[0].url, engine: 'OpenAI DALL-E 3' };
        }
        reportAINotice('Portrait', 'DALL-E returned no image, so the free Flux engine (pollinations.ai) drew this portrait instead.');
      } else {
        reportAINotice('Portrait', `DALL-E refused the request (${res.status}), so the free Flux engine (pollinations.ai) drew this portrait instead.`);
      }
    } catch (e) {
      reportAINotice('Portrait', `DALL-E could not be reached (${e instanceof Error ? e.message : String(e)}), so the free Flux engine (pollinations.ai) drew this portrait instead.`);
    }
  }

  // 2. High-speed Flux Engine for dramatic cartoonized character portraits
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=768&height=768&nologo=true&seed=${seed}&model=flux`;

  return { avatarUrl: fluxUrl, engine: 'Flux (pollinations.ai)' };
}

/* -------------------------------------------------------------------------- */
/*                         CHAPTER ONE GENERATOR                              */
/* -------------------------------------------------------------------------- */

export async function generateChapterOneAI(params: {
  category: ExperienceCategory;
  storyBlurb: string;
  /** Optional: campaigns started from seeds or the offline generator have no AI outline. */
  storyOutline?: DMStoryOutline;
  characterState: any;
  model: string;
  inspiration?: CampaignInspiration;
}): Promise<ActionTurnResult> {
  const { category, storyBlurb, storyOutline, characterState, inspiration } = params;
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const basePrompt = `You are a master interactive author writing a deeply immersive Choose-Your-Own-Adventure novel in the "${category}" genre with D&D 5e mechanics.

${fullProfileBlock(category, inspiration)}

STORY PREMISE:
${storyBlurb}
${formatOutlineForPrompt(storyOutline, 'brief') ? `
DM STORY ROADMAP & INTERNAL OUTLINE (Dynamic Reference):
${formatOutlineForPrompt(storyOutline, 'brief')}
` : ''}
CREATIVE ASSIGNMENT:
Write the very first scene (Chapter One, Scene 1) of this campaign. 
Maintain genre-specific pacing based on the provided narrative profile and seed inspiration. Introduce the atmospheric setting, the immediate sensory situation, and the protagonist's starting dilemma as pitched in the premise. Do not jump to the climax unless the genre demands high-octane speed. Establish a deep, genre-appropriate tone.

GAMEPLAY GM DIRECTIVES:
- Address the player as "you". Keep the narrative in present tense.
- Faithfully reflect the category's narrative profile.

At the end, provide 3 suggested actions formatted as:
---OPTIONS---
[1] Action 1
[2] Action 2
[3] Action 3`;

      const userMessage = `Character: ${characterState?.name || 'Hero'} (Gender/Pronouns: ${characterState?.gender || 'they/them'}), a Level ${characterState?.level || 1} ${characterState?.raceOrigin || 'Human'} ${characterState?.roleClass || 'Adventurer'}.
Begin the story.`;

      let text = await executeUniversalPrompt({
        systemPrompt: basePrompt,
        userPrompt: userMessage,
        temperature: 0.9,
        feature: 'Chapter One'
      });
      const truncated = !!getLastCallMeta()?.truncated;
      if (truncated) text = stripUnterminatedBlocks(text);

      let suggestedActions: string[] = [];

      // Parse options
      const optionsMatch = text.match(/---OPTIONS---([\s\S]*)/);
      if (optionsMatch) {
        text = text.replace(/---OPTIONS---[\s\S]*/, '').trim();
        const rawOptions = optionsMatch[1].split('\n').map(line => line.trim()).filter(line => line.length > 0);
        suggestedActions = rawOptions
          .map(opt => opt.replace(/^\[\d+\]\s*/, ''))
          .filter(opt => opt.length > 0)
          .slice(0, 3);
      }

      // Cleanup
      text = text.replace(/---(STATE_UPDATE|END_STATE_UPDATE|AVATAR_EVOLUTION|END_AVATAR_EVOLUTION|COURSE_TRIGGER|END_TRIGGER|CHECK_REQUIRED|END_CHECK)---/g, '');
      text = text.trim();

      if (!text) throw new AIError('bad_output', 'Chapter One came back empty.');
      let fallbackActions = false;
      if (suggestedActions.length === 0) {
        suggestedActions = getCategoryFallbackActions(category);
        fallbackActions = true;
        if (!truncated) reportAINotice('Chapter One', 'The AI did not suggest actions for the opening, so generic ones are shown.');
      }
      if (truncated) suggestedActions = [CONTINUE_ACTION, ...suggestedActions.slice(0, 2)];

      return {
        text,
        truncated,
        fallbackActions,
        suggestedActions,
        modelUsed: getLastModelUsedLabel()
      };
    } catch (err) {
      // The caller decides: retry, or knowingly start with the premise. Nothing is substituted here.
      const { message } = reportFeatureFailure(err, 'Chapter One', false);
      return {
        text: storyBlurb,
        suggestedActions: getCategoryFallbackActions(category),
        modelUsed: OFFLINE_ENGINE_LABEL,
        failure: message
      };
    }
  }

  // Offline mode or no key (reported): open with the premise itself, labelled as such.
  reportMissingKey('Chapter One');
  return {
    text: storyBlurb,
    suggestedActions: getCategoryFallbackActions(category),
    modelUsed: OFFLINE_ENGINE_LABEL
  };
}

export const OFFLINE_ENGINE_LABEL = 'ZeroRoll offline engine (no AI)';

/* -------------------------------------------------------------------------- */
/*                         PROCEDURAL ENGINE FALLBACK                         */
/* -------------------------------------------------------------------------- */

function generateProceduralTurn(
  category: ExperienceCategory,
  contents: string,
  characterState: any,
  diceRoll?: DiceRollResult,
  targetModel?: string
): ActionTurnResult {
  const name = characterState?.name || 'Hero';

  let text = '';
  let hpDelta = 0;
  let suggestedActions: string[] = [];

  if (diceRoll) {
    if (diceRoll.isNat20) {
      text = `🎲 **CRITICAL SUCCESS (Natural 20)!** With flawless precision, ${name} executes a masterstroke. The atmosphere crackles with triumph as the challenge gives way completely.`;
      hpDelta = 0;
    } else if (diceRoll.isNat1) {
      text = `🎲 **CRITICAL FUMBLE (Natural 1)!** Misfortune strikes. Your footing slips or weapon grazes a barrier. You absorb a jarring recoil (-2 HP).`;
      hpDelta = -2;
    } else if (diceRoll.total >= 13) {
      text = `🎲 **SUCCESS (${diceRoll.total})!** You overcome the difficulty with practiced skill and resolve, securing advantageous ground.`;
      hpDelta = 0;
    } else {
      text = `🎲 **COMPLICATION (${diceRoll.total})!** The effort proves grueling. You push through, but the strain takes a minor toll (-1 HP).`;
      hpDelta = -1;
    }
  } else {
    text = `You take cautious action in the ${category.replace('_', ' ')} environment. The surroundings react to your presence as new possibilities open before you.`;
  }

  suggestedActions = [
    'Scout ahead and inspect any hidden pathways',
    'Ready your gear and search for valuable supplies',
    'Converse with nearby inhabitants or study ancient inscriptions'
  ];

  return {
    text,
    suggestedActions,
    stateDelta: hpDelta !== 0 ? { hpDelta } : null,
    modelUsed: 'ZeroRoll Offline Procedural Engine'
  };
}

/**
 * The Rules Referee (S13): its own prompt and the real character, no story narration. It
 * answers whether an action is possible, which check it takes, the DC and what it needs.
 * Its replies stay out of the narrator's transcript.
 */
export async function refereeAdjudicate(params: { action: string; character: any; category: ExperienceCategory; rulesMode: RulesMode; world?: Partial<GameWorldState> }): Promise<{ text: string; modelUsed: string }> {
  if (!hasActiveAIKey()) {
    reportMissingKey('Rules Referee');
    throw new Error('The Rules Referee needs an AI key. Add one in Settings.');
  }
  const system = [
    'You are the Rules Referee for a tabletop-style game. You do not narrate the story and you do not decide what happens.',
    'For the proposed action, answer in at most 120 words, as short plain lines:',
    'Possible: yes, no, or only if ... (say what is missing, e.g. an item the hero does not have).',
    'Check: the skill or ability, and the DC (5 very easy, 10 easy, 15 medium, 20 hard, 25 very hard).',
    'Why: one sentence.',
    'Use only the hero sheet below. Never invent items, spells or abilities the hero does not have.',
    rulesLine(params.rulesMode)
  ].join('\n');
  const user = `${currentStateBlock(params.character, params.world)}\nGenre: ${params.category}\n\nProposed action: ${params.action.trim().slice(0, 600)}`;
  try {
    const text = await executeUniversalPrompt({ systemPrompt: system, userPrompt: user, temperature: 0.3, feature: 'Rules Referee' });
    return { text: text.trim(), modelUsed: getLastModelUsedLabel() };
  } catch (err) {
    const { message } = reportFeatureFailure(err, 'Rules Referee', false);
    throw new Error(message);
  }
}
