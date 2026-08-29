import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Supported model cascade for high-availability narrative generation
const MODEL_CASCADE = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-pro-latest',
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite'
];

function getOrderedCandidateModels(requestedModel?: string): string[] {
  let initial = requestedModel || 'gemini-flash-latest';
  if (initial.startsWith('models/')) {
    initial = initial.replace('models/', '');
  }
  // Sanitize to valid active models
  if (!MODEL_CASCADE.includes(initial)) {
    if (initial.includes('pro')) initial = 'gemini-pro-latest';
    else if (initial.includes('lite')) initial = 'gemini-flash-lite-latest';
    else initial = 'gemini-flash-latest';
  }
  const unique = [initial, ...MODEL_CASCADE.filter(m => m !== initial)];
  return unique;
}

function getGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Resilient execution wrapper with fallback and retry
async function executeGeminiWithFallback(
  ai: GoogleGenAI,
  preferredModel: string,
  params: {
    contents: any;
    config?: any;
  }
): Promise<{ response: any; modelUsed: string }> {
  const candidateModels = getOrderedCandidateModels(preferredModel);
  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return { response, modelUsed: modelName };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);

        // If quota limit 0 or permanent quota violation, immediately move to next candidate model
        if (
          msg.includes('limit: 0') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('Quota exceeded') ||
          msg.includes('PERMISSION_DENIED') ||
          msg.includes('not found')
        ) {
          break;
        }

        // If 503 (demand spike) or UNAVAILABLE, fall back quickly or retry with small jitter
        const isTemporary = msg.includes('503') || msg.includes('demand') || msg.includes('UNAVAILABLE') || msg.includes('temporary');
        if (attempt === 0 && isTemporary) {
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All Gemini models are temporarily unavailable. Please try again.');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Gemini Proxy API Endpoint for AI Game Master turns & Adjudication
  app.post('/api/gemini/action', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'Gemini service is initializing. Please try again in a moment.' 
        });
      }

      const { 
        model: rawModel = 'gemini-flash-latest', 
        systemInstruction, 
        contents, 
        actionType = 'turn',
        category = 'fantasy'
      } = req.body;

      const ai = getGeminiClient(apiKey);

      // Category-specific seed inspirations matrix
      const categorySeedInspirations: Record<string, string> = {
        tiktok_drama: 'TROPES & SEEDS: DramaBox, GoodNovel, PrimeDrama tropes (undercover billionaire, sudden $50B contract slap, secret heiress reveal, anniversary divorce paper ambush, arrogant ex-fiancé humiliation, corporate boardroom takeover). Maintain fast-paced, high-stakes drama, viral reveals, and deeply satisfying main-character moments.',
        revenge: 'TROPES & SEEDS: Anti-hero vendetta sagas, GoodNovel/DramaBox revenge tropes (blood debts, hit list of 5 betrayers, returning dragon lord/disgraced general, cold calculated vengeance, dismantling corrupt family empires, satisfying retribution).',
        romantic: 'TROPES & SEEDS: GoodNovel/PrimeDrama romantic dynamics (enemies-to-lovers, star-crossed noble houses, masquerade ball secrets, contract marriage with brooding rival, witty banter, stolen glances, high-stakes court intrigue).',
        fantasy: 'TROPES & SEEDS: Classic D&D 5e campaigns (Curse of Strahd, Phandelver, Dragonlance) and iconic fantasy literature (dragon seals, ancient runes, sunken crypts, tavern quest hooks, mimic chests, wild magic, riddle doors).',
        adventure: 'TROPES & SEEDS: High-seas swashbuckling and uncharted expeditions (obsidian compasses, sunken galleons, rigging duels, rolling boulder traps, rival pirate privateers, tropical tide-caves).',
        historical_adventure: 'TROPES & SEEDS: High-stakes historical moments (Library of Alexandria scroll rescue, Edo period stormy ninja castle infiltrations, Venetian Carnival Doge conspiracies, Victorian smog pneumatic catacombs, Silk Road Caravans).',
        cozy_ghibli: 'TROPES & SEEDS: Studio Ghibli vibes (Spirited Away, Howl, Kiki, Totoro) and heartwarming adventures (flying clockwork tea bakeries, gentle giant moss golems, hearth soot sprites, soothing herbal infusions, whimsical parasol gliders).',
        horror: 'TROPES & SEEDS: r/nosleep creepypastas and survival horror games (radio tower night shift mimic broadcasts, motel rule lists with mirror bans at 3:17 AM, siren-filled foggy ghost towns, flickering sanatoriums, cassette audio logs).',
        apocalypse: 'TROPES & SEEDS: Fallout 76 wasteland survival vibes loosely (scorched ash storms, Geiger counter clicks, C.A.M.P. scrap fortifications, bottlecap trading, quirky protectron robots, glowing irradiated cryptids like Mothman/Wendigo).',
        zombie: 'TROPES & SEEDS: The Walking Dead survival tropes loosely (rusted highway gridlocks, morning mist walker hordes, rural farm/prison barricades, silent pharmacy scavenging, squeaky doors attracting hordes, scarce gasoline & crossbow bolts).',
        cosmic_horror: 'TROPES & SEEDS: Lovecraft, Wayne Barlowe, Beksiński, Junji Ito, and Annihilation shimmer (non-Euclidean geometry, iridescent violet-black voids, humming abyssal obelisks, stellar observatories finding dilating pupils, sanity-fraying glyphs).',
        psychedelic_trip: 'TROPES & SEEDS: Erowid experience vaults and sensory synesthesia media (tasting indigo chords, liquid stained-glass rivers, neon origami entities conversing in backward riddles, time-dilation loops, ego-melting geometric nexus).',
        ancient_greek: 'TROPES & SEEDS: Ancient Greek history and Homeric epics (Spartan hoplite phalanx holding the hot gates, Delphic oracle inhaling sacred laurel vapors, Minotaur bronze labyrinth with Daedalus thread, toxic Argolis hydra bogs).',
        mythology: 'TROPES & SEEDS: World religions, Norse Eddas, Egyptian Book of the Dead (Bifrost rainbow bridge frost giant siege, Anubis weighing the heart against the Feather of Ma\'at, Celtic Tír na nÓg gates, Hermetic alchemy Magnum Opus).',
        real_life: 'TROPES & SEEDS: Reddit everyday experiences (r/AskReddit, r/TalesFromTechSupport, r/talesfromthefrontdesk, r/antiwork) (grueling FAANG whiteboard tech interview panel, 2 AM 24/7 bodega night shift, chaotic emergency HOA dispute meeting, airport missed-connection sprint).'
      };

      const seedGuidance = categorySeedInspirations[category] || categorySeedInspirations.fantasy;

      // Structure system prompt based on experience context
      let fullSystemInstruction = systemInstruction || `You are the master narrative author and Game Master for a deeply engaging, interactive "Choose Your Own Adventure" (CYOA) story with tabletop D&D 5e mechanics.

CORE STORYTELLING PHILOSOPHY:
1. CHOOSE YOUR OWN ADVENTURE (CYOA) CAMPAIGN ARC:
   - Think of this experience as a rich Choose Your Own Adventure saga.
   - Start strictly at the BEGINNING (Act I, Scene 1) and guide the player progressively, scene by scene, toward their story's ultimate conclusion.
   - Pacing is paramount: Do NOT offer endgame moves or instant story climax resolutions early on. For example, dramatic endgame reveals (like stripping off an apron to casually reveal a $50 Billion Sterling Family Signet Ring, confronting the final dragon in its hoard, or exposing the grand syndicate conspiracy) MUST be earned through story progression and saved for later acts.
   - In Act I (The Beginning), the player must navigate immediate setup tasks, early dialogues, minor obstacles, room investigations, initial clues, and subtle foreshadowing.
2. REACTIVE WORLD & NARRATIVE CHOICES:
   - Describe rich, vivid, atmospheric environments matching the chosen campaign category.
   - React logically, immersively, and dramatically to player choices.
   - Keep the narrative in present tense and address the player as "you".
3. D&D 5E ADJUDICATION & STAKES:
   - Adjudicate risky or uncertain actions using authentic D&D 5e / tabletop rules.
   - When a player's action, a dangerous situation, or an environmental obstacle has a chance of failure, CALL FOR A MANDATORY CHECK with a skill and Difficulty Class (DC 10 to 20).
   - ENFORCE TRUE D&D 5E ROLL ODDS & CONSEQUENCES:
     * If a roll is BELOW the DC: It is a definitive FAILURE. Narrate real, tangible negative consequences (e.g. taking 3-10 HP damage from hazards/attacks, dropping an item, alerting foes, receiving status conditions like Poisoned/Prone/Stunned, or getting caught in a bind).
     * If Natural 1: Critical Fumble / Disaster with severe consequences.
     * If Natural 20: Critical Triumph with exceptional outcome.
     * If roll >= DC: Earned success proportional to the difficulty.
4. STRICT PACING & IMMEDIATE FOCUS:
   - Narrate the immediate 15 to 45 seconds of the player's specific action in the current location.
   - If the player speaks to an NPC, roleplay that NPC's immediate dialogue and reaction.
   - NEVER skip ahead hours or teleport the player to the final objective.
5. DYNAMIC OPTIONS GENERATION:
   - Provide 3 distinct, compelling, and grounded CYOA choices at the end of each turn that match the CURRENT story phase (Act I choices for early game, Act II for rising tension, Act III for climax/conclusions).
6. AUTHORITATIVELY MANAGE INVENTORY, SPELLS, CONDITIONS & HP:
   - Whenever the narrative awards loot, inflicts damage/healing, or applies conditions, output a state update block.
7. Always stay in character as the ultimate Game Master.

GENRE SEED INSPIRATION & ATMOSPHERE:
${seedGuidance}
Use these ideas as seed concepts for worldbuilding, twists, and dramatic flair without copying proprietary text.`;

      if (actionType === 'turn') {
        fullSystemInstruction += `\n\nCRITICAL RESPONSE & STRUCTURE FORMATS:
If character inventory, spells, conditions, HP, or location change during this turn, YOU MUST include a state update block:
---STATE_UPDATE---
HP_DELTA: <-4 or +5 or 0>
ITEMS_GAINED: ["Item Name 1", "Item Name 2"]
ITEMS_LOST: ["Item Name"]
CONDITIONS_ADDED: ["Condition Name"]
CONDITIONS_REMOVED: ["Condition Name"]
SPELLS_GAINED: ["Spell/Ability Name"]
LOCATION: <Current specific location name>
---END_STATE_UPDATE---

If this moment introduces a SUDDEN COURSE-CHANGING EVENT, SURPRISE ENCOUNTER, AMBUSH, OR DRAMATIC TURNING POINT, include:
---COURSE_TRIGGER---
TITLE: <Alert Headline, e.g., "Sudden Ambush: Shadow Stalkers" or "Structural Collapse: Crumbling Catacombs">
TYPE: <course_change | ambush | crisis | opportunity | twist>
SUBTITLE: <Dramatic 1-sentence warning>
DESCRIPTION: <Brief explanation of what suddenly changed in the course of the story>
---END_TRIGGER---

If the player MUST make an ability or skill check before they can proceed (e.g. dodging a trap, resisting poison, perceiving hidden enemies, scaling a wall, persuading a guard, casting under duress):
---CHECK_REQUIRED---
SKILL: <Skill Name, e.g. Athletics | Stealth | Perception | Arcana | Persuasion | Insight | Dexterity Saving Throw>
STAT: <str | dex | con | int | wis | cha>
DC: <Difficulty Number between 10 and 22>
REASON: <Specific reason why this check is required before proceeding>
---END_CHECK---

At the very end of your response, after describing the scene, you MUST provide exactly 3 concise suggested actions formatted as:
---OPTIONS---
[1] <Action 1>
[2] <Action 2>
[3] <Action 3>`;
      } else if (actionType === 'adjudicate') {
        fullSystemInstruction += `\nSPECIAL MODE: RULE ADJUDICATOR.
Parse the player's proposed action against current character stats and environment using D&D 5e DC standards (Easy: 10, Moderate: 13-15, Hard: 16-18, Very Hard: 20).
Output a JSON response with:
{
  "requiresRoll": true/false,
  "stat": "Strength" | "Dexterity" | "Constitution" | "Intelligence" | "Wisdom" | "Charisma",
  "skill": "Acrobatics" | "Athletics" | "Perception" | "Stealth" | "Arcana" | etc.,
  "dc": number,
  "reasoning": "brief rule justification",
  "suggestedImpact": {
    "hpChange": number (negative for damage, positive for healing),
    "addItem": "item name" or null,
    "removeItem": "item name" or null,
    "statusEffect": "effect name" or null
  }
}`;
      }

      // Formatting messages for GenAI SDK
      const formattedContents = Array.isArray(contents) ? contents.map((item: any) => {
        if (typeof item === 'string') {
          return { role: 'user', parts: [{ text: item }] };
        }
        return item;
      }) : [{ role: 'user', parts: [{ text: String(contents) }] }];

      const { response, modelUsed } = await executeGeminiWithFallback(ai, rawModel, {
        contents: formattedContents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: actionType === 'adjudicate' ? 0.2 : 0.85,
        }
      });

      let responseText = response.text || '';
      let suggestedActions: string[] = [];
      let courseChangeAlert: any = null;
      let requiredCheck: any = null;
      let stateDelta: any = null;

      if (actionType === 'turn') {
        // Parse state update if present
        if (responseText.includes('---STATE_UPDATE---')) {
          const stateMatch = responseText.match(/---STATE_UPDATE---([\s\S]*?)---END_STATE_UPDATE---/);
          if (stateMatch) {
            const stateBlock = stateMatch[1];
            const hpDeltaMatch = stateBlock.match(/HP_DELTA:\s*([+-]?\d+)/i);
            const itemsGainedMatch = stateBlock.match(/ITEMS_GAINED:\s*(\[[^\]]*\]|.+)/i);
            const itemsLostMatch = stateBlock.match(/ITEMS_LOST:\s*(\[[^\]]*\]|.+)/i);
            const conditionsAddedMatch = stateBlock.match(/CONDITIONS_ADDED:\s*(\[[^\]]*\]|.+)/i);
            const conditionsRemovedMatch = stateBlock.match(/CONDITIONS_REMOVED:\s*(\[[^\]]*\]|.+)/i);
            const spellsGainedMatch = stateBlock.match(/SPELLS_GAINED:\s*(\[[^\]]*\]|.+)/i);
            const locationMatch = stateBlock.match(/LOCATION:\s*(.+)/i);

            const parseList = (str?: string) => {
              if (!str) return [];
              try {
                if (str.trim().startsWith('[')) return JSON.parse(str);
              } catch (e) {}
              return str.split(',').map(s => s.replace(/[\[\]"']/g, '').trim()).filter(Boolean);
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

            responseText = responseText.replace(/---STATE_UPDATE---[\s\S]*?---END_STATE_UPDATE---/, '').trim();
          }
        }

        // Parse course trigger if present
        if (responseText.includes('---COURSE_TRIGGER---')) {
          const triggerMatch = responseText.match(/---COURSE_TRIGGER---([\s\S]*?)---END_TRIGGER---/);
          if (triggerMatch) {
            const triggerBlock = triggerMatch[1];
            const titleMatch = triggerBlock.match(/TITLE:\s*(.+)/i);
            const typeMatch = triggerBlock.match(/TYPE:\s*(.+)/i);
            const subtitleMatch = triggerBlock.match(/SUBTITLE:\s*(.+)/i);
            const descMatch = triggerBlock.match(/DESCRIPTION:\s*(.+)/i);

            courseChangeAlert = {
              id: `alert_${Date.now()}`,
              title: titleMatch ? titleMatch[1].trim() : 'Course-Changing Event',
              type: typeMatch ? typeMatch[1].trim().toLowerCase() : 'course_change',
              subtitle: subtitleMatch ? subtitleMatch[1].trim() : 'The situation has escalated!',
              description: descMatch ? descMatch[1].trim() : 'A major turn of events unfolds before you.',
              timestamp: new Date().toISOString()
            };
            responseText = responseText.replace(/---COURSE_TRIGGER---[\s\S]*?---END_TRIGGER---/, '').trim();
          }
        }

        // Parse required check if present
        if (responseText.includes('---CHECK_REQUIRED---')) {
          const checkMatch = responseText.match(/---CHECK_REQUIRED---([\s\S]*?)---END_CHECK---/);
          if (checkMatch) {
            const checkBlock = checkMatch[1];
            const skillMatch = checkBlock.match(/SKILL:\s*(.+)/i);
            const statMatch = checkBlock.match(/STAT:\s*(.+)/i);
            const dcMatch = checkBlock.match(/DC:\s*(\d+)/i);
            const reasonMatch = checkBlock.match(/REASON:\s*(.+)/i);

            const dcVal = dcMatch ? parseInt(dcMatch[1], 10) : 13;
            requiredCheck = {
              skill: skillMatch ? skillMatch[1].trim() : 'Perception',
              stat: statMatch ? statMatch[1].trim().toLowerCase() : 'wis',
              dc: isNaN(dcVal) ? 13 : dcVal,
              reason: reasonMatch ? reasonMatch[1].trim() : 'A check is required to determine the outcome of your action.',
              difficultyLabel: dcVal <= 10 ? 'Easy' : dcVal <= 14 ? 'Medium' : dcVal <= 18 ? 'Hard' : 'Heroic'
            };
            responseText = responseText.replace(/---CHECK_REQUIRED---[\s\S]*?---END_CHECK---/, '').trim();
          }
        } else {
          // Fallback regex detection in narrative text if the AI didn't use tags but mentioned e.g. "Roll a DC 14 Athletics check" or "Make a DC 15 Stealth check"
          const dcRegex = /(?:roll|make|requires?|give me|needs?)\s+(?:an?|your)?\s*(?:DC\s*(\d+)\s+)?([A-Za-z\s]+?)\s+(?:check|saving throw|save)(?:\s*\(?DC\s*(\d+)\)?)?/i;
          const match = responseText.match(dcRegex);
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
                reason: `The Game Master called for a ${skillRaw} check (DC ${dcVal}).`,
                difficultyLabel: dcVal <= 10 ? 'Easy' : dcVal <= 14 ? 'Medium' : dcVal <= 18 ? 'Hard' : 'Heroic'
              };
            }
          }
        }

        if (responseText.includes('---OPTIONS---')) {
          const parts = responseText.split('---OPTIONS---');
          responseText = parts[0].trim();
          const optionsBlock = parts[1] || '';
          const lines = optionsBlock.split('\n').map((l: string) => l.trim()).filter(Boolean);
          for (const line of lines) {
            const cleaned = line.replace(/^\[\d+\]\s*|^-\s*|^\d+[\.\)]\s*|^\*\s*/, '').trim();
            if (cleaned && cleaned.length > 2) {
              suggestedActions.push(cleaned);
            }
          }
        } else if (responseText.includes('[1]') || responseText.includes('[OPTION 1]')) {
          const matches = responseText.match(/(?:\[\d\]|\[OPTION \d\]:?)\s*([^\n]+)/g);
          if (matches) {
            suggestedActions = matches.map((m: string) => m.replace(/^(?:\[\d\]|\[OPTION \d\]:?)\s*/, '').trim());
            responseText = responseText.replace(/(?:---|\n\n)?(?:\[1\]|\[OPTION 1\])[\s\S]*$/, '').trim();
          }
        }

        // Guarantee 3 options are always returned
        if (suggestedActions.length < 3) {
          const fallbackOptions = [
            'Cautiously investigate the immediate surroundings',
            'Interact with the nearest entity or focal point',
            'Draw your weapon, prepare a spell, and take a guarded stance'
          ];
          while (suggestedActions.length < 3) {
            suggestedActions.push(fallbackOptions[suggestedActions.length]);
          }
        }
        suggestedActions = suggestedActions.slice(0, 3);
      }

      return res.json({ 
        text: responseText, 
        suggestedActions, 
        courseChangeAlert, 
        requiredCheck, 
        stateDelta,
        modelUsed 
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.status(500).json({ 
        error: err?.message || 'Failed to generate AI Game Master narrative. Please try again.' 
      });
    }
  });

  // AI Dynamic Encounter Generator (Level 3 Tailored Encounters)
  app.post('/api/gemini/generate-encounter', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini service is initializing.' });
      }

      const { 
        category = 'fantasy', 
        playerLevel = 3, 
        locationName = 'Unknown Location', 
        characterState, 
        model: rawModel = 'gemini-flash-latest'
      } = req.body;

      const ai = getGeminiClient(apiKey);

      const categoryEncounterSeeds: Record<string, string> = {
        tiktok_drama: 'TROPES: DramaBox/GoodNovel billionaire reveal, arrogant socialite public humiliation, luxury hotel security intervention, or hostile board takeover.',
        revenge: 'TROPES: Tracking a corrupt general on a 5-name hitlist, syndicate bounty hunter tea house ambush, or infiltrating a heavily fortified armory.',
        romantic: 'TROPES: Moonlit ballroom masquerade waltz, secret passage library rendezvous, or escaping royal guards before dawn.',
        fantasy: 'TROPES: D&D style goblin/hobgoblin river bridge ambush, crypt mimic sarcophagus trap, or arcane golem riddle trial.',
        adventure: 'TROPES: Privateer rigging boarding party, rolling jungle boulder trap, or subterranean coral tide-cave race.',
        historical_adventure: 'TROPES: Alexandria Great Library catacomb evacuation, Edo castle ninja rooftop ambush, or Victorian London pneumatic tunnel chase.',
        cozy_ghibli: 'TROPES: Studio Ghibli giant moss river spirit needing tea, clumsy wind-chime bird rescue, or mischievous soot sprite star-flour heist.',
        horror: 'TROPES: r/nosleep radio tower mimic entity, shifting porcelain mannequin hallway, or 3:17 AM motel corridor rule trial.',
        apocalypse: 'TROPES: Fallout 76 glowing irradiated mountain cryptid (Mothman/Wendigo), scavenger raider scrap bridge checkpoint, or sentry bot laser patrol.',
        zombie: 'TROPES: The Walking Dead highway gridlock walker herd, silent pharmacy glass bottle stealth hazard, or rival survivor fuel stand-off.',
        cosmic_horror: 'TROPES: Lovecraft/Beksiński star-spawn manifestation, non-Euclidean gravity room, or chanting cultists around an obsidian monolith.',
        psychedelic_trip: 'TROPES: Erowid synesthesia fractal stag riddle, liquid gravity wave navigation, or floating crystal resonance bells.',
        ancient_greek: 'TROPES: Spartan hot gates phalanx standoff, Lernean hydra swamp emergence, or Minotaur bronze labyrinth pursuit.',
        mythology: 'TROPES: Bifrost frost giant siege champion, Anubis weighing of the heart sentinel trial, or Celtic Púca shapeshifter riddle.',
        real_life: 'TROPES: Reddit dilemmas: grueling FAANG whiteboard tech panel disaster, 2 AM 24/7 bodega slushy catastrophe, or emergency HOA lawn hearing.'
      };

      const seedHint = categoryEncounterSeeds[category] || categoryEncounterSeeds.fantasy;

      const prompt = `You are a TTRPG Game Master generating a dynamic, level ${playerLevel} encounter for a "${category}" campaign experience set at "${locationName}".
Player character context: Name: ${characterState?.name || 'Hero'}, Class: ${characterState?.roleClass || 'Adventurer'}, Level: ${playerLevel}, HP: ${characterState?.hp || 28}.
Genre Seed Inspiration: ${seedHint}

Generate a structured dynamic encounter response. Output MUST be strictly valid JSON matching this schema:
{
  "encounterTitle": "Title of Encounter",
  "encounterType": "combat" | "social" | "puzzle" | "ambush",
  "narrativeIntro": "Atmospheric 2-3 sentence introduction describing what happens as the hero enters or investigates.",
  "monstersOrNpcs": [
    {
      "id": "mon_1",
      "name": "Enemy or NPC Name",
      "type": "monster" | "npc",
      "x": 8,
      "y": 4,
      "hp": 22,
      "maxHp": 22,
      "color": "#ef4444",
      "icon": "skull",
      "notes": "Threat tactics or personality"
    }
  ],
  "statCheck": {
    "skill": "Perception" | "Athletics" | "Stealth" | "Arcana" | "Persuasion" | "Investigation",
    "dc": 13,
    "reasoning": "What success or failure reveals"
  },
  "suggestedActions": [
    "Action option 1",
    "Action option 2",
    "Action option 3"
  ]
}`;

      const { response } = await executeGeminiWithFallback(ai, rawModel, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        }
      });

      const text = response.text || '{}';
      const encounterData = JSON.parse(text);
      return res.json({ encounter: encounterData });
    } catch (err: any) {
      console.error('Generate encounter error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate dynamic encounter' });
    }
  });

  // AI Dynamic Scenario Generator with full 5-field randomized setup & initial character state
  app.post('/api/gemini/generate-scenario', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini service is initializing.' });
      }

      const { 
        category = 'fantasy', 
        characterName, 
        classRole, 
        raceOrigin,
        model: rawModel = 'gemini-flash-latest'
      } = req.body;

      const ai = getGeminiClient(apiKey);

      const categoryScenarioSeedPrompt: Record<string, string> = {
        tiktok_drama: 'SEED INSPIRATION (GoodNovel / DramaBox / PrimeDrama): Undercover billionaire/heiress living humbly for 3 years, sudden luxury banquet divorce ambush, the $50B family crest/ring reveal, arrogant socialite slapping, hostile boardroom takeover, and shocking plot twists.',
        revenge: 'SEED INSPIRATION (Anti-hero vendetta sagas): Blood oath hitlist of 5 betrayers, exiled dragon lord/disgraced general returning to destroy corrupt syndicates, calculated retribution, rain-drenched rooftop standoffs.',
        romantic: 'SEED INSPIRATION (GoodNovel / PrimeDrama high-society): Enemies to lovers across warring dynasties, midnight masquerade ball waltzes, secret treaties hidden in private studies, contract marriage with a brooding rival lord.',
        fantasy: 'SEED INSPIRATION (Classic D&D 5e campaigns & fantasy epics): Cracked dragon seals, sunken eldritch crypts, tavern quest patrons, wild magic surges, mimic chests, and riddle-warded vault doors.',
        adventure: 'SEED INSPIRATION (High-seas swashbuckling): Half-obsidian compass maps, sunken pirate galleons, swinging rigging duels, uncharted coral atolls, and subterranean tide-cave races against rival privateers.',
        historical_adventure: 'SEED INSPIRATION (High-stakes historical events): Alexandria Great Library scroll evacuation in 48 BCE, stormy Edo period ninja castle infiltration, 1520 Venetian Carnival Doge assassination conspiracy, or Victorian London pneumatic subway mysteries.',
        cozy_ghibli: 'SEED INSPIRATION (Studio Ghibli & heartwarming adventures): Flying clockwork tea airships, sad giant moss river spirits needing fresh star buns, soot sprites tending warm hearths, whimsical parasol gliders.',
        horror: 'SEED INSPIRATION (r/nosleep creepypastas & survival horror): Mountain radio tower night shift mimic broadcasts, handwritten motel room rules ("never check mirrors at 3:17 AM"), siren-blanketed fog towns, flickering sanatoriums.',
        apocalypse: 'SEED INSPIRATION (Fallout 76 wasteland survival loosely): Scorched ash storms, C.A.M.P. scrap fortifications, bottlecap bartering, friendly protectron vendors, glowing irradiated cryptids (Mothman/Wendigo), cracked vault doors.',
        zombie: 'SEED INSPIRATION (The Walking Dead survival loosely): Highway car graveyard gridlocks, morning mist walker herds, rural farmstead chain-link barricades, silent hospital pharmacy runs with glass bottle hazards.',
        cosmic_horror: 'SEED INSPIRATION (H.P. Lovecraft, Barlowe, Beksiński, Junji Ito): Non-Euclidean geometry, iridescent violet-black voids, humming abyssal obelisks, stellar observatories finding dilating pupils in star charts, sanity strain.',
        psychedelic_trip: 'SEED INSPIRATION (Erowid experience vaults & sensory synesthesia): Liquid stained-glass rivers, tasting indigo frequencies, neon origami entities speaking backward riddles, kaleidoscopic horizons, ego-melting geometric nexus.',
        ancient_greek: 'SEED INSPIRATION (Ancient Greek history & Homeric epics): Spartan hoplite phalanx holding the hot gates, Delphic oracle laurel leaf vapors, Minotaur bronze labyrinth with Daedalus thread, toxic Argolis hydra bogs.',
        mythology: 'SEED INSPIRATION (World mythology & occult reading): Norse Bifrost rainbow bridge frost giant siege, Anubis weighing the heart against the Feather of Ma\'at, Celtic Tír na nÓg gates, Hermetic alchemy Magnum Opus gold transmutations.',
        real_life: 'SEED INSPIRATION (Reddit everyday experiences - r/AskReddit, r/TalesFromTechSupport, r/talesfromthefrontdesk, r/antiwork): FAANG whiteboard tech panel live server crash, 2 AM 24/7 bodega slushy/regular crisis, chaotic emergency HOA dispute meeting.'
      };

      const scenarioSeedHint = categoryScenarioSeedPrompt[category] || categoryScenarioSeedPrompt.fantasy;

      const prompt = `You are a world-class tabletop RPG Game Master and author. Generate a complete starting campaign setup for a "${category}" roleplaying experience.
CRITICAL MANDATES:
1. TRUE STORY BEGINNING (ACT 1, SCENE 1): The scenario MUST be the true opening scene of the campaign (e.g. arriving at the town gates, clocking into the morning shift, stepping off the train/ship, meeting the quest-giver in the tavern, or opening the mysterious letter).
2. NEVER drop the player into the middle of active combat, halfway through a dungeon, or at the story climax.
3. INVENT ORIGINAL 5 SETUP FIELDS: Create a completely original, evocative campaign title, a unique memorable hero name, a distinct role/class, a distinct heritage/origin, and an atmospheric opening scene.
4. Establish the starting environment, who the player is, what brought them here, and the initial quest/mystery to investigate.
5. Provide 3 opening action choices suitable for starting out.

Genre Seed Inspiration: ${scenarioSeedHint}

Output MUST be strictly valid JSON matching this schema:
{
  "title": "Evocative Title for Chapter I / The Adventure",
  "heroName": "${characterName ? characterName : 'Unique original first and last name matching the genre'}",
  "roleClass": "${classRole ? classRole : 'Unique class/archetype matching the genre'}",
  "raceOrigin": "${raceOrigin ? raceOrigin : 'Unique race/origin/heritage matching the genre'}",
  "description": "A 1-sentence logline of the adventure",
  "hookText": "An atmospheric 3-4 sentence opening scene written from the GM perspective. It sets the opening environment, explains what brought the hero here, introduces the inciting dilemma, and asks what they do first.",
  "physicalDescription": "A vivid 1-2 sentence physical description of the hero (hair, eyes, build, clothing, distinctive markings/gear)",
  "suggestedActions": [
    "Opening action choice 1",
    "Opening action choice 2",
    "Opening action choice 3"
  ],
  "initialInventory": [
    { "name": "Primary Weapon / Tool", "type": "weapon", "quantity": 1, "description": "Thematic starter item", "isEquipped": true },
    { "name": "Protective Armor / Attire", "type": "armor", "quantity": 1, "description": "Thematic starting clothing/armor", "isEquipped": true },
    { "name": "Thematic Potion / Consumable", "type": "potion", "quantity": 2, "description": "Healing or utility consumable" },
    { "name": "Unique Starter Trinket / Keepsake", "type": "relic", "quantity": 1, "description": "Story-linked keepsake or document" },
    { "name": "Travel Supplies / Currency Pouch", "type": "misc", "quantity": 1, "description": "Essential road gear" }
  ],
  "initialSpells": [
    "Signature Ability or Cantrip 1",
    "Signature Technique or Spell 2"
  ],
  "initialConditions": [
    "Well-Rested"
  ],
  "startingHp": 12,
  "maxHp": 12
}`;

      const { response } = await executeGeminiWithFallback(ai, rawModel, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.95,
        }
      });

      const text = response.text || '{}';
      const scenarioData = JSON.parse(text);
      return res.json({ scenario: scenarioData });
    } catch (err: any) {
      console.error('Generate scenario error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate dynamic starting scenario' });
    }
  });

  // AI Dynamic Seedlist Generator (Regenerate fresh brainstorming ideas for any category)
  app.post('/api/gemini/generate-seedlist', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini service is initializing.' });
      }

      const { category = 'fantasy', model: rawModel = 'gemini-flash-latest' } = req.body;
      const ai = getGeminiClient(apiKey);

      const prompt = `You are an expert TTRPG creative director. Generate fresh, highly creative seed ideas, narrative tropes, brainstorm concepts, and full 5-field campaign starter hooks for the "${category}" category.

Output MUST be strictly valid JSON matching this schema:
{
  "category": "${category}",
  "coreThemes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
  "narrativeTropes": ["Trope 1", "Trope 2", "Trope 3", "Trope 4", "Trope 5", "Trope 6"],
  "brainstormHooks": ["Concept idea 1", "Concept idea 2", "Concept idea 3", "Concept idea 4"],
  "openingHooks": [
    {
      "title": "Evocative Title 1",
      "heroName": "Thematic Hero Name",
      "roleClass": "Thematic Class",
      "raceOrigin": "Thematic Race/Origin",
      "hook": "Atmospheric 3-sentence starting scene establishing the beginning of the journey.",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    },
    {
      "title": "Evocative Title 2",
      "heroName": "Thematic Hero Name",
      "roleClass": "Thematic Class",
      "raceOrigin": "Thematic Race/Origin",
      "hook": "Atmospheric 3-sentence starting scene establishing the beginning of the journey.",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    },
    {
      "title": "Evocative Title 3",
      "heroName": "Thematic Hero Name",
      "roleClass": "Thematic Class",
      "raceOrigin": "Thematic Race/Origin",
      "hook": "Atmospheric 3-sentence starting scene establishing the beginning of the journey.",
      "suggestedActions": ["Action 1", "Action 2", "Action 3"]
    }
  ]
}`;

      const { response } = await executeGeminiWithFallback(ai, rawModel, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.95,
        }
      });

      const text = response.text || '{}';
      const seedlistData = JSON.parse(text);
      return res.json({ seedlist: seedlistData });
    } catch (err: any) {
      console.error('Generate seedlist error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to regenerate seedlist ideas' });
    }
  });

  // AI Character Avatar Generator (Generates portrait matching physical description + current story state)
  app.post('/api/gemini/generate-avatar', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini service is initializing.' });
      }

      const { 
        physicalDescription = 'Intrepid adventurer with keen eyes and tailored travel gear',
        characterName = 'Hero',
        roleClass = 'Adventurer',
        raceOrigin = 'Human',
        currentLocation = 'Starting Tavern',
        recentStorySummary = '',
        conditions = '',
        category = 'fantasy'
      } = req.body;

      const ai = getGeminiClient(apiKey);

      const avatarPrompt = `Digital art character portrait of ${characterName}, a ${raceOrigin} ${roleClass}.
Physical Description: ${physicalDescription}.
Current Setting & Narrative Context: Located at ${currentLocation}. ${recentStorySummary ? 'Recent situation: ' + recentStorySummary : ''}.
Status/Conditions: ${conditions || 'Healthy and alert'}.
Style: High fantasy & cinematic TTRPG character concept art, dramatic lighting reflecting the environment, high detail, masterpiece portrait, 1:1 square framing.`;

      // 1. Try Imagen model first for direct photo/illustration output
      try {
        const imageRes = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: avatarPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
          }
        });

        if (imageRes?.generatedImages?.[0]?.image?.imageBytes) {
          const base64Image = `data:image/jpeg;base64,${imageRes.generatedImages[0].image.imageBytes}`;
          return res.json({ avatarUrl: base64Image });
        }
      } catch (imagenErr: any) {
        console.warn('Imagen 3 portrait attempt fell back to flash model:', imagenErr?.message);
      }

      // 2. Fallback to Gemini 3.7 Flash image or vector-styled aesthetic synthesis
      try {
        const flashRes = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [{ 
            role: 'user', 
            parts: [{ 
              text: `Generate a beautiful, vibrant, detailed SVG character portrait for a ${raceOrigin} ${roleClass} named ${characterName}.
Physical traits: ${physicalDescription}.
Atmosphere/Lighting: Matches ${currentLocation}, ${category} genre theme.
Output ONLY the raw <svg> tag with viewBox="0 0 400 400" and xmlns="http://www.w3.org/2000/svg" containing a stylized portrait illustration with gradient fills and atmospheric lighting. Do not include markdown code block backticks.` 
            }] 
          }]
        });

        const svgText = flashRes.text?.trim() || '';
        if (svgText.includes('<svg') && svgText.includes('</svg>')) {
          const cleanSvg = svgText.replace(/```xml|```svg|```/g, '').trim();
          const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
          return res.json({ avatarUrl: svgBase64 });
        }
      } catch (svgErr) {
        console.warn('SVG fallback generation error:', svgErr);
      }

      // 3. Rich category-themed, character-unique geometric avatar fallback
      // Pick a color palette based on campaign category
      const categoryPalettes: Record<string, { bg1: string; bg2: string; accent1: string; accent2: string; skin: string }> = {
        fantasy:           { bg1: '#0f172a', bg2: '#1e3a5f', accent1: '#34d399', accent2: '#10b981', skin: '#fde68a' },
        adventure:         { bg1: '#0c1a2e', bg2: '#1e3a5f', accent1: '#38bdf8', accent2: '#0ea5e9', skin: '#fde8c8' },
        historical_adventure:{ bg1: '#1a1205', bg2: '#3d2800', accent1: '#d97706', accent2: '#b45309', skin: '#f0d9b5' },
        horror:            { bg1: '#0f0f0f', bg2: '#1a0000', accent1: '#dc2626', accent2: '#991b1b', skin: '#d1c0b0' },
        cozy_ghibli:       { bg1: '#1a2e1a', bg2: '#2d4a2d', accent1: '#86efac', accent2: '#4ade80', skin: '#fde68a' },
        romantic:          { bg1: '#1a0a14', bg2: '#3d0b24', accent1: '#f472b6', accent2: '#ec4899', skin: '#ffe4e6' },
        revenge:           { bg1: '#0a0a0f', bg2: '#1a1a2e', accent1: '#c084fc', accent2: '#a855f7', skin: '#cbd5e1' },
        apocalypse:        { bg1: '#1a0f00', bg2: '#3d2000', accent1: '#fb923c', accent2: '#ea580c', skin: '#d4a96a' },
        zombie:            { bg1: '#0a1205', bg2: '#1a2e0a', accent1: '#84cc16', accent2: '#65a30d', skin: '#c8d8c0' },
        cosmic_horror:     { bg1: '#030014', bg2: '#0d0a2e', accent1: '#818cf8', accent2: '#6366f1', skin: '#c4b5fd' },
        psychedelic_trip:  { bg1: '#0f0a2e', bg2: '#1a0a3d', accent1: '#f0abfc', accent2: '#e879f9', skin: '#ddd6fe' },
        tiktok_drama:      { bg1: '#0a0a0a', bg2: '#1a1a1a', accent1: '#fbbf24', accent2: '#f59e0b', skin: '#fef3c7' },
        ancient_greek:     { bg1: '#1a1400', bg2: '#3d3000', accent1: '#fcd34d', accent2: '#d97706', skin: '#f0d9b5' },
        mythology:         { bg1: '#0a0f1a', bg2: '#1a2040', accent1: '#7dd3fc', accent2: '#38bdf8', skin: '#e0d7f5' },
        real_life:         { bg1: '#0f1620', bg2: '#1e2d40', accent1: '#64748b', accent2: '#475569', skin: '#f0e8d9' }
      };
      const p = categoryPalettes[category] || categoryPalettes.fantasy;
      const initials = (characterName || 'H').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      const roleInitial = (roleClass || 'A')[0].toUpperCase();
      // Simple hash of name to slightly vary the silhouette color
      const nameHash = (characterName || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
      const hue = (nameHash * 37) % 360;

      const uniqueSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
        <defs>
          <radialGradient id="bg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stop-color="${p.bg2}" />
            <stop offset="100%" stop-color="${p.bg1}" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${p.accent1}" stop-opacity="0.3" />
            <stop offset="100%" stop-color="${p.accent1}" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${p.accent1}" />
            <stop offset="100%" stop-color="${p.accent2}" />
          </linearGradient>
        </defs>
        <!-- Background -->
        <rect width="400" height="400" fill="url(#bg)" />
        <!-- Ambient glow -->
        <circle cx="200" cy="180" r="160" fill="url(#glow)" />
        <!-- Outer ring -->
        <circle cx="200" cy="200" r="188" fill="none" stroke="${p.accent1}" stroke-width="2" stroke-opacity="0.4" />
        <circle cx="200" cy="200" r="178" fill="none" stroke="${p.accent2}" stroke-width="1" stroke-opacity="0.2" />
        <!-- Body / Armor silhouette -->
        <path d="M 130 400 L 130 290 Q 200 250 270 290 L 270 400 Z" fill="${p.accent2}" opacity="0.5" />
        <path d="M 148 400 L 148 295 Q 200 265 252 295 L 252 400 Z" fill="${p.accent1}" opacity="0.4" />
        <!-- Head -->
        <circle cx="200" cy="175" r="65" fill="${p.skin}" />
        <!-- Cheek shadow -->
        <ellipse cx="200" cy="190" rx="58" ry="52" fill="${p.skin}" opacity="0.85" />
        <!-- Eyes -->
        <ellipse cx="178" cy="172" rx="8" ry="9" fill="#1e293b" />
        <ellipse cx="222" cy="172" rx="8" ry="9" fill="#1e293b" />
        <circle cx="181" cy="170" r="2.5" fill="white" opacity="0.6" />
        <circle cx="225" cy="170" r="2.5" fill="white" opacity="0.6" />
        <!-- Subtle smile -->
        <path d="M 186 192 Q 200 202 214 192" stroke="#4b2c14" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <!-- Role class badge / shield emblem -->
        <polygon points="200,110 220,122 220,144 200,156 180,144 180,122" fill="${p.accent2}" opacity="0.7" stroke="${p.accent1}" stroke-width="2" />
        <text x="200" y="140" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="serif" font-size="18" font-weight="bold">${roleInitial}</text>
        <!-- Decorative corner runes -->
        <text x="20" y="38" fill="${p.accent1}" font-size="20" opacity="0.35" font-family="serif">✦</text>
        <text x="368" y="38" fill="${p.accent1}" font-size="20" opacity="0.35" font-family="serif">✦</text>
        <text x="20" y="390" fill="${p.accent1}" font-size="20" opacity="0.35" font-family="serif">✦</text>
        <text x="368" y="390" fill="${p.accent1}" font-size="20" opacity="0.35" font-family="serif">✦</text>
        <!-- Name plate -->
        <rect x="60" y="340" width="280" height="44" rx="6" fill="${p.bg1}" opacity="0.8" />
        <rect x="60" y="340" width="280" height="44" rx="6" fill="none" stroke="${p.accent1}" stroke-width="1.5" opacity="0.5" />
        <text x="200" y="358" text-anchor="middle" fill="${p.accent1}" font-family="sans-serif" font-size="15" font-weight="bold">${(characterName || 'Hero').slice(0, 22)}</text>
        <text x="200" y="376" text-anchor="middle" fill="${p.accent2}" font-family="sans-serif" font-size="11" opacity="0.9">${(roleClass || 'Adventurer').slice(0, 28)}</text>
      </svg>`;

      const encodedSvg = encodeURIComponent(uniqueSvg);
      return res.json({ avatarUrl: `data:image/svg+xml;utf8,${encodedSvg}` });

    } catch (err: any) {
      console.error('Avatar generation error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate character avatar' });
    }
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`D&D AI Experience Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
