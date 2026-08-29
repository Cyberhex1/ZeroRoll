import { GoogleGenAI } from '@google/genai';
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
import { generateDynamicSeedlist, CategorySeedInfo, CATEGORY_SEEDLISTS } from './seedlists';

function getStoredApiKey(): string {
  try {
    const custom = localStorage.getItem('dnd_gemini_api_key');
    if (custom && custom.trim()) return custom.trim();
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
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

export interface ActionTurnResult {
  text: string;
  suggestedActions: string[];
  courseChangeAlert?: CourseChangeAlert | null;
  requiredCheck?: PendingCheck | null;
  stateDelta?: StateDelta | null;
  modelUsed: string;
}

/**
 * Executes a player's narrative turn.
 * Tries server proxy -> direct client-side GenAI -> robust procedural fallback.
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

  // 1. Try server proxy endpoint first (works in dev / Node server)
  try {
    const res = await fetch('/api/gemini/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        actionType: 'turn',
        category,
        systemInstruction,
        contents
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.text,
        suggestedActions: data.suggestedActions || [],
        courseChangeAlert: data.courseChangeAlert,
        requiredCheck: data.requiredCheck,
        stateDelta: data.stateDelta,
        modelUsed: data.modelUsed || model
      };
    }
  } catch (_) {
    // Backend unavailable or 405 static hosting - fallback below
  }

  // 2. Try direct client-side Gemini if API Key is available
  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a tabletop Game Master for a ${category} campaign.
Player character: ${characterState?.name || 'Hero'} (${characterState?.raceOrigin || 'Human'} ${characterState?.roleClass || 'Adventurer'}).
Recent story context:
${contents}

${diceRoll ? `The player made a roll: ${diceRoll.formula} = ${diceRoll.total} (${diceRoll.isNat20 ? 'CRITICAL SUCCESS (Nat 20)' : diceRoll.isNat1 ? 'CRITICAL FUMBLE (Nat 1)' : 'Roll result'}).` : ''}

Narrate the immediate 15-45 seconds of the scene. If a skill check is needed, mention it. Provide 3 suggested actions at the end formatted as:
---OPTIONS---
[1] Option 1
[2] Option 2
[3] Option 3`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      let text = response.text || '';
      let suggestedActions: string[] = [];

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
          'Carefully assess your immediate surroundings for hidden dangers',
          'Interact directly with the nearest NPC or notable feature',
          'Ready your equipment and prepare an action'
        ];
      }

      return {
        text,
        suggestedActions: suggestedActions.slice(0, 3),
        modelUsed: 'gemini-2.5-flash'
      };
    } catch (clientErr) {
      console.warn('Client-side Gemini call failed, using procedural story engine:', clientErr);
    }
  }

  // 3. Robust procedural fallback Game Master engine (Works offline & without 405 error)
  return generateProceduralTurn(category, contents, characterState, diceRoll, model);
}

/**
 * Procedural narrative generator for seamless offline / zero-405 gameplay.
 */
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
  let newCheck: PendingCheck | null = null;
  let newAlert: CourseChangeAlert | null = null;

  if (diceRoll) {
    if (diceRoll.isNat20) {
      outcomeText = `🌟 **Critical Triumph (Nat 20)!** With flawless precision and unyielding focus, ${name} executes the maneuver with legendary mastery. The tension in the air breaks in your favor, creating a decisive opening.`;
      hpDelta = 2;
    } else if (diceRoll.isNat1) {
      outcomeText = `💥 **Critical Fumble (Nat 1)!** A sudden twist of misfortune throws your plan into disarray! A stray hazard catches you off balance, leaving you momentarily exposed to immediate danger.`;
      hpDelta = -3;
      newAlert = {
        id: `alert_${Date.now()}`,
        title: 'Dangerous Setback!',
        subtitle: 'A critical miscalculation has shifted the odds against you.',
        type: 'crisis',
        description: 'You must swiftly adapt your footing before the opposition takes full advantage.',
        timestamp: new Date().toISOString()
      };
    } else if (diceRoll.total >= 13) {
      outcomeText = `✅ **Success (Roll: ${diceRoll.total})!** Your training as a ${role} proves decisive. You overcome the obstacle cleanly and press onward into the next phase of the encounter.`;
    } else {
      outcomeText = `⚠️ **Narrow Failure (Roll: ${diceRoll.total})!** Despite your best efforts, the difficulty of the task proves steeper than anticipated. You take minor damage from the struggle.`;
      hpDelta = -2;
    }
  } else {
    // General narrative progression
    const narrativeAtmospheres: Record<ExperienceCategory, string[]> = {
      fantasy: [
        `The torchlight flickers against the ancient masonry, casting long dancing shadows across the damp stone. Faint chanting echoes from the chamber beyond, accompanied by the distinct scent of ozone and burning incense.`,
        `A brisk wind rustles the ancient oaks outside the tavern. The local patrons murmur in hushed tones, casting curious glances in your direction as you consider your next move.`
      ],
      adventure: [
        `Salty sea spray mist blankets the wooden deck as the ship cuts through the dark swell. On the horizon, the jagged silhouette of the reef fortress comes into view.`,
        `The jungle canopy thickens, muffling all sound except the distant rush of a hidden waterfall and the clicking of uncharted wildlife.`
      ],
      tiktok_drama: [
        `The crystal chandeliers of the Grand Mirage ballroom hum with low conversation. Several arrogant heirs exchange knowing glances, oblivious to the sealed inheritance documents in your coat pocket.`,
        `Your phone buzzes with a high-priority encrypted ping. The security team has taken their positions at the banquet entrance, awaiting your signal.`
      ],
      revenge: [
        `Rain drums rhythmically against the corrugated roof above. You check your list of names, crossing off another contact as the night draws colder.`,
        `The alleyway falls silent except for the steady drip of stormwater. Footsteps approach from around the brick corner.`
      ],
      cozy_ghibli: [
        `Warm steam rises from the copper kettle on the stove. Little soot sprites scurry under the wooden floorboards, leaving a trail of shimmering cinnamon dust.`,
        `A gentle moss golem tilts its head, blinking its round amber eyes curiously as it offers you a bundle of freshly picked star-flowers.`
      ],
      horror: [
        `The fluorescent light tube hums with a sickly buzz, flickering out for three long seconds before buzzing back to life. A faint scratching sounds behind the wallpaper.`,
        `A cold draft sweeps through the empty corridor, carrying the faint metallic scent of old radio equipment.`
      ],
      apocalypse: [
        `Geiger counters click steadily at 0.12 rads/sec as the ash storm blows across the rusted highway overpass. A protectron vendor beeps cheerily from a scrap barricade.`,
        `You scan the ruined horizon through your binoculars, spotting smoke rising from a scavenger encampment two miles north.`
      ],
      zombie: [
        `The supermarket aisles are eerie and still. Shattered glass crunches beneath your boots, and a distant groan echoes from the pharmaceutical storage room.`,
        `You crouch behind a rusted minivan as a small herd of walkers shuffles past along the overgrown country lane.`
      ],
      cosmic_horror: [
        `The geometry of the vaulted ceiling seems to subtly twist when viewed from the corner of your eye. Violet luminescence pulses behind the obsidian monolith.`,
        `A low harmonic vibration resonates in the marrow of your bones, whispering ancient cosmic syllables that defy ordinary tongue.`
      ],
      psychedelic_trip: [
        `The horizon ripples in kaleidoscopic waves of indigo and molten gold. A neon origami entity perches on a floating geometric pillar, bowing in silent greeting.`,
        `Time dilates gently, allowing you to perceive the harmonic ripples of sound as vibrant rings of emerald light.`
      ],
      ancient_greek: [
        `The hot Mediterranean sun beats down upon the white marble colonnade. Laurel leaves rustle in the temple courtyard as the bronze braziers burn with aromatic herbs.`,
        `Distant Spartan war horns sound from the mountain pass, signaling the shifting tides of the battle below.`
      ],
      mythology: [
        `Rainbow light glimmers along the crystal arches of the Bifrost. Heimdall leans upon his great sword, observing the realms with keen golden eyes.`,
        `The river of souls flows quietly beneath the vaulted stone gates of the underworld, guarded by colossal jackal-headed sentinels.`
      ],
      historical_adventure: [
        `The scent of aged papyrus and cedar oil fills the Great Library hall as scholars rush to bundle precious scrolls before the harbor fires spread.`,
        `Fog rolls off the Venetian canals, cloaking the gondolas in velvet shadow as the clock on St. Mark's tower strikes midnight.`
      ],
      real_life: [
        `The fluorescent lights of the 24/7 boardroom buzz overhead as the projection screen flashes the final technical metrics of the critical presentation.`,
        `The coffee machine hisses loudly in the breakroom as coworkers rush past with binders, anxious for the morning review meeting to begin.`
      ],
      romantic: [
        `Soft candlelight illuminates the private alcove as the chamber orchestra plays a delicate waltz in the grand ballroom beyond.`,
        `A cool evening breeze carries the scent of night-blooming jasmine through the open terrace doors as your companion pauses, waiting for your reply.`
      ]
    };

    const choices = narrativeAtmospheres[category] || narrativeAtmospheres.fantasy;
    outcomeText = choices[Math.floor(Math.random() * choices.length)];
  }

  // Generate 3 contextual options
  const suggestedActions = [
    'Cautiously investigate the immediate surroundings for hidden clues',
    'Interact directly with the nearest person or focal point',
    'Take a defensive posture and prepare your primary ability'
  ];

  return {
    text: outcomeText,
    suggestedActions,
    courseChangeAlert: newAlert,
    requiredCheck: newCheck,
    stateDelta: hpDelta !== 0 ? { hpDelta } : null,
    modelUsed: `${model} (Direct Engine)`
  };
}

/**
 * Generates a full 5-field randomized scenario.
 */
export async function generateScenarioAI(params: {
  category: ExperienceCategory;
  model: string;
  characterName?: string;
  classRole?: string;
  raceOrigin?: string;
}): Promise<{ scenario: RandomizedScenarioData }> {
  const { category, model, characterName, classRole, raceOrigin } = params;

  // 1. Try server proxy
  try {
    const res = await fetch('/api/gemini/generate-scenario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, model, characterName, classRole, raceOrigin })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.scenario) return data;
    }
  } catch (_) {}

  // 2. Direct client-side procedural generator (always returns unique 5 fields)
  const scenario = generateRandomScenarioSetup(category);
  if (characterName) scenario.heroName = characterName;
  if (classRole) scenario.roleClass = classRole;
  if (raceOrigin) scenario.raceOrigin = raceOrigin;

  return { scenario };
}

/**
 * Regenerates fresh, dynamic seedlist ideas.
 */
export async function generateSeedlistAI(params: {
  category: ExperienceCategory;
  model: string;
}): Promise<{ seedlist: CategorySeedInfo }> {
  const { category, model } = params;

  // 1. Try server proxy
  try {
    const res = await fetch('/api/gemini/generate-seedlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, model })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.seedlist) return data;
    }
  } catch (_) {}

  // 2. Procedurally generate dynamic fresh seedlist
  const seedlist = generateDynamicSeedlist(category);
  return { seedlist };
}

/**
 * Generates an SVG character portrait avatar.
 */
export async function generateAvatarAI(params: {
  characterName: string;
  roleClass: string;
  raceOrigin: string;
  category: ExperienceCategory;
}): Promise<{ avatarUrl: string }> {
  // 1. Try server proxy
  try {
    const res = await fetch('/api/gemini/generate-avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.avatarUrl) return data;
    }
  } catch (_) {}

  // 2. Client-side SVG Generator with category palette
  const { characterName, roleClass, category } = params;
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
      <radialGradient id="grad" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${bg2}" />
        <stop offset="100%" stop-color="${bg1}" />
      </radialGradient>
    </defs>
    <rect width="200" height="200" rx="16" fill="url(#grad)" />
    <circle cx="100" cy="100" r="64" fill="${accent}" fill-opacity="0.15" stroke="${accent}" stroke-width="2" />
    <text x="100" y="115" font-family="serif" font-size="38" font-weight="bold" fill="${accent}" text-anchor="middle">${initials}</text>
    <text x="100" y="150" font-family="sans-serif" font-size="11" font-weight="bold" fill="#cbd5e1" text-anchor="middle" letter-spacing="1">${roleClass.toUpperCase().slice(0, 14)}</text>
  </svg>`;

  const avatarUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return { avatarUrl };
}
