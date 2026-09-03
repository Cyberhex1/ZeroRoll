import { GoogleGenAI } from '@google/genai';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  ExperienceCategory, 
  InventoryItem, 
  CourseChangeAlert, 
  PendingCheck, 
  StateDelta, 
  DiceRollResult,
  LogMessage,
  AvatarEvolution,
  ActionTurnResult,
  DMStoryOutline
} from '../types';
import { generateRandomScenarioSetup, RandomizedScenarioData } from './randomScenarios';
import { generateDynamicSeedlist, CategorySeedInfo, CATEGORY_SEEDLISTS } from './seedlists';
import { buildGroundedSeedContext, getCategoryNarrativeProfile } from './narrativeProfiles';
import { getCategoryFallbackActions } from './experienceHelpers';
import { AIProviderId, AI_PROVIDERS, DEFAULT_AI_PROVIDER } from './providersConfig';

// Fallback Gemini models for cascading
export const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash'
];

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

export function getProviderKey(provider: AIProviderId): string {
  try {
    // 1. Direct per-provider storage
    const perProvider = localStorage.getItem(`zeroroll_key_${provider}`);
    if (perProvider && perProvider.trim()) return perProvider.trim();

    // 2. Legacy key compatibility
    if (provider === 'gemini') {
      const legacyGemini = localStorage.getItem('dnd_gemini_api_key');
      if (legacyGemini && legacyGemini.trim()) return legacyGemini.trim();
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (envKey && envKey.trim()) return envKey.trim();
      if (firebaseConfig && firebaseConfig.apiKey) return firebaseConfig.apiKey.trim();
    }
  } catch (_) {}
  return '';
}

export function setProviderKey(provider: AIProviderId, key: string): void {
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

export function getProviderModel(provider: AIProviderId): string {
  try {
    const saved = localStorage.getItem(`zeroroll_model_${provider}`);
    if (saved && saved.trim()) return saved.trim();
  } catch (_) {}
  return AI_PROVIDERS[provider]?.defaultModel || 'gemini-3.5-flash';
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

// Export and import provider settings for cloud synchronization
export function exportAllProviderSettings(): {
  activeProvider: AIProviderId;
  providerKeys: Record<string, string>;
  providerModels: Record<string, string>;
  providerBaseUrls: Record<string, string>;
} {
  const providerKeys: Record<string, string> = {};
  const providerModels: Record<string, string> = {};
  const providerBaseUrls: Record<string, string> = {};

  const providerIds = Object.keys(AI_PROVIDERS) as AIProviderId[];
  for (const pid of providerIds) {
    const k = getProviderKey(pid);
    if (k) providerKeys[pid] = k;
    const m = getProviderModel(pid);
    if (m && m !== AI_PROVIDERS[pid]?.defaultModel) providerModels[pid] = m;
    const u = getProviderBaseUrl(pid);
    if (u && u !== AI_PROVIDERS[pid]?.defaultBaseUrl) providerBaseUrls[pid] = u;
  }

  return {
    activeProvider: getActiveProvider(),
    providerKeys,
    providerModels,
    providerBaseUrls
  };
}

export function importAllProviderSettings(settings?: {
  activeProvider?: string;
  providerKeys?: Record<string, string>;
  providerModels?: Record<string, string>;
  providerBaseUrls?: Record<string, string>;
}): void {
  if (!settings) return;
  if (settings.activeProvider && AI_PROVIDERS[settings.activeProvider as AIProviderId]) {
    setActiveProvider(settings.activeProvider as AIProviderId);
  }
  if (settings.providerKeys) {
    for (const [pid, key] of Object.entries(settings.providerKeys)) {
      if (key) setProviderKey(pid as AIProviderId, key);
    }
  }
  if (settings.providerModels) {
    for (const [pid, model] of Object.entries(settings.providerModels)) {
      if (model) setProviderModel(pid as AIProviderId, model);
    }
  }
  if (settings.providerBaseUrls) {
    for (const [pid, url] of Object.entries(settings.providerBaseUrls)) {
      if (url) setProviderBaseUrl(pid as AIProviderId, url);
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

export function hasActiveGeminiKey(): boolean {
  const provider = getActiveProvider();
  const key = getProviderKey(provider);
  // Custom local LLM might not require a key if local
  if (provider === 'custom') return true;
  return key.length > 5;
}

export function hasActiveAIKey(): boolean {
  return hasActiveGeminiKey();
}

/* -------------------------------------------------------------------------- */
/*                         MODEL RESOLUTION & HELPERS                         */
/* -------------------------------------------------------------------------- */

function resolveGeminiModelName(model?: string): string {
  if (!model) return 'gemini-3.5-flash';
  const clean = model.replace('models/', '');
  if (clean.includes('pro')) return 'gemini-3.1-pro-preview';
  if (clean.includes('lite')) return 'gemini-3.1-flash-lite';
  if (clean.includes('3.6')) return 'gemini-3.6-flash';
  if (clean.includes('3.7')) return 'gemini-3.7-flash';
  return 'gemini-3.5-flash';
}

/* -------------------------------------------------------------------------- */
/*                  UNIVERSAL CLIENT-SIDE MULTI-PROVIDER CALLER               */
/* -------------------------------------------------------------------------- */

export interface UniversalPromptOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  responseJson?: boolean;
}

/**
 * Executes a raw prompt against the currently configured AI provider.
 */
export async function executeUniversalPrompt(options: UniversalPromptOptions): Promise<string> {
  const provider = getActiveProvider();
  const apiKey = getProviderKey(provider);
  const model = getProviderModel(provider);
  const customBaseUrl = getProviderBaseUrl(provider);

  const { systemPrompt, userPrompt, temperature = 0.8, responseJson = false } = options;

  // 1. Google Gemini Provider
  if (provider === 'gemini') {
    if (!apiKey) throw new Error('Missing Google Gemini API Key. Please configure your key in Settings.');
    return callGeminiWithCascade(apiKey, model, systemPrompt, userPrompt, temperature, responseJson);
  }

  // 2. Anthropic Claude Provider (Direct client fetch)
  if (provider === 'anthropic') {
    if (!apiKey) throw new Error('Missing Anthropic API Key. Please configure your key in Settings.');
    return callAnthropicApi(apiKey, model, systemPrompt, userPrompt, temperature, responseJson);
  }

  // 3. OpenAI-Compatible Providers (OpenAI, Grok, OpenRouter, Copilot/GitHub, Custom)
  const baseUrl = customBaseUrl || AI_PROVIDERS[provider]?.defaultBaseUrl || 'https://api.openai.com/v1';
  return callOpenAICompatibleApi(provider, apiKey, baseUrl, model, systemPrompt, userPrompt, temperature, responseJson);
}

/* -------------------------------------------------------------------------- */
/*                            GEMINI IMPLEMENTATION                           */
/* -------------------------------------------------------------------------- */

async function callGeminiWithCascade(
  apiKey: string,
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  temperature: number,
  responseJson: boolean
): Promise<string> {
  const targetModel = resolveGeminiModelName(model);

  const callModel = async (modelName: string, retries = 2, delay = 1500, modelIndex = 0): Promise<string> => {
    const currentModel = modelIndex === 0 ? modelName : (FALLBACK_MODELS[modelIndex - 1] || modelName);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {
        temperature
      };
      if (systemPrompt) {
        config.systemInstruction = systemPrompt;
      }
      if (responseJson) {
        config.responseMimeType = 'application/json';
      }

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config
      });

      return response.text || '';
    } catch (err: any) {
      const isQuotaExhausted = err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
      const isUnavailable = err?.status === 503 || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');

      // Auto cascade to next model on quota exhaustion
      if (isQuotaExhausted && modelIndex < FALLBACK_MODELS.length) {
        const nextModel = FALLBACK_MODELS[modelIndex];
        console.log(`[Gemini Cascade] Quota reached on ${currentModel}. Falling back to ${nextModel}...`);
        return callModel(modelName, retries, delay, modelIndex + 1);
      }

      if (retries > 0 && (isUnavailable || isQuotaExhausted)) {
        let waitMs = delay;
        const delayMatch = err?.message?.match(/retry in ([\d\.]+)s/);
        if (delayMatch && delayMatch[1]) {
          waitMs = Math.min(Math.ceil(parseFloat(delayMatch[1]) * 1000), 5000);
        }
        await new Promise(r => setTimeout(r, waitMs));
        return callModel(modelName, retries - 1, delay * 2, modelIndex);
      }
      throw err;
    }
  };

  return callModel(targetModel);
}

/* -------------------------------------------------------------------------- */
/*                       OPENAI COMPATIBLE IMPLEMENTATION                     */
/* -------------------------------------------------------------------------- */

async function callOpenAICompatibleApi(
  provider: AIProviderId,
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  temperature: number,
  responseJson: boolean
): Promise<string> {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  // OpenRouter specific attribution headers
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://zeroroll.app';
    headers['X-Title'] = 'ZeroRoll TTRPG Engine';
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userPrompt });

  const body: any = {
    model: model || 'gpt-4o-mini',
    messages,
    temperature
  };

  if (responseJson) {
    // Only pass json_object if supported
    if (provider === 'openai' || provider === 'openrouter' || provider === 'grok') {
      body.response_format = { type: 'json_object' };
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let parsedMsg = errorBody;
    try {
      const json = JSON.parse(errorBody);
      parsedMsg = json.error?.message || json.message || errorBody;
    } catch (_) {}
    throw new Error(`[${AI_PROVIDERS[provider]?.name || provider}] API Error (${res.status}): ${parsedMsg}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return typeof content === 'string' ? content : JSON.stringify(content);
}

/* -------------------------------------------------------------------------- */
/*                          ANTHROPIC CLAUDE IMPLEMENTATION                   */
/* -------------------------------------------------------------------------- */

async function callAnthropicApi(
  apiKey: string,
  model: string,
  systemPrompt: string | undefined,
  userPrompt: string,
  temperature: number,
  responseJson: boolean
): Promise<string> {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey.trim(),
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true'
  };

  let actualUserPrompt = userPrompt;
  if (responseJson) {
    actualUserPrompt += '\n\nIMPORTANT: Respond ONLY with valid, parseable JSON with no markdown wrapping.';
  }

  const body: any = {
    model: model || 'claude-3-5-haiku-20241022',
    max_tokens: 2048,
    temperature,
    messages: [
      { role: 'user', content: actualUserPrompt }
    ]
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let parsedMsg = errorBody;
    try {
      const json = JSON.parse(errorBody);
      parsedMsg = json.error?.message || json.message || errorBody;
    } catch (_) {}
    throw new Error(`[Anthropic Claude] API Error (${res.status}): ${parsedMsg}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((c: any) => c.type === 'text');
  return textBlock?.text || '';
}

/* -------------------------------------------------------------------------- */
/*                       CONNECTION TESTER FOR THE UI                         */
/* -------------------------------------------------------------------------- */

export async function testProviderConnection(params: {
  provider: AIProviderId;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}): Promise<{ success: boolean; latencyMs: number; message: string; reply?: string }> {
  const { provider, apiKey = '', model, baseUrl } = params;
  const start = Date.now();

  try {
    const targetModel = model || AI_PROVIDERS[provider]?.defaultModel;
    let reply = '';

    if (provider === 'gemini') {
      if (!apiKey.trim()) throw new Error('API Key cannot be empty.');
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const res = await ai.models.generateContent({
        model: resolveGeminiModelName(targetModel),
        contents: [{ role: 'user', parts: [{ text: 'Respond in 3 words: Ready for Adventure!' }] }]
      });
      reply = res.text?.trim() || '';
    } else if (provider === 'anthropic') {
      if (!apiKey.trim()) throw new Error('Anthropic API Key cannot be empty.');
      reply = await callAnthropicApi(
        apiKey.trim(),
        targetModel,
        undefined,
        'Respond in 3 words: Ready for Adventure!',
        0.7,
        false
      );
    } else {
      const actualBaseUrl = baseUrl || AI_PROVIDERS[provider]?.defaultBaseUrl || 'https://api.openai.com/v1';
      reply = await callOpenAICompatibleApi(
        provider,
        apiKey.trim(),
        actualBaseUrl,
        targetModel,
        undefined,
        'Respond in 3 words: Ready for Adventure!',
        0.7,
        false
      );
    }

    const latencyMs = Date.now() - start;
    return {
      success: true,
      latencyMs,
      message: `Connected successfully in ${latencyMs}ms!`,
      reply
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      latencyMs,
      message: err.message || 'Failed to connect to provider.'
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                        GAMEPLAY AI FEATURE ENDPOINTS                       */
/* -------------------------------------------------------------------------- */

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
}): Promise<ActionTurnResult> {
  const { contents, category, model, systemInstruction, characterState, diceRoll, storyOutline } = params;
  const provider = getActiveProvider();
  const providerConfig = AI_PROVIDERS[provider];
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const narrativeCorpus = buildGroundedSeedContext(category, contents);
      // Issue #5: ALWAYS include the base GM prompt + narrative corpus +
      // story outline. The user's custom system instruction is appended as
      // a stylistic flavor on top, so the AI always has the campaign
      // context regardless of whether the user wrote a custom system
      // prompt or not.
      const basePrompt = `You are a master interactive author writing a deeply immersive Choose-Your-Own-Adventure novel in the "${category}" genre with D&D 5e mechanics.

${narrativeCorpus}

${storyOutline ? `DM STORY ROADMAP & INTERNAL OUTLINE (Dynamic Reference - NOT a rigid script):
- Starting Circumstances: ${storyOutline.startingCircumstances}
- Backstory: ${storyOutline.backstory}
- Inciting Incident: ${storyOutline.incitingIncident}
- Immediate Goal: ${storyOutline.immediateGoal}
- Key NPCs: ${storyOutline.keyNpcs?.map(n => `${n.name} (${n.role}, Motivation: ${n.motivation}${n.secret ? `, Secret: ${n.secret}` : ''})`).join('; ') || 'None'}
- Major Conflicts: ${storyOutline.majorConflicts?.join('; ') || 'None'}
- Hidden Secrets / Reveals: ${storyOutline.secretsAndReveals?.join('; ') || 'None'}
- Chapter Progression: ${storyOutline.chapters?.join(' | ') || 'None'}

ROADMAP GM PRINCIPLES:
1. DYNAMIC ADAPTATION: The outline is a living roadmap, not a railroad script. Player decisions shape reality. If the player outsmarts an obstacle, befriends an enemy, or takes an unexpected path, adapt the story organically.
2. TIMELINE INTEGRITY: What is happening right now is the present scene. Never casually reveal or treat future chapter developments as though they have already occurred.` : ''}

GAMEPLAY GM DIRECTIVES:
- Address the player as "you". Keep the narrative in present tense.
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
LOCATION: <Location Name>
---END_STATE_UPDATE---

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
---END_CHECK---

At the end, provide 3 suggested actions formatted as:
---OPTIONS---
[1] Action 1
[2] Action 2
[3] Action 3`;

      const promptInstruction = systemInstruction
        ? `${basePrompt}\n\nGM STYLE / VOICE OVERLAY (from user settings):\n${systemInstruction}`
        : basePrompt;

      const userMessage = `Character: ${characterState?.name || 'Hero'} (Gender/Pronouns: ${characterState?.gender || 'they/them'}), a Level ${characterState?.level || 1} ${characterState?.raceOrigin || 'Human'} ${characterState?.roleClass || 'Adventurer'} (HP: ${characterState?.hp || 12}/${characterState?.maxHp || 12}).
Recent Story Log:
${contents}

${diceRoll ? `[PLAYER ROLLED ${diceRoll.formula} = ${diceRoll.total} (${diceRoll.isNat20 ? 'NATURAL 20 CRITICAL SUCCESS!' : diceRoll.isNat1 ? 'NATURAL 1 CRITICAL FUMBLE!' : 'Roll result'})]` : ''}`;

      let text = await executeUniversalPrompt({
        systemPrompt: promptInstruction,
        userPrompt: userMessage,
        temperature: 0.9
      });

      let suggestedActions: string[] = [];
      let courseChangeAlert: any = null;
      let requiredCheck: any = null;
      let stateDelta: any = null;
      let avatarEvolution: AvatarEvolution | null = null;

      // Parse Avatar Evolution
      if (text.includes('---AVATAR_EVOLUTION---')) {
        const match = text.match(/---AVATAR_EVOLUTION---([\s\S]*?)---END_AVATAR_EVOLUTION---/);
        if (match) {
          const block = match[1];
          const evolvedMatch = block.match(/EVOLVED:\s*(true|yes)/i);
          const reasonMatch = block.match(/REASON:\s*(.+)/i);
          const descMatch = block.match(/PHYSICAL_DESCRIPTION:\s*(.+)/i);
          if (evolvedMatch) {
            avatarEvolution = {
              evolved: true,
              visualChangeReason: reasonMatch ? reasonMatch[1].trim() : 'Hero visually transformed after a pivotal story beat.',
              updatedPhysicalDescription: descMatch ? descMatch[1].trim() : undefined
            };
          }
          text = text.replace(/---AVATAR_EVOLUTION---[\s\S]*?---END_AVATAR_EVOLUTION---/, '').trim();
        }
      }

      // Parse State Update
      if (text.includes('---STATE_UPDATE---')) {
        const match = text.match(/---STATE_UPDATE---([\s\S]*?)---END_STATE_UPDATE---/);
        if (match) {
          const block = match[1];
          const hpDeltaMatch = block.match(/HP_DELTA:\s*([+-]?\d+)/i);
          const itemsGainedMatch = block.match(/ITEMS_GAINED:\s*(\[[^\]]*\]|.+)/i);
          const itemsLostMatch = block.match(/ITEMS_LOST:\s*(\[[^\]]*\]|.+)/i);
          const conditionsAddedMatch = block.match(/CONDITIONS_ADDED:\s*(\[[^\]]*\]|.+)/i);
          const conditionsRemovedMatch = block.match(/CONDITIONS_REMOVED:\s*(\[[^\]]*\]|.+)/i);
          const spellsGainedMatch = block.match(/SPELLS_GAINED:\s*(\[[^\]]*\]|.+)/i);
          const locationMatch = block.match(/LOCATION:\s*(.+)/i);

          const parseList = (str?: string) => {
            if (!str) return [];
            try {
              if (str.trim().startsWith('[')) return JSON.parse(str);
            } catch (e) {}
            return str.split(',').map((s: string) => s.replace(/[\[\]"']/g, '').trim()).filter(Boolean);
          };

          stateDelta = {
            hpDelta: hpDeltaMatch ? parseInt(hpDeltaMatch[1], 10) : 0,
            itemsGained: parseList(itemsGainedMatch ? itemsGainedMatch[1] : undefined),
            itemsLost: parseList(itemsLostMatch ? itemsLostMatch[1] : undefined),
            conditionsAdded: parseList(conditionsAddedMatch ? conditionsAddedMatch[1] : undefined),
            conditionsRemoved: parseList(conditionsRemovedMatch ? conditionsRemovedMatch[1] : undefined),
            spellsGained: parseList(spellsGainedMatch ? spellsGainedMatch[1] : undefined),
            locationUpdate: locationMatch ? locationMatch[1].trim() : undefined
          };
          text = text.replace(/---STATE_UPDATE---[\s\S]*?---END_STATE_UPDATE---/, '').trim();
        }
      }

      // Parse Course Trigger
      if (text.includes('---COURSE_TRIGGER---')) {
        const match = text.match(/---COURSE_TRIGGER---([\s\S]*?)---END_TRIGGER---/);
        if (match) {
          const block = match[1];
          const titleMatch = block.match(/TITLE:\s*(.+)/i);
          const typeMatch = block.match(/TYPE:\s*(.+)/i);
          const subtitleMatch = block.match(/SUBTITLE:\s*(.+)/i);
          const descMatch = block.match(/DESCRIPTION:\s*(.+)/i);
          courseChangeAlert = {
            id: `alert_${Date.now()}`,
            title: titleMatch ? titleMatch[1].trim() : 'Story Shift',
            type: (typeMatch ? typeMatch[1].trim() : 'course_change') as any,
            subtitle: subtitleMatch ? subtitleMatch[1].trim() : 'A turning point unfolds',
            description: descMatch ? descMatch[1].trim() : 'The circumstances of your adventure have evolved.'
          };
          text = text.replace(/---COURSE_TRIGGER---[\s\S]*?---END_TRIGGER---/, '').trim();
        }
      }

      // Parse Check Required
      if (text.includes('---CHECK_REQUIRED---')) {
        const match = text.match(/---CHECK_REQUIRED---([\s\S]*?)---END_CHECK---/);
        if (match) {
          const block = match[1];
          const skillMatch = block.match(/SKILL:\s*(.+)/i);
          const statMatch = block.match(/STAT:\s*(.+)/i);
          const dcMatch = block.match(/DC:\s*(\d+)/i);
          const reasonMatch = block.match(/REASON:\s*(.+)/i);
          requiredCheck = {
            skill: skillMatch ? skillMatch[1].trim() : 'Perception',
            stat: (statMatch ? statMatch[1].trim().toLowerCase() : 'wis') as any,
            dc: dcMatch ? parseInt(dcMatch[1], 10) : 12,
            reason: reasonMatch ? reasonMatch[1].trim() : 'Resolve the challenge.'
          };
          text = text.replace(/---CHECK_REQUIRED---[\s\S]*?---END_CHECK---/, '').trim();
        }
      } else {
        // Fallback regex detection in narrative text if the AI didn't use tags but mentioned e.g. "Roll a DC 14 Athletics check" or "Make a DC 15 Stealth check"
        const dcRegex = /(?:roll|make|requires?|give me|needs?)\s+(?:an?|your)?\s*(?:DC\s*(\d+)\s+)?([A-Za-z\s]+?)\s+(?:check|saving throw|save)(?:\s*\(?DC\s*(\d+)\)?)?/i;
        const match = text.match(dcRegex);
        if (match) {
          const dcStr = match[1] || match[3] || '13';
          const skillRaw = match[2].trim();
          if (skillRaw && skillRaw.length < 30 && !skillRaw.toLowerCase().includes('initiative')) {
            const dcVal = parseInt(dcStr, 10) || 13;
            let statGuess: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' = 'wis';
            const sLow = skillRaw.toLowerCase();
            if (sLow.includes('athletic') || sLow.includes('strength')) statGuess = 'str';
            else if (sLow.includes('acrobat') || sLow.includes('stealth') || sLow.includes('dexter') || sLow.includes('sleight')) statGuess = 'dex';
            else if (sLow.includes('constitution') || sLow.includes('endurance')) statGuess = 'con';
            else if (sLow.includes('arcana') || sLow.includes('history') || sLow.includes('investig') || sLow.includes('nature') || sLow.includes('religion') || sLow.includes('intel')) statGuess = 'int';
            else if (sLow.includes('persua') || sLow.includes('decept') || sLow.includes('intimid') || sLow.includes('perform') || sLow.includes('charis')) statGuess = 'cha';

            requiredCheck = {
              skill: skillRaw,
              stat: statGuess,
              dc: dcVal,
              reason: `The Game Master called for a ${skillRaw} check (DC ${dcVal}).`
            };
          }
        }
      }

      // Parse Options
      if (text.includes('---OPTIONS---')) {
        const parts = text.split('---OPTIONS---');
        text = parts[0].trim();
        const optionsBlock = parts[1] || '';
        const lines = optionsBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        suggestedActions = lines
          .map(l => l.replace(/^\[\d+\]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim())
          .filter(l => l.length > 0);
      }

      // Fallback suggested actions — pull from category-flavored pool
      // instead of the old hardcoded "investigate / speak / ready" trio.
      if (suggestedActions.length === 0) {
        suggestedActions = getCategoryFallbackActions(category);
      }

      const activeModelName = getProviderModel(provider);
      return {
        text,
        suggestedActions: suggestedActions.slice(0, 3),
        courseChangeAlert,
        requiredCheck,
        stateDelta,
        avatarEvolution,
        modelUsed: `${providerConfig?.name || provider} (${activeModelName})`
      };
    } catch (err: any) {
      console.warn('AI execution error, falling back to procedural:', err);
      throw new Error(`${providerConfig?.name || 'AI'} Error: ${err.message || 'Failed to generate content'}`);
    }
  }

  // Fallback procedural turn if NO api key is provided
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
}): Promise<{ scenario: RandomizedScenarioData }> {
  const { category, model, userPrompt, gender, characterName, classRole, raceOrigin } = params;
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const narrativeCorpus = buildGroundedSeedContext(category, userPrompt);
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

      const rawText = await executeUniversalPrompt({
        userPrompt: prompt,
        temperature: 0.9,
        responseJson: true
      });

      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      const scenario = JSON.parse(cleanJson);
      if (scenario && scenario.title && scenario.storyBlurb) {
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
          scenario: {
            ...scenario,
            gender: gender || scenario.gender,
            avatarUrl,
            initialInventory: (scenario.initialInventory || []).map((item: any, idx: number) => ({
              id: `item_ai_${Date.now()}_${idx}`,
              name: item.name || 'Equipment',
              type: item.type || 'misc',
              quantity: item.quantity || 1,
              isEquipped: !!item.isEquipped,
              description: item.description
            }))
          }
        };
      }
    } catch (err: any) {
      console.warn('Scenario AI generation error, falling back to procedural:', err);
    }
  }

  // Fallback to high-entropy procedural generator
  const scenario = generateRandomScenarioSetup(category);
  if (gender) scenario.gender = gender;
  if (characterName) scenario.heroName = characterName;
  if (classRole) scenario.roleClass = classRole;
  if (raceOrigin) scenario.raceOrigin = raceOrigin;
  return { scenario };
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

      const rawText = await executeUniversalPrompt({
        userPrompt: prompt,
        temperature: 0.95,
        responseJson: true
      });

      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      const seedlist = JSON.parse(cleanJson);
      if (seedlist && seedlist.prompts && seedlist.prompts.length > 0) {
        return { seedlist };
      }
    } catch (err: any) {
      console.warn('Seedlist AI generation error, falling back to static:', err);
    }
  }

  return { seedlist: CATEGORY_SEEDLISTS[category] || CATEGORY_SEEDLISTS.fantasy };
}

/**
 * Rolls a single character/scenario field using AI with fallback.
 */
export async function rollSingleFieldAI(
  category: ExperienceCategory,
  fieldType: 'title' | 'heroName' | 'roleClass' | 'raceOrigin' | 'hookText',
  model?: string,
  contextPrompt?: string
): Promise<string> {
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const profile = getCategoryNarrativeProfile(category);
      const prompt = `You are a creative tabletop RPG generator. Generate a SINGLE unique, imaginative "${fieldType}" for a "${profile.name}" campaign.
${contextPrompt ? `Context / Story Theme: "${contextPrompt}"` : ''}
Genre Profile: ${profile.name} (${profile.voice}).
Sensory Motifs: ${profile.sensoryMotifs.slice(0, 2).join(', ')}.
Output ONLY the generated text with no extra commentary, quotes, or formatting.`;

      const text = await executeUniversalPrompt({
        userPrompt: prompt,
        temperature: 1.0
      });

      const clean = text.trim().replace(/^["']|["']$/g, '');
      if (clean && clean.length > 1) return clean;
    } catch (err) {
      console.warn(`Roll ${fieldType} AI error, fallback to procedural:`, err);
    }
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
}): Promise<{ avatarUrl: string }> {
  const { characterName, roleClass, raceOrigin, category, gender, physicalDescription, recentStoryContext } = params;
  
  // Format prompt for dramatic cartoonized graphic novel profile picture
  const cleanDesc = physicalDescription || 'piercing expressive eyes, impeccable posture, distinctive attire';
  const storyEvolution = recentStoryContext ? `reflecting recent dramatic story events: ${recentStoryContext.slice(-200)}` : '';
  const genreTheme = (category || 'fantasy').replace('_', ' ');

  const imagePrompt = `dramatic cartoonised profile picture, graphic novel character portrait of ${gender ? `${gender} ` : ''}${raceOrigin} ${roleClass} named ${characterName}, ${cleanDesc}, ${storyEvolution}, ${genreTheme} aesthetic, cinematic lighting, rich shadows, cel shaded comic book art, sharp outlines, vibrant colors, centered avatar, masterpiece`;

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
          return { avatarUrl: data.data[0].url };
        }
      }
    } catch (e) {
      console.warn('OpenAI DALL-E generation error, using Flux engine:', e);
    }
  }

  // 2. High-speed Flux Engine for dramatic cartoonized character portraits
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=768&height=768&nologo=true&seed=${seed}&model=flux`;

  return { avatarUrl: fluxUrl };
}

/* -------------------------------------------------------------------------- */
/*                         CHAPTER ONE GENERATOR                              */
/* -------------------------------------------------------------------------- */

export async function generateChapterOneAI(params: {
  category: ExperienceCategory;
  storyBlurb: string;
  storyOutline: DMStoryOutline;
  characterState: any;
  model: string;
}): Promise<ActionTurnResult> {
  const { category, storyBlurb, storyOutline, characterState, model } = params;
  const hasKey = hasActiveGeminiKey();

  if (hasKey) {
    try {
      const basePrompt = `You are a master interactive author writing a deeply immersive Choose-Your-Own-Adventure novel in the "${category}" genre with D&D 5e mechanics.

STORY PREMISE:
${storyBlurb}

DM STORY ROADMAP & INTERNAL OUTLINE (Dynamic Reference):
- Starting Circumstances: ${storyOutline.startingCircumstances}
- Backstory: ${storyOutline.backstory}
- Inciting Incident: ${storyOutline.incitingIncident}
- Immediate Goal: ${storyOutline.immediateGoal}
- Key NPCs: ${storyOutline.keyNpcs?.map(n => `${n.name} (${n.role})`).join('; ') || 'None'}
- Chapter Progression: ${storyOutline.chapters?.join(' | ') || 'None'}

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
        temperature: 0.9
      });

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

      return {
        text: text || "Your journey begins.",
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : ['Observe the surroundings', 'Examine your gear', 'Take a tentative step forward'],
        modelUsed: model
      };
    } catch (err) {
      console.warn('generateChapterOneAI error, falling back:', err);
    }
  }

  // Fallback
  return {
    text: storyBlurb,
    suggestedActions: ['Look around', 'Check equipment', 'Begin the journey'],
    modelUsed: 'Procedural Generator'
  };
}

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
  const hp = characterState?.hp || 12;
  const name = characterState?.name || 'Hero';
  const role = characterState?.roleClass || 'Adventurer';

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
