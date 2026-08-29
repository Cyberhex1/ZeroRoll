import { ExperienceCategory, MapData, MapToken, TerrainMarker, CharacterSheet, GameWorldState } from '../types';

export interface ScenarioHookResult {
  title: string;
  category: ExperienceCategory;
  description: string;
  hookText: string;
  character: CharacterSheet;
  gameWorldState: GameWorldState;
  suggestedActions: string[];
  mapData: MapData;
}

// 1. Fantasy Hook - Act 1, Scene 1: Arrival at the Frontier Village
export function generateFantasyHook(heroName = 'Valerius Starfall', classRole = 'Eldritch Knight'): ScenarioHookResult {
  return {
    title: 'The Prophecy of Sunken Aethelgard: Chapter I',
    category: 'fantasy',
    description: 'The beginning of a classic D&D journey: arriving at the frontier village of Oakhaven as rumors of cracked dragon seals stir.',
    hookText: `The morning mist hangs low over the cobblestone crossroads of Oakhaven Village. As ${heroName}, a Level 1 ${classRole}, you shoulder your traveling pack and adjust your runic sword at your hip after weeks on the road. Smoke rises from the chimney of the Prancing Griffin Tavern, where Village Elder Bram stands outside waiting for brave wanderers to answer his urgent summons.`,
    suggestedActions: [
      'Approach Elder Bram outside the tavern to learn about the urgent summons',
      'Step into the Prancing Griffin Tavern to gather local rumors and buy supplies',
      'Inspect the ancient runic boundary stone at the village gates (Arcana / History Check)'
    ],
    character: {
      id: `char_fantasy_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'High Elf',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 15,
      initiativeBonus: 2,
      stats: { str: 15, dex: 14, con: 14, int: 14, wis: 12, cha: 10 },
      inventory: [
        { id: 'f1', name: 'Runic Longsword', type: 'weapon', quantity: 1, isEquipped: true, description: 'A family heirloom blade with faint dormant runes.' },
        { id: 'f2', name: 'Chain Shirt & Travel Cloak', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'f3', name: 'Healing Potion', type: 'potion', quantity: 2 },
        { id: 'f4', name: 'Pouch of 15 Gold Coins', type: 'misc', quantity: 1 },
        { id: 'f5', name: 'Explorer\'s Pack & Rations', type: 'misc', quantity: 1 }
      ],
      spells: ['Shield', 'Magic Missile', 'Light', 'Mage Hand'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'An aspiring knight who has traveled to the frontier to investigate ancient prophecies.'
    },
    gameWorldState: {
      currentLocation: 'Oakhaven Village Crossroads',
      timeOfDay: 'Morning Mist',
      activeQuest: 'Speak with Elder Bram at the Prancing Griffin Tavern',
      dangerLevel: 'Safe',
      customNotes: 'Villagers are whispering about strange purple flares seen in the night sky.'
    },
    mapData: createFantasyStartingMap()
  };
}

// 2. Adventure Hook - Act 1, Scene 1: Arrival at the Pirate Port
export function generateAdventureHook(heroName = 'Captain Cora Vane', classRole = 'Swashbuckler Explorer'): ScenarioHookResult {
  return {
    title: 'The Obsidian Compass Expedition: Chapter I',
    category: 'adventure',
    description: 'Setting sail on an uncharted expedition from the bustling harbor of Port Tempest.',
    hookText: `Salt spray fills the morning air as ${heroName} steps off the gangplank onto the bustling wooden docks of Port Tempest. In your coat pocket rests a weathered sea chart and an obsidian compass needle you recently acquired. The harbor is alive with shouting dockworkers, squawking gulls, and merchant sloops preparing for the outbound tide.`,
    suggestedActions: [
      'Visit the Salty Kraken Tavern to recruit a trustworthy navigator and deckhands',
      'Examine the obsidian compass needle against the harbor landmarks (Investigation Check)',
      'Inspect the supply crates at the quartermaster dock before boarding your sloop'
    ],
    character: {
      id: `char_adv_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human',
      level: 1,
      hp: 11,
      maxHp: 11,
      armorClass: 14,
      initiativeBonus: 3,
      stats: { str: 12, dex: 16, con: 12, int: 13, wis: 13, cha: 15 },
      inventory: [
        { id: 'a1', name: 'Polished Brass Cutlass', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'a2', name: 'Flintlock Pistol & Powder Horn', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'a3', name: 'Obsidian Compass Needle & Sea Chart', type: 'relic', quantity: 1 },
        { id: 'a4', name: 'Traveler\'s Sea Chest & Spyglass', type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A daring navigator seeking the legendary sunken fleet of the Obsidian Atolls.'
    },
    gameWorldState: {
      currentLocation: 'Port Tempest Docks',
      timeOfDay: 'Morning High Tide',
      activeQuest: 'Assemble Crew & Provisions for the Outbound Voyage',
      dangerLevel: 'Safe',
      customNotes: 'Rumors say privateer cutters are patrolling the outer reefs.'
    },
    mapData: createGenericStartingMap('forest', 'Port Tempest Docks')
  };
}

// 3. Historical Adventure Hook - Act 1, Scene 1: Arrival at the Mountain Checkpoint
export function generateHistoricalAdventureHook(heroName = 'Kenjiro Sato', classRole = 'Master Ronin'): ScenarioHookResult {
  return {
    title: 'Shadows of the Shogunate: Chapter I',
    category: 'historical_adventure',
    description: 'The journey begins at dawn as you approach the guarded mountain pass into Kyoto province.',
    hookText: `The first rays of sunlight pierce through the morning mist over the mountain tea house at the foot of the Kyoto Pass. ${heroName}, a wandering ${classRole}, adjusts the wooden straw hat keeping the morning dew off your shoulders. Secured beneath your kimono is a sealed bamboo tube containing an imperial decree that you must safely deliver to the provincial magistrate.`,
    suggestedActions: [
      'Stop at the mountain tea house to ask the proprietor about the road conditions ahead',
      'Observe the imperial guard patrol stationed at the barrier gate (Perception Check)',
      'Check the wax seal on your bamboo dispatch tube to ensure it remains untouched'
    ],
    character: {
      id: `char_hist_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human (Edo Era)',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 15,
      initiativeBonus: 2,
      stats: { str: 14, dex: 15, con: 14, int: 12, wis: 14, cha: 10 },
      inventory: [
        { id: 'h1', name: 'Folded-Steel Katana', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'h2', name: 'Wakizashi Short Sword', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'h3', name: 'Sealed Bamboo Dispatch Tube', type: 'misc', quantity: 1 },
        { id: 'h4', name: 'Traveler\'s Woven Straw Hat & Flask', type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A disciplined wanderer entrusted with delivering a critical dispatch across contested territory.'
    },
    gameWorldState: {
      currentLocation: 'Kyoto Pass Mountain Tea House',
      timeOfDay: 'Early Morning Dawn',
      activeQuest: 'Safely Navigate the Kyoto Mountain Checkpoint',
      dangerLevel: 'Safe',
      customNotes: 'A quiet morning, though travelers whisper of bandits in the high bamboo passes.'
    },
    mapData: createGenericStartingMap('forest', 'Kyoto Mountain Pass')
  };
}

// 4. Horror Hook - Act 1, Scene 1: Arrival at the Secluded Mountain Outpost
export function generateHorrorHook(heroName = 'Father Silas Vane', classRole = 'Inquisitor Hunter'): ScenarioHookResult {
  return {
    title: 'The Mystery of Blackwood Ridge: Chapter I',
    category: 'horror',
    description: 'Arriving at dusk at the isolated pine forest outpost as the fog begins to roll in.',
    hookText: `Dusk settles over the dense pines of Blackwood Ridge as the cool mountain breeze rustles the dry autumn leaves. ${heroName}, carrying a brass lantern and leather satchel of protective relics, steps up the wooden porch of the secluded caretaker lodge. A handwritten note tacked to the front door bears your name, left by the missing forest ranger.`,
    suggestedActions: [
      'Read the handwritten note pinned to the cabin door (Investigation Check)',
      'Light your brass lantern and unlock the cabin to set up your baseline camp',
      'Scan the surrounding forest tree line with your silver rosary in hand (Perception Check)'
    ],
    character: {
      id: `char_horr_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 13,
      initiativeBonus: 1,
      stats: { str: 10, dex: 12, con: 12, int: 14, wis: 16, cha: 12 },
      inventory: [
        { id: 'hr1', name: 'Silver Heavy Crossbow & 15 Bolts', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'hr2', name: 'Brass Oil Lantern', type: 'misc', quantity: 1 },
        { id: 'hr3', name: 'Vials of Blessed Holy Water', type: 'potion', quantity: 2 },
        { id: 'hr4', name: 'Silver Inquisitor Rosary & Journal', type: 'relic', quantity: 1 }
      ],
      spells: ['Detect Evil', 'Light', 'Bless', 'Sanctuary'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'Called to investigate the sudden disappearance of the Blackwood forestry survey team.'
    },
    gameWorldState: {
      currentLocation: 'Blackwood Cabin Porch',
      timeOfDay: 'Twilight Dusk',
      activeQuest: 'Investigate the Cabin & Find the Ranger\'s Logbook',
      dangerLevel: 'Safe',
      customNotes: 'The forest is unusually quiet. No bird calls or insect chirping.'
    },
    mapData: createGenericStartingMap('eldritch', 'Blackwood Cabin')
  };
}

// 5. Cozy Ghibli Hook - Act 1, Scene 1: Opening the Floating Tea Bakery
export function generateCozyGhibliHook(heroName = 'Mimi & Pip', classRole = 'Spirit Baker'): ScenarioHookResult {
  return {
    title: 'The Flying Tea Shop & The Meadow Spirits: Chapter I',
    category: 'cozy_ghibli',
    description: 'Starting a peaceful, heartwarming morning in your floating tea shop high above the green hills.',
    hookText: `Golden morning sunlight filters through the stained-glass windows of your flying clockwork tea shop. ${heroName}, accompanied by your glowing little spirit fox Pip, tie on your linen apron as the kettle begins to whistle with sweet chamomile aroma. Outside the open hatch, the tea shop gently anchors near the blossom-filled hills of Clover Valley, where gentle meadow spirits are waking up.`,
    suggestedActions: [
      'Bake a fresh tray of star-honey cinnamon rolls to welcome the morning spirits',
      'Step out onto the meadow grass with Pip to greet the local flower spirits',
      'Check your grandmother\'s magical recipe journal for today\'s herbal blend'
    ],
    character: {
      id: `char_ghib_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Woodland Hearthling',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 12,
      initiativeBonus: 2,
      stats: { str: 10, dex: 14, con: 13, int: 14, wis: 16, cha: 15 },
      inventory: [
        { id: 'g1', name: 'Carved Oak Rolling Pin', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'g2', name: 'Basket of Star-Flour & Honey Pastries', type: 'potion', quantity: 4 },
        { id: 'g3', name: 'Glider Parasol & Tea Kettle', type: 'misc', quantity: 1 }
      ],
      spells: ['Warmth Spark', 'Mend Spirit', 'Gentle Breeze', 'Plant Whisper'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A heartwarming baker traveling across floating islands to bring joy with enchanted tea.'
    },
    gameWorldState: {
      currentLocation: 'Clover Valley Meadow Anchor',
      timeOfDay: 'Bright Sunny Morning',
      activeQuest: 'Open the Bakery & Welcome the Meadow Spirits',
      dangerLevel: 'Safe',
      customNotes: 'The breeze carries the chime of meadow bells.'
    },
    mapData: createGenericStartingMap('ghibli', 'Clover Valley')
  };
}

// 6. Romantic Hook - Act 1, Scene 1: Arrival at the Venetian Ball
export function generateRomanticHook(heroName = 'Lady Aurelia Rose', classRole = 'Court Bard'): ScenarioHookResult {
  return {
    title: 'The Venetian Masquerade & Secret Vows: Chapter I',
    category: 'romantic',
    description: 'Arriving at the grand palace gates for the opening of the annual Venetian masquerade ball.',
    hookText: `Gilded gondolas glide along the shimmering Grand Canal under the evening lanterns of Venice. ${heroName}, wearing an elegant velvet mask and holding an engraved silver invitation, steps onto the marble landing of Palais de L\'Amour. From within the grand ballroom, soft violin waltzes echo across the water as noble guests and diplomats begin to arrive.`,
    suggestedActions: [
      'Present your engraved silver invitation to the Grand Chamberlain at the palace entrance',
      'Mingle among the arriving masquerade guests to listen for court gossip (Insight Check)',
      'Step out onto the moonlit canal terrace to admire the palace gardens'
    ],
    character: {
      id: `char_rom_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Half-Elf Noble',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 13,
      initiativeBonus: 2,
      stats: { str: 9, dex: 15, con: 11, int: 13, wis: 13, cha: 16 },
      inventory: [
        { id: 'r1', name: 'Silver-Strung Pocket Lute', type: 'misc', quantity: 1 },
        { id: 'r2', name: 'Jeweled Stiletto Dagger', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'r3', name: 'Velvet Masquerade Mask & Invitation', type: 'misc', quantity: 1 }
      ],
      spells: ['Charm Person', 'Disguise Self', 'Guidance', 'Friends'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'Attending the grand seasonal ball to navigate high-society intrigue and romance.'
    },
    gameWorldState: {
      currentLocation: 'Palais de L\'Amour Grand Canal Steps',
      timeOfDay: 'Evening Dusk',
      activeQuest: 'Enter the Grand Ballroom & Establish Court Introductions',
      dangerLevel: 'Safe',
      customNotes: 'Noble families from across the provinces are gathering in full masquerade attire.'
    },
    mapData: createGenericStartingMap('cozy', 'Palais Steps')
  };
}

// 7. Revenge Hook - Act 1, Scene 1: Arrival in the City to Hunt the First Target
export function generateRevengeHook(heroName = 'Kaelen Thorne', classRole = 'Shadow Avenger'): ScenarioHookResult {
  return {
    title: 'The Red Vow of Iron Cross: Chapter I',
    category: 'revenge',
    description: 'Arriving by train into the rain-slick city of Iron Cross to begin tracking down the first betrayer.',
    hookText: `Steam hisses from the locomotive as ${heroName} steps onto the rain-slick platform of Iron Cross Central Station. In your trench coat pocket rests a crisp parchment listing the five syndicate heads who framed your guild. Tonight marks your first night back in the city after years in exile, and your underground informant has arranged a quiet meeting at a corner diner across the plaza.`,
    suggestedActions: [
      'Cross the station plaza to meet your informant at the corner diner',
      'Check your concealed blades and survey the platform for syndicate watchers (Perception Check)',
      'Review your map of the city\'s five merchant districts to plan your route'
    ],
    character: {
      id: `char_rev_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Tiefling',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 14,
      initiativeBonus: 3,
      stats: { str: 14, dex: 16, con: 14, int: 12, wis: 12, cha: 10 },
      inventory: [
        { id: 'rv1', name: 'Concealed Shadow Dagger', type: 'weapon', quantity: 2, isEquipped: true },
        { id: 'rv2', name: 'Reinforced Leather Trench Coat', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'rv3', name: 'Untouched List of the Five Betrayers', type: 'misc', quantity: 1 }
      ],
      spells: ['Hunter\'s Mark', 'Pass Without Trace', 'Thaumaturgy'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A disciplined avenger returning to the city to methodically dismantle the corrupt syndicate.'
    },
    gameWorldState: {
      currentLocation: 'Iron Cross Central Station Plaza',
      timeOfDay: 'Rainy Night',
      activeQuest: 'Meet Informant Jax at the Plaza Diner to Identify Target #1',
      dangerLevel: 'Safe',
      customNotes: 'City guards patrol the main avenues while syndicate enforcers operate in the shadows.'
    },
    mapData: createGenericStartingMap('dungeon', 'Station Plaza')
  };
}

// 8. Apocalypse Hook - Act 1, Scene 1: Exiting the Bunker Airlock
export function generateApocalypseHook(heroName = 'Maya Steel', classRole = 'Wasteland Scavenger'): ScenarioHookResult {
  return {
    title: 'The Wasteland Horizon: Chapter I',
    category: 'apocalypse',
    description: 'Emerging from the reinforced shelter airlock into the vast, quiet expanse of the reclaimed wasteland.',
    hookText: `Hydraulic gears grind as the massive blast doors of Shelter 44 hiss open, letting in fresh desert air for the first time in years. ${heroName}, carrying a scavenged rifle and a calibrated Geiger counter, steps out onto the sunlit ridge overlooking the Rust Valley. In the distance, the wind turbines of the New Horizon trading outpost spin slowly against the clear blue sky.`,
    suggestedActions: [
      'Check the Geiger counter readings and calibrate your moisture recycler',
      'Use your brass binoculars to scout the path down toward the New Horizon Trading Outpost',
      'Inspect the abandoned roadside checkpoint at the base of the ridge (Investigation Check)'
    ],
    character: {
      id: `char_apoc_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human Scavenger',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 14,
      initiativeBonus: 2,
      stats: { str: 13, dex: 15, con: 14, int: 13, wis: 14, cha: 10 },
      inventory: [
        { id: 'ap1', name: 'Scavenged Lever-Action Rifle', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'ap2', name: 'Patchwork Wasteland Duster', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'ap3', name: 'Purified Water Canteen & 3 Rations', type: 'potion', quantity: 3 },
        { id: 'ap4', name: 'Handheld Geiger Counter', type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A resourceful survivor stepping out into the wasteland to establish trade routes.'
    },
    gameWorldState: {
      currentLocation: 'Shelter 44 Ridge Overlook',
      timeOfDay: 'Morning Sun',
      activeQuest: 'Trek to the New Horizon Trading Outpost',
      dangerLevel: 'Safe',
      customNotes: 'Radiation levels on the ridge are clear and within safe limits.'
    },
    mapData: createGenericStartingMap('desert', 'Shelter 44 Ridge')
  };
}

// 9. Zombie Hook - Act 1, Scene 1: The Initial Outbreak Alert
export function generateZombieHook(heroName = 'Dr. Marcus Drake', classRole = 'Outbreak Survivor Specialist'): ScenarioHookResult {
  return {
    title: 'Outbreak Protocol: Chapter I',
    category: 'zombie',
    description: 'Starting in the hospital research laboratory as the first unusual quarantine alert is broadcast.',
    hookText: `Fluorescent lights hum peacefully in the virology research wing of St. Jude\'s Memorial Hospital. ${heroName}, wearing a lab coat with your security badge clipped to your pocket, reviews the morning patient bloodwork. Suddenly, the hospital intercom crackles to life with a priority Code Silver alert: quarantine teams have sealed the East Wing triage unit, and staff are requested to secure their laboratory doors.`,
    suggestedActions: [
      'Log into the hospital terminal to review the emergency triage intake logs (Investigation Check)',
      'Gather your emergency first-aid kit and secure the laboratory keycard access',
      'Look through the reinforced hallway observation window to assess the situation'
    ],
    character: {
      id: `char_zomb_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human',
      level: 1,
      hp: 11,
      maxHp: 11,
      armorClass: 13,
      initiativeBonus: 2,
      stats: { str: 11, dex: 14, con: 13, int: 16, wis: 13, cha: 11 },
      inventory: [
        { id: 'z1', name: 'Heavy Steel Flashlight & Scalpel', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'z2', name: 'Trauma First Aid Kit', type: 'potion', quantity: 2 },
        { id: 'z3', name: 'Hospital Master Keycard & Comm Radio', type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A dedicated physician determined to understand the mysterious outbreak and protect patients.'
    },
    gameWorldState: {
      currentLocation: 'St. Jude Hospital Virology Lab',
      timeOfDay: 'Late Evening Shift',
      activeQuest: 'Investigate the Code Silver Alert & Secure Sample Vials',
      dangerLevel: 'Safe',
      customNotes: 'The lab floor is currently secure. Emergency lights blink in the hallway.'
    },
    mapData: createGenericStartingMap('cyber', 'Hospital Virology Lab')
  };
}

// 10. Cosmic Horror Hook - Act 1, Scene 1: Arrival at the University Archives
export function generateCosmicHorrorHook(heroName = 'Dr. Arthur Pendelton', classRole = 'Occult Astronomer'): ScenarioHookResult {
  return {
    title: 'The Shadow over Miskatonic: Chapter I',
    category: 'cosmic_horror',
    description: 'Arriving on a quiet rainy evening at the university archives following a cryptic telegram from a colleague.',
    hookText: `Rain taps softly against the leaded glass windows of Miskatonic University Library. ${heroName}, clutching an umbrella and an urgent telegram from Professor Armitage, steps through the heavy oak doors into the warm, book-scented archive room. The head archivist looks up from behind his lamp-lit desk, holding a wooden key to the rare manuscript vault.`,
    suggestedActions: [
      'Show Armitage\'s telegram to the head archivist to request the rare manuscript catalog',
      'Examine the antique celestial globe in the library corner for strange star markings (Investigation Check)',
      'Sit at the reading desk to transcribe the notes sent in Armitage\'s letter'
    ],
    character: {
      id: `char_cosm_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 12,
      initiativeBonus: 1,
      stats: { str: 10, dex: 12, con: 11, int: 16, wis: 15, cha: 12 },
      inventory: [
        { id: 'c1', name: 'Antique Pocket Revolver (Unloaded)', type: 'weapon', quantity: 1, isEquipped: false },
        { id: 'c2', name: 'Magnifying Glass & Translation Notebook', type: 'misc', quantity: 1 },
        { id: 'c3', name: 'Armitage\'s Telegram & Wax Seal', type: 'relic', quantity: 1 }
      ],
      spells: ['Guidance', 'Comprehend Languages', 'Detect Magic'],
      statusEffects: ['Well-Rested', 'Sanity: 100/100'],
      backgroundNotes: 'An academic scholar called to decipher an astronomical anomaly recorded in ancient texts.'
    },
    gameWorldState: {
      currentLocation: 'Miskatonic University Rare Book Archives',
      timeOfDay: 'Rainy Evening',
      activeQuest: 'Locate Professor Armitage\'s Research Journal in the Vault',
      dangerLevel: 'Safe',
      customNotes: 'A quiet, scholarly atmosphere with ticking grandfather clocks.'
    },
    mapData: createGenericStartingMap('eldritch', 'University Archives')
  };
}

// 11. Psychedelic Trip Hook - Act 1, Scene 1: Stepping Across the Rainbow Threshold
export function generatePsychedelicTripHook(heroName = 'Zephyr Synapse', classRole = 'Chroma Shaman'): ScenarioHookResult {
  return {
    title: 'The Kaleidoscope Nexus: Chapter I',
    category: 'psychedelic_trip',
    description: 'Stepping across the threshold of perception into the harmonious, kaleidoscopic Prism Realm.',
    hookText: `A doorway of warm, iridescent light opens before you, dissolving the walls of the mundane world into shimmering ripples of indigo and gold. ${heroName}, carrying a crystal chime staff, takes your very first step across the threshold into the Meadow of Synesthesia. The air hums with gentle musical notes, and floating origami blossoms unfold in harmony with your breathing.`,
    suggestedActions: [
      'Ring your crystal chime staff to harmonize with the meadow\'s ambient melody',
      'Observe the shifting fractal patterns along the rainbow river path (Perception Check)',
      'Reach out gently to communicate with a floating origami spirit entity'
    ],
    character: {
      id: `char_psych_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Dimensional Wanderer',
      level: 1,
      hp: 11,
      maxHp: 11,
      armorClass: 13,
      initiativeBonus: 3,
      stats: { str: 10, dex: 15, con: 12, int: 14, wis: 16, cha: 15 },
      inventory: [
        { id: 'ps1', name: 'Crystal Chime Staff', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'ps2', name: 'Vial of Luminous Aurora Water', type: 'potion', quantity: 2 },
        { id: 'ps3', name: 'Prismatic Prism Pendant', type: 'relic', quantity: 1 }
      ],
      spells: ['Color Spark', 'Harmonic Whisper', 'Gentle Levitation'],
      statusEffects: ['Well-Rested', 'Expanded Awareness'],
      backgroundNotes: 'A voyager exploring the tranquil realms of expanded consciousness and art.'
    },
    gameWorldState: {
      currentLocation: 'The Meadow of Synesthesia',
      timeOfDay: 'Timeless Dawn',
      activeQuest: 'Harmonize with the First Chord of the Prism Realm',
      dangerLevel: 'Safe',
      customNotes: 'Colors resonate with soothing musical chords.'
    },
    mapData: createGenericStartingMap('cyber', 'Prism Meadow')
  };
}

// 12. TikTok Short Drama Hook - Act 1, Scene 1: The Morning of the Grand Gala
export function generateTikTokDramaHook(heroName = 'Sienna Sterling', classRole = 'Undercover Heiress'): ScenarioHookResult {
  return {
    title: 'The Secret Heiress\'s 3-Year Test: Chapter I',
    category: 'tiktok_drama',
    description: 'Starting the morning shift at the Grand Mirage Hotel as the 3-year undercover loyalty test reaches its final day.',
    hookText: `The morning sun sparkles off the gilded glass towers of the Grand Mirage Hotel. ${heroName}, dressed in a simple banquet staff uniform, arrives for the morning shift with your secret heiress seal safely tucked in your leather tote bag. Today marks the exact end of your 3-year undercover test, and tonight your fiancé Damon is hosting his corporate gala where your true family will arrive.`,
    suggestedActions: [
      'Review the VIP banquet seating chart to see who is attending the evening gala',
      'Speak with the friendly head chef in the kitchen to prepare the banquet room',
      'Check your encrypted phone for the arrival confirmation from your family\'s security team'
    ],
    character: {
      id: `char_tiktok_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Undercover Heiress',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 12,
      initiativeBonus: 2,
      stats: { str: 10, dex: 14, con: 12, int: 15, wis: 14, cha: 16 },
      inventory: [
        { id: 'tk1', name: 'Sterling Family Crest Signet Ring (Concealed)', type: 'relic', quantity: 1 },
        { id: 'tk2', name: 'Grand Mirage Hotel Staff ID Lanyard', type: 'misc', quantity: 1 },
        { id: 'tk3', name: 'Encrypted Phone with Private Bank App', type: 'misc', quantity: 1 }
      ],
      spells: ['Insightful Observation', 'Graceful Composure', 'Authoritative Presence'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'Completing the final day of a 3-year humble trial before stepping into the family chairman role.'
    },
    gameWorldState: {
      currentLocation: 'Grand Mirage Hotel Lobby & Staff Wing',
      timeOfDay: 'Morning Prep',
      activeQuest: 'Complete Morning Banquet Prep & Prepare for the Gala',
      dangerLevel: 'Safe',
      customNotes: 'Staff are bustling as luxury cars begin arriving at the hotel valet.'
    },
    mapData: createGenericStartingMap('cozy', 'Hotel Grand Lobby')
  };
}

// 13. Ancient Greek Hook - Act 1, Scene 1: Sunrise at the Temple of Delphi
export function generateAncientGreekHook(heroName = 'Perseus of Sparta', classRole = 'Hoplite Hero'): ScenarioHookResult {
  return {
    title: 'The Oracle\'s Prophecy: Chapter I',
    category: 'ancient_greek',
    description: 'Arriving at the sacred marble terraces of Delphi at sunrise to receive the divine oracle.',
    hookText: `Golden sunlight bathes the white marble columns of the Temple of Apollo on Mount Parnassus. ${heroName}, a young Spartan ${classRole} bearing a bronze spear and polished aspis shield, ascends the sacred stone stairs after a long pilgrimage. Laurel smoke drifts from the temple doorway where the high priestess Pythia prepares to deliver the morning prophecy.`,
    suggestedActions: [
      'Offer a tribute of olive oil and barley at the temple altar to request an audience',
      'Speak to the Spartan herald waiting on the temple terrace for news from home',
      'Inspect the bronze dedications and mythic murals along the Sacred Way (History Check)'
    ],
    character: {
      id: `char_greek_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Spartan Demigod',
      level: 1,
      hp: 13,
      maxHp: 13,
      armorClass: 16,
      initiativeBonus: 1,
      stats: { str: 16, dex: 13, con: 15, int: 11, wis: 13, cha: 12 },
      inventory: [
        { id: 'ag1', name: 'Forged Bronze Dory Spear', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'ag2', name: 'Bronze Aspis Shield & Linothorax Armor', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'ag3', name: 'Flask of Olive Oil & Traveler\'s Bread', type: 'potion', quantity: 2 }
      ],
      spells: ['Spartan Courage', 'Athena\'s Guidance'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A brave Spartan sent by his elders to seek the wisdom of the gods before embarking on his trials.'
    },
    gameWorldState: {
      currentLocation: 'Temple of Apollo Terrace, Delphi',
      timeOfDay: 'Golden Sunrise',
      activeQuest: 'Enter the Inner Sanctum to Hear the Oracle\'s Words',
      dangerLevel: 'Safe',
      customNotes: 'Pilgrims and philosophers gather quietly on the sunlit marble steps.'
    },
    mapData: createGenericStartingMap('forest', 'Temple of Delphi')
  };
}

// 14. Mythology Hook - Act 1, Scene 1: Dawn on the Bifrost Approach
export function generateMythologyHook(heroName = 'Freya Stormweaver', classRole = 'Valkyrie Champion'): ScenarioHookResult {
  return {
    title: 'The Bifrost Watch: Chapter I',
    category: 'mythology',
    description: 'Beginning your morning watch upon the rainbow bridge overlooking the golden towers of Asgard.',
    hookText: `The shimmering crystalline tiles of the Bifrost Bridge glow with prismatic light beneath the morning aurora. ${heroName}, a newly anointed ${classRole} carrying a runic spear and silver-winged aegis, reports to the golden observatory at the bridge\'s head. Heimdall, guardian of the realm, turns with a welcoming nod as he peers through the morning clouds toward the Nine Realms.`,
    suggestedActions: [
      'Greet Heimdall and receive today\'s celestial watch assignments',
      'Peer through the golden observatory spyglass toward Midgard and Jotunheim (Perception Check)',
      'Inscribe a rune of warding along your aegis shield before stepping onto your patrol route'
    ],
    character: {
      id: `char_myth_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Valkyrie Spirit',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 15,
      initiativeBonus: 2,
      stats: { str: 15, dex: 14, con: 14, int: 12, wis: 14, cha: 13 },
      inventory: [
        { id: 'm1', name: 'Runic Silver Spear', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'm2', name: 'Valkyrie Aegis Shield', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'm3', name: 'Mead Horn & Rations of Idunn', type: 'potion', quantity: 2 }
      ],
      spells: ['Rune Ward', 'Bifrost Shimmer', 'Valhalla Guidance'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A dedicated guardian taking up her duties to protect the realm from encroaching perils.'
    },
    gameWorldState: {
      currentLocation: 'Bifrost Golden Observatory',
      timeOfDay: 'Morning Aurora',
      activeQuest: 'Confer with Heimdall & Begin the Morning Watch',
      dangerLevel: 'Safe',
      customNotes: 'Peaceful dawn light reflects across the golden towers of Asgard.'
    },
    mapData: createGenericStartingMap('snow', 'Bifrost Observatory')
  };
}

// 15. Real Life Hook - Act 1, Scene 1: Morning Arrival at the Assignment
export function generateRealLifeHook(heroName = 'Alex Rivera', classRole = 'Infiltration Specialist'): ScenarioHookResult {
  return {
    title: 'The Shibuya Nexus Assignment: Chapter I',
    category: 'real_life',
    description: 'Arriving at the modern glass headquarters in downtown Tokyo on the morning of a major corporate assignment.',
    hookText: `Morning commuters stream through the crosswalk outside the gleaming glass skyscraper of Nexus Corporation in Shibuya. ${heroName}, wearing a tailored business suit with an encrypted digital organizer in your briefcase, steps through the revolving glass doors into the marble atrium. Today is your first day on site as the contracted security consultant, with your orientation meeting starting in twenty minutes.`,
    suggestedActions: [
      'Check in at the ground-floor security reception desk to obtain your visitor badge',
      'Grab a coffee at the atrium espresso bar while reviewing the building floor plans',
      'Observe the staff security turnstiles and badge readers (Investigation / Perception Check)'
    ],
    character: {
      id: `char_real_${Date.now()}`,
      name: heroName,
      roleClass: classRole,
      raceOrigin: 'Human',
      level: 1,
      hp: 11,
      maxHp: 11,
      armorClass: 13,
      initiativeBonus: 2,
      stats: { str: 11, dex: 15, con: 12, int: 16, wis: 13, cha: 14 },
      inventory: [
        { id: 'rl1', name: 'Encrypted Security Tablet & Bypass Deck', type: 'misc', quantity: 1 },
        { id: 'rl2', name: 'Tactical Pen & Multi-Tool', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'rl3', name: 'Nexus Corp Visitor Appointment Letter', type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A professional security specialist brought in to evaluate corporate network and physical access.'
    },
    gameWorldState: {
      currentLocation: 'Nexus Tower Atrium Lobby, Shibuya',
      timeOfDay: 'Morning Rush Hour',
      activeQuest: 'Check In with Security & Meet Project Director Sato',
      dangerLevel: 'Safe',
      customNotes: 'The building is bustling with morning employees entering through the turnstiles.'
    },
    mapData: createGenericStartingMap('cyber', 'Nexus Tower Lobby')
  };
}

// Master Dispatcher Function for ALL 15 categories
export function generateScenarioHook(
  category: ExperienceCategory, 
  heroName?: string, 
  classRole?: string
): ScenarioHookResult {
  switch (category) {
    case 'fantasy':
      return generateFantasyHook(heroName, classRole);
    case 'adventure':
      return generateAdventureHook(heroName, classRole);
    case 'historical_adventure':
      return generateHistoricalAdventureHook(heroName, classRole);
    case 'horror':
      return generateHorrorHook(heroName, classRole);
    case 'cozy_ghibli':
      return generateCozyGhibliHook(heroName, classRole);
    case 'romantic':
      return generateRomanticHook(heroName, classRole);
    case 'revenge':
      return generateRevengeHook(heroName, classRole);
    case 'apocalypse':
      return generateApocalypseHook(heroName, classRole);
    case 'zombie':
      return generateZombieHook(heroName, classRole);
    case 'cosmic_horror':
      return generateCosmicHorrorHook(heroName, classRole);
    case 'psychedelic_trip':
      return generatePsychedelicTripHook(heroName, classRole);
    case 'tiktok_drama':
      return generateTikTokDramaHook(heroName, classRole);
    case 'ancient_greek':
      return generateAncientGreekHook(heroName, classRole);
    case 'mythology':
      return generateMythologyHook(heroName, classRole);
    case 'real_life':
      return generateRealLifeHook(heroName, classRole);
    default:
      return generateFantasyHook(heroName, classRole);
  }
}

// Helper: Create Rich Starting Map for Fantasy Experience
function createFantasyStartingMap(): MapData {
  const gridWidth = 12;
  const gridHeight = 12;

  // Fog matrix: initially obscures map EXCEPT around starting hero area at (2, 10)
  const fogMatrix = Array(gridHeight).fill(null).map((_, rIdx) => 
    Array(gridWidth).fill(null).map((_, cIdx) => {
      // Reveal 3-cell radius around hero starting position (x: 2, y: 10)
      const dist = Math.max(Math.abs(rIdx - 10), Math.abs(cIdx - 2));
      return dist > 2; // true = obscured by fog, false = revealed
    })
  );

  const tokens: MapToken[] = [
    {
      id: 'hero_1',
      name: 'Valerius (Hero)',
      type: 'hero',
      x: 2,
      y: 10,
      hp: 12,
      maxHp: 12,
      color: '#3b82f6',
      icon: 'shield',
      notes: 'Level 1 Eldritch Knight'
    },
    {
      id: 'npc_elder',
      name: 'Elder Bram',
      type: 'npc',
      x: 2,
      y: 9,
      hp: 10,
      maxHp: 10,
      color: '#10b981',
      icon: 'user',
      notes: 'Village Elder with knowledge of the urgent summons'
    },
    {
      id: 'npc_innkeeper',
      name: 'Innkeeper Martha',
      type: 'npc',
      x: 3,
      y: 10,
      hp: 10,
      maxHp: 10,
      color: '#10b981',
      icon: 'user',
      notes: 'Proprietor of the Prancing Griffin Tavern'
    }
  ];

  const terrainMarkers: TerrainMarker[] = [
    { id: 'loc_village', type: 'wall', x: 2, y: 10, label: 'Oakhaven Village Gates' },
    { id: 'loc_tavern', type: 'door', x: 3, y: 10, label: 'Prancing Griffin Tavern' },
    { id: 'loc_trail', type: 'hazard', x: 6, y: 6, label: 'Whispering Woods Trailhead' },
    { id: 'loc_ruins', type: 'portal', x: 10, y: 2, label: 'Forgotten Crypt Ruins' }
  ];

  return {
    gridWidth,
    gridHeight,
    bgTheme: 'dungeon',
    showGrid: true,
    fogOfWarEnabled: true,
    fogMatrix,
    tokens,
    terrainMarkers,
    description: 'Starting region: Oakhaven Village Crossroads and the Prancing Griffin Tavern. Move your token to explore.'
  };
}

// Helper: Generic starting map template with fog of war around starting position (2, 10)
function createGenericStartingMap(
  bgTheme: 'dungeon' | 'forest' | 'cyber' | 'ghibli' | 'eldritch' | 'cozy' | 'desert' | 'snow',
  locationName: string
): MapData {
  const gridWidth = 12;
  const gridHeight = 12;

  const fogMatrix = Array(gridHeight).fill(null).map((_, rIdx) => 
    Array(gridWidth).fill(null).map((_, cIdx) => {
      const dist = Math.max(Math.abs(rIdx - 10), Math.abs(cIdx - 2));
      return dist > 2;
    })
  );

  return {
    gridWidth,
    gridHeight,
    bgTheme,
    showGrid: true,
    fogOfWarEnabled: true,
    fogMatrix,
    tokens: [
      { id: 'hero_1', name: 'Hero', type: 'hero', x: 2, y: 10, hp: 12, maxHp: 12, color: '#2563eb', icon: 'shield' },
      { id: 'npc_1', name: 'Contact NPC', type: 'npc', x: 3, y: 10, hp: 10, maxHp: 10, color: '#059669', icon: 'user' }
    ],
    terrainMarkers: [
      { id: 'tm_start', type: 'door', x: 2, y: 10, label: locationName },
      { id: 'tm_mid', type: 'hazard', x: 6, y: 6, label: 'Exploration Zone' },
      { id: 'tm_vault', type: 'portal', x: 10, y: 2, label: 'Distant Objective' }
    ],
    description: `Tactical starting zone for ${locationName}. Move your character token to reveal the fog of war.`
  };
}
