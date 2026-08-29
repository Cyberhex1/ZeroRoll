import { GoogleGenAI } from '@google/genai';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  ExperienceCategory, 
  InventoryItem, 
  CourseChangeAlert, 
  PendingCheck, 
  StateDelta, 
  DiceRollResult,
  LogMessage
} from '../types';
import { generateRandomScenarioSetup, RandomizedScenarioData } from './randomScenarios';
import { generateDynamicSeedlist, CategorySeedInfo } from './seedlists';

export const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash'
];

function resolveGeminiModelName(model?: string): string {
  if (!model) return 'gemini-3.5-flash';
  const clean = model.replace('models/', '');
  if (clean.includes('pro')) return 'gemini-3.1-pro-preview';
  if (clean.includes('lite')) return 'gemini-3.1-flash-lite';
  if (clean.includes('3.6')) return 'gemini-3.6-flash';
  if (clean.includes('3.7')) return 'gemini-3.7-flash';
  return 'gemini-3.5-flash';
}

async function callGeminiWithRetry(fn: (modelName?: string) => Promise<any>, retries = 2, delay = 1500, modelIndex = 0): Promise<any> {
  const currentModel = FALLBACK_MODELS[modelIndex] || 'gemini-3.5-flash';
  try {
    return await fn(currentModel);
  } catch (err: any) {
    const isQuotaExhausted = err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
    const isUnavailable = err?.status === 503 || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
    
    // If quota is exhausted on this specific model, cascade to the next model immediately!
    if (isQuotaExhausted && modelIndex + 1 < FALLBACK_MODELS.length) {
      const nextModel = FALLBACK_MODELS[modelIndex + 1];
      console.log(`[Gemini API] Quota reached on ${currentModel}. Cascading to fallback model: ${nextModel}`);
      return callGeminiWithRetry(fn, retries, delay, modelIndex + 1);
    }

    if (retries > 0 && (isUnavailable || isQuotaExhausted)) {
      let waitMs = delay;
      const delayMatch = err?.message?.match(/retry in ([\d\.]+)s/);
      if (delayMatch && delayMatch[1]) {
        waitMs = Math.min(Math.ceil(parseFloat(delayMatch[1]) * 1000), 5000);
      }
      console.log(`[Gemini API] Retrying in ${waitMs}ms...`);
      await new Promise(r => setTimeout(r, waitMs));
      return callGeminiWithRetry(fn, retries - 1, delay * 2, modelIndex);
    }
    throw err;
  }
}

export function getStoredApiKey(): string {
  try {
    const custom = localStorage.getItem('dnd_gemini_api_key');
    if (custom && custom.trim()) return custom.trim();
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
    if (firebaseConfig && firebaseConfig.apiKey) return firebaseConfig.apiKey.trim();
  } catch (_) {}
  return '';
}

export function saveStoredApiKey(apiKey: string): void {
  try {
    if (apiKey && apiKey.trim()) {
      localStorage.setItem('dnd_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('dnd_gemini_api_key');
    }
  } catch (_) {}
}

export function getCustomApiKey(): string {
  return getStoredApiKey();
}

export function hasActiveGeminiKey(): boolean {
  return getStoredApiKey().length > 5;
}

export interface ActionTurnResult {
  text: string;
  suggestedActions: string[];
  courseChangeAlert?: CourseChangeAlert | null;
  requiredCheck?: PendingCheck | null;
  stateDelta?: StateDelta | null;
  modelUsed: string;
}

/**
 * Executes a player's narrative turn with Gemini AI.
 */
export async function executeActionTurn(params: {
  contents: string;
  category: ExperienceCategory;
  model: string;
  systemInstruction?: string;
  characterState?: any;
  diceRoll?: DiceRollResult;
}): Promise<ActionTurnResult> {
  const { contents, category, model, systemInstruction, characterState, diceRoll } = params;
    const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  // 1. Direct client-side Gemini AI Execution
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const promptInstruction = systemInstruction || `You are the master narrative author and Game Master for an interactive tabletop campaign in the "${category}" genre with D&D 5e mechanics.
Address the player as "you". Keep the narrative in present tense.
React dynamically to player choices, maintaining excitement, atmosphere, and authentic stakes.
Output a state update block if inventory, conditions, or HP change:
---STATE_UPDATE---
HP_DELTA: <-3 or +4 or 0>
ITEMS_GAINED: ["Item Name"]
ITEMS_LOST: ["Item Name"]
CONDITIONS_ADDED: ["Condition Name"]
CONDITIONS_REMOVED: ["Condition Name"]
LOCATION: <Location Name>
---END_STATE_UPDATE---

If an event changes the course of the story, output:
---COURSE_TRIGGER---
TITLE: <Alert Title>
TYPE: <course_change | ambush | crisis | opportunity | twist>
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

      const userMessage = `Character: ${characterState?.name || 'Hero'}, a Level ${characterState?.level || 1} ${characterState?.raceOrigin || 'Human'} ${characterState?.roleClass || 'Adventurer'} (HP: ${characterState?.hp || 12}/${characterState?.maxHp || 12}).
Recent Story Log:
${contents}

${diceRoll ? `[PLAYER ROLLED ${diceRoll.formula} = ${diceRoll.total} (${diceRoll.isNat20 ? 'NATURAL 20 CRITICAL SUCCESS!' : diceRoll.isNat1 ? 'NATURAL 1 CRITICAL FUMBLE!' : 'Roll result'})]` : ''}`;

      const response = await callGeminiWithRetry((m) => ai.models.generateContent({
        model: m || targetModel,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: promptInstruction,
          temperature: 0.9
        }
      }));

      let text = response.text || '';
      let suggestedActions: string[] = [];
      let courseChangeAlert: any = null;
      let requiredCheck: any = null;
      let stateDelta: any = null;

      // Parse State Update
      if (text.includes('---STATE_UPDATE---')) {
        const match = text.match(/---STATE_UPDATE---([\s\S]*?)---END_STATE_UPDATE---/);
        if (match) {
          const block = match[1];
          const hpDeltaMatch = block.match(/HP_DELTA:\s*([+-]?\d+)/i);
          const locationMatch = block.match(/LOCATION:\s*(.+)/i);
          stateDelta = {
            hpDelta: hpDeltaMatch ? parseInt(hpDeltaMatch[1], 10) : 0,
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
            title: titleMatch ? titleMatch[1].trim() : 'Story Escalation',
            type: typeMatch ? typeMatch[1].trim().toLowerCase() : 'course_change',
            subtitle: subtitleMatch ? subtitleMatch[1].trim() : 'A turning point has arrived!',
            description: descMatch ? descMatch[1].trim() : 'Events shift dynamically.',
            timestamp: new Date().toISOString()
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
          const dcVal = dcMatch ? parseInt(dcMatch[1], 10) : 13;
          requiredCheck = {
            skill: skillMatch ? skillMatch[1].trim() : 'Perception',
            stat: statMatch ? statMatch[1].trim().toLowerCase() : 'wis',
            dc: dcVal,
            reason: reasonMatch ? reasonMatch[1].trim() : 'A check is required before proceeding.',
            difficultyLabel: dcVal <= 10 ? 'Easy' : dcVal <= 14 ? 'Medium' : dcVal <= 18 ? 'Hard' : 'Heroic'
          };
          text = text.replace(/---CHECK_REQUIRED---[\s\S]*?---END_CHECK---/, '').trim();
        }
      }

      // Parse Options
      if (text.includes('---OPTIONS---')) {
        const parts = text.split('---OPTIONS---');
        text = parts[0].trim();
        const opts = parts[1] || '';
        suggestedActions = opts
          .split('\n')
          .map(l => l.replace(/^\[\d+\]\s*|^-\s*|^\d+[\.\)]\s*/, '').trim())
          .filter(l => l.length > 2);
      }

      if (suggestedActions.length < 3) {
        suggestedActions = [
          'Carefully inspect the immediate environment for hidden clues',
          'Interact directly with the nearest entity or focal point',
          'Take a guarded stance and prepare your primary ability'
        ];
      }

      return {
        text,
        suggestedActions: suggestedActions.slice(0, 3),
        courseChangeAlert,
        requiredCheck,
        stateDelta,
        modelUsed: `${targetModel} (Gemini AI Engine)`
      };
    } catch (err: any) {
      console.warn('Gemini API execution error:', err);
      // We explicitly throw here so the UI can display API errors (e.g., "API Not Enabled")
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate content'}`);
    }
  }

  // Fallback procedural turn if NO api key is provided at all
  return generateProceduralTurn(category, contents, characterState, diceRoll, targetModel);
}

/**
 * Generates a completely randomized 5-field campaign setup using Gemini AI.
 */
export async function generateScenarioAI(params: {
  category: ExperienceCategory;
  model: string;
  characterName?: string;
  classRole?: string;
  raceOrigin?: string;
}): Promise<{ scenario: RandomizedScenarioData }> {
  const { category, model, characterName, classRole, raceOrigin } = params;
  const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a master tabletop RPG Game Master and worldbuilder.
Generate a COMPLETELY ORIGINAL, randomized starting campaign setup for a "${category}" tabletop roleplaying experience.
Every single field MUST be uniquely invented and fresh (Act 1, Scene 1 opening).

${characterName ? `Hero Name to use: "${characterName}"` : 'Invent a unique, memorable first and last name.'}
${classRole ? `Class/Role to use: "${classRole}"` : 'Invent a creative class/archetype matching the genre.'}
${raceOrigin ? `Origin/Heritage to use: "${raceOrigin}"` : 'Invent an evocative race or origin.'}

Output MUST be strictly valid JSON matching this schema:
{
  "title": "Evocative Chapter I Campaign Title",
  "heroName": "First and Last Name",
  "roleClass": "Creative Class / Archetype",
  "raceOrigin": "Evocative Heritage / Origin",
  "hookText": "Atmospheric 3-4 sentence opening scene written from the GM perspective establishing who the hero is, where they arrived, and the initial dilemma.",
  "physicalDescription": "Vivid 1-2 sentence physical description of build, hair, eyes, and distinctive gear.",
  "suggestedActions": [
    "Opening action option 1",
    "Opening action option 2",
    "Opening action option 3"
  ],
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

      const response = await callGeminiWithRetry((m) => ai.models.generateContent({
        model: m || targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 1.0
        }
      }));

      const text = response.text || '{}';
      const scenario = JSON.parse(text);
      if (scenario && scenario.title && scenario.hookText) {
        return {
          scenario: {
            ...scenario,
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
      console.warn('Gemini Scenario generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate scenario'}`);
    }
  }

  // Fallback to high-entropy procedural generator if NO key provided
  const scenario = generateRandomScenarioSetup(category);
  if (characterName) scenario.heroName = characterName;
  if (classRole) scenario.roleClass = classRole;
  if (raceOrigin) scenario.raceOrigin = raceOrigin;
  return { scenario };
}

/**
 * Regenerates fresh, dynamic seedlist ideas and tropes using Gemini AI.
 */
export async function generateSeedlistAI(params: {
  category: ExperienceCategory;
  model: string;
}): Promise<{ seedlist: CategorySeedInfo }> {
  const { category, model } = params;
  const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a creative director for tabletop RPGs. Generate a fresh, highly imaginative brainstorm seedlist for the "${category}" genre.
Invent completely NEW tropes, themes, hooks, and 3 full starting presets.

Output MUST be strictly valid JSON matching this schema:
{
  "categoryId": "${category}",
  "categoryName": "${category.replace('_', ' ').toUpperCase()}",
  "seedSource": "AI Dynamic Brainstorm Engine",
  "coreThemes": [
    "Theme 1",
    "Theme 2",
    "Theme 3",
    "Theme 4"
  ],
  "narrativeTropes": [
    "Trope 1",
    "Trope 2",
    "Trope 3",
    "Trope 4",
    "Trope 5",
    "Trope 6"
  ],
  "brainstormHooks": [
    "Inciting scenario idea 1",
    "Inciting scenario idea 2",
    "Inciting scenario idea 3",
    "Inciting scenario idea 4"
  ],
  "openingHooks": [
    {
      "title": "Preset Title 1",
      "heroName": "Hero Name 1",
      "roleClass": "Role 1",
      "raceOrigin": "Origin 1",
      "hook": "Atmospheric 3-sentence opening scene.",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    },
    {
      "title": "Preset Title 2",
      "heroName": "Hero Name 2",
      "roleClass": "Role 2",
      "raceOrigin": "Origin 2",
      "hook": "Atmospheric 3-sentence opening scene.",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    },
    {
      "title": "Preset Title 3",
      "heroName": "Hero Name 3",
      "roleClass": "Role 3",
      "raceOrigin": "Origin 3",
      "hook": "Atmospheric 3-sentence opening scene.",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    }
  ]
}`;

      const response = await callGeminiWithRetry((m) => ai.models.generateContent({
        model: m || targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 1.0
        }
      }));

      const text = response.text || '{}';
      const seedlist = JSON.parse(text);
      if (seedlist && seedlist.coreThemes) {
        return { seedlist };
      }
    } catch (err: any) {
      console.warn('Gemini Seedlist generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate seedlist'}`);
    }
  }

  // Fallback to dynamic procedural seedlist if NO key provided
  const seedlist = generateDynamicSeedlist(category);
  return { seedlist };
}

/**
 * Rolls an individual field (Title, Name, Role, Race, Hook) with Gemini AI.
 */
export async function rollSingleFieldAI(category: ExperienceCategory, fieldType: 'title' | 'heroName' | 'roleClass' | 'raceOrigin' | 'hook', model = 'gemini-3.6-flash'): Promise<string> {
  const apiKey = getStoredApiKey();
  const targetModel = resolveGeminiModelName(model);

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a tabletop RPG generator. Generate a SINGLE unique, imaginative "${fieldType}" for a "${category}" campaign.
Output ONLY the generated ${fieldType} text with no extra commentary or quotes.`;

      const res = await callGeminiWithRetry((m) => ai.models.generateContent({
        model: m || targetModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 1.0 }
      }));

      const text = res.text?.trim().replace(/^["']|["']$/g, '');
      if (text && text.length > 1) return text;
    } catch (err: any) {
      console.warn('Gemini Roll Field error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to roll field'}`);
    }
  }

  // Fallback if NO key provided
  const setup = generateRandomScenarioSetup(category);
  if (fieldType === 'title') return setup.title;
  if (fieldType === 'heroName') return setup.heroName;
  if (fieldType === 'roleClass') return setup.roleClass;
  if (fieldType === 'raceOrigin') return setup.raceOrigin;
  return setup.hookText;
}

/**
 * Generates an SVG character portrait avatar with Gemini AI or category geometry.
 */
export async function generateAvatarAI(params: {
  characterName: string;
  roleClass: string;
  raceOrigin: string;
  category: ExperienceCategory;
  physicalDescription?: string;
}): Promise<{ avatarUrl: string }> {
  const { characterName, roleClass, raceOrigin, category, physicalDescription } = params;
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Generate a stylized SVG character portrait for a ${raceOrigin} ${roleClass} named ${characterName} in the "${category}" genre.
Physical details: ${physicalDescription || 'Keen observant eyes, tailored iconic travel gear'}.
Output ONLY the raw <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">...</svg> tag without markdown codeblocks.`;

      const res = await callGeminiWithRetry((m) => ai.models.generateContent({
        model: m || 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.8 }
      }));

      const text = res.text?.trim() || '';
      const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
      if (svgMatch) {
        return { avatarUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMatch[0])}` };
      }
    } catch (err: any) {
      console.warn('Gemini Avatar generation error:', err);
      throw new Error(`Gemini AI Error: ${err.message || 'Failed to generate avatar'}`);
    }
  }

  // Beautiful geometric avatar fallback if NO key provided
  const initials = (characterName || 'H').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const palettes: Record<string, [string, string, string]> = {
    fantasy: ['#0f172a', '#1e3a5f', '#10b981'],
    adventure: ['#0c1a2e', '#0284c7', '#38bdf8'],
    tiktok_drama: ['#0a0a0a', '#78350f', '#f59e0b'],
    horror: ['#18181b', '#7f1d1d', '#ef4444'],
    cozy_ghibli: ['#064e3b', '#047857', '#34d399'],
    revenge: ['#1e1b4b', '#4338ca', '#a855f7'],
    apocalypse: ['#292524', '#7c2d12', '#f97316'],
    zombie: ['#14532d', '#166534', '#84cc16'],
    cosmic_horror: ['#09090b', '#3b0764', '#c084fc'],
    psychedelic_trip: ['#4a044e', '#86198f', '#e879f9'],
    ancient_greek: ['#451a03', '#9a3412', '#fbbf24'],
    mythology: ['#172554', '#1d4ed8', '#60a5fa'],
    historical_adventure: ['#2e1065', '#6b21a8', '#eab308'],
    real_life: ['#1e293b', '#334155', '#94a3b8'],
    romantic: ['#500724', '#9d174d', '#f472b6']
  };

  const [bg1, bg2, accent] = palettes[category] || palettes.fantasy;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${bg2}" />
        <stop offset="100%" stop-color="${bg1}" />
      </radialGradient>
    </defs>
    <rect width="200" height="200" rx="16" fill="url(#g)" />
    <circle cx="100" cy="100" r="64" fill="${accent}" fill-opacity="0.15" stroke="${accent}" stroke-width="2" />
    <text x="100" y="115" font-family="serif" font-size="38" font-weight="bold" fill="${accent}" text-anchor="middle">${initials}</text>
    <text x="100" y="150" font-family="sans-serif" font-size="11" font-weight="bold" fill="#cbd5e1" text-anchor="middle" letter-spacing="1">${roleClass.toUpperCase().slice(0, 14)}</text>
  </svg>`;

  return { avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
}

function generateProceduralTurn(
  category: ExperienceCategory,
  contents: string,
  characterState: any,
  diceRoll?: DiceRollResult,
  model = 'procedural-gm'
): ActionTurnResult {
  const name = characterState?.name || 'Adventurer';
  const role = characterState?.roleClass || 'Hero';

  let outcomeText = '';
  let hpDelta = 0;

  if (diceRoll) {
    if (diceRoll.isNat20) {
      outcomeText = `🌟 **Critical Triumph (Nat 20)!** With legendary focus, ${name} executes the maneuver flawlessly! The odds break decisively in your favor.`;
      hpDelta = 2;
    } else if (diceRoll.isNat1) {
      outcomeText = `💥 **Critical Fumble (Nat 1)!** A sudden turn of misfortune catches ${name} off guard, causing a dangerous setback.`;
      hpDelta = -3;
    } else if (diceRoll.total >= 13) {
      outcomeText = `✅ **Success (Roll: ${diceRoll.total})!** Your training as a ${role} carries you through the challenge with confident execution.`;
    } else {
      outcomeText = `⚠️ **Narrow Failure (Roll: ${diceRoll.total})!** The resistance proves heavier than anticipated, forcing you to reconsider your approach.`;
      hpDelta = -2;
    }
  } else {
    outcomeText = `The atmosphere in the ${category} campaign intensifies as ${name} advances. The immediate path ahead reveals new possibilities and challenges.`;
  }

  return {
    text: outcomeText,
    suggestedActions: [
      'Carefully inspect the immediate environment for hidden clues',
      'Interact directly with the nearest entity or focal point',
      'Take a guarded stance and prepare your primary ability'
    ],
    stateDelta: hpDelta !== 0 ? { hpDelta } : null,
    modelUsed: `${model}`
  };
}
