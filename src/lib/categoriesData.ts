import { CategoryInfo } from '../types';

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: 'fantasy',
    name: 'Fantasy',
    tagline: 'D&D 5e Sagas, Dragon Seals & Ancient Catacombs',
    description: 'Venture through mystical realms drawn from classic D&D campaigns and iconic fantasy literature: cracked dragon seals, ancient crypts, mysterious tavern quest-givers, and wild magic.',
    iconName: 'Wand2',
    gradient: 'from-amber-600/30 via-purple-900/40 to-slate-950',
    accentColor: '#f59e0b',
    bgTheme: 'dungeon',
    defaultCharacter: {
      name: 'Valerius Starfall',
      roleClass: 'Eldritch Knight',
      raceOrigin: 'High Elf',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 15,
      initiativeBonus: 2,
      stats: { str: 15, dex: 14, con: 14, int: 14, wis: 12, cha: 10 },
      inventory: [
        { id: 'i1', name: 'Runic Longsword', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Chain Shirt & Travel Cloak', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'i3', name: 'Healing Potion', type: 'potion', quantity: 2 },
        { id: 'i4', name: 'Pouch of 15 Gold Coins', type: 'misc', quantity: 1 }
      ],
      spells: ['Shield', 'Magic Missile', 'Light', 'Mage Hand'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'An aspiring knight who has traveled to the frontier to investigate ancient prophecies.'
    },
    samplePrompts: [
      'I approach Elder Bram outside the tavern to learn about the urgent summons.',
      'I step into the Prancing Griffin Tavern to gather local rumors and buy supplies.',
      'I inspect the ancient runic boundary stone at the village gates with an Arcana check.'
    ]
  },
  {
    id: 'adventure',
    name: 'Adventure',
    tagline: 'Swashbuckling Expeditions & Lost Pirate Armadas',
    description: 'Inspired by classic high-seas epics and treasure expeditions: obsidian compass fragments, uncharted coral atolls, swinging rigging duels, and forgotten jungle ruins.',
    iconName: 'Compass',
    gradient: 'from-emerald-600/30 via-teal-900/40 to-slate-950',
    accentColor: '#10b981',
    bgTheme: 'forest',
    defaultCharacter: {
      name: 'Captain Cora Vane',
      roleClass: 'Swashbuckler Explorer',
      raceOrigin: 'Human',
      level: 1,
      hp: 11,
      maxHp: 11,
      armorClass: 14,
      initiativeBonus: 3,
      stats: { str: 12, dex: 16, con: 12, int: 13, wis: 13, cha: 15 },
      inventory: [
        { id: 'i1', name: 'Polished Brass Cutlass', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Flintlock Pistol & Powder Horn', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i3', name: 'Obsidian Compass Needle & Sea Chart', type: 'relic', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A daring navigator seeking the legendary sunken fleet of the Obsidian Atolls.'
    },
    samplePrompts: [
      'I visit the Salty Kraken Tavern to recruit a trustworthy navigator and deckhands.',
      'I examine the obsidian compass needle against the harbor landmarks with an Investigation check.',
      'I inspect the supply crates at the quartermaster dock before boarding our sloop.'
    ]
  },
  {
    id: 'historical_adventure',
    name: 'Historical Adventure',
    tagline: 'Alexandria, Edo Ninja Sieges & Venetian Conspiracies',
    description: 'Immerse yourself in history\'s most thrilling turning points: evacuating the burning Library of Alexandria, stormy Edo castle ninja raids, or Venetian Carnival Doge conspiracies.',
    iconName: 'ShieldAlert',
    gradient: 'from-yellow-700/30 via-stone-900/40 to-slate-950',
    accentColor: '#d97706',
    bgTheme: 'desert',
    defaultCharacter: {
      name: 'Kenjiro Sato',
      roleClass: 'Master Ronin',
      raceOrigin: 'Human (Edo Era)',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 15,
      initiativeBonus: 2,
      stats: { str: 14, dex: 15, con: 14, int: 12, wis: 14, cha: 10 },
      inventory: [
        { id: 'i1', name: 'Folded-Steel Katana', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Wakizashi Short Sword', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i3', name: 'Sealed Bamboo Dispatch Tube', type: 'misc', quantity: 1 }
      ],
      spells: [],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A disciplined wanderer entrusted with delivering a critical dispatch across contested territory.'
    },
    samplePrompts: [
      'I stop at the mountain tea house to ask the proprietor about road conditions ahead.',
      'I observe the imperial guard patrol stationed at the barrier gate with a Perception check.',
      'I check the wax seal on my bamboo dispatch tube to ensure it remains untouched.'
    ]
  },
  {
    id: 'horror',
    name: 'Horror',
    tagline: 'r/nosleep Rules, Radio Tower Mimics & Survival Horror',
    description: 'Drawing inspiration from r/nosleep, classic creepypastas, and psychological horror games: eerie station rulebooks, mountain radio mimic broadcasts, and fog-drenched ghost towns.',
    iconName: 'Ghost',
    gradient: 'from-red-900/40 via-stone-950 to-slate-950',
    accentColor: '#ef4444',
    bgTheme: 'eldritch',
    defaultCharacter: {
      name: 'Father Silas Vane',
      roleClass: 'Inquisitor Hunter',
      raceOrigin: 'Human',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 13,
      initiativeBonus: 1,
      stats: { str: 10, dex: 12, con: 12, int: 14, wis: 16, cha: 12 },
      inventory: [
        { id: 'i1', name: 'Silver Heavy Crossbow & 15 Bolts', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Brass Oil Lantern', type: 'misc', quantity: 1 },
        { id: 'i3', name: 'Vials of Blessed Holy Water', type: 'potion', quantity: 2 },
        { id: 'i4', name: 'Silver Inquisitor Rosary & Journal', type: 'relic', quantity: 1 }
      ],
      spells: ['Detect Evil', 'Light', 'Bless', 'Sanctuary'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'Called to investigate the sudden disappearance of the Blackwood forestry survey team.'
    },
    samplePrompts: [
      'I read the handwritten note pinned to the cabin door with an Investigation check.',
      'I light my brass lantern and unlock the cabin to set up my baseline camp.',
      'I scan the surrounding forest tree line with my silver rosary in hand.'
    ]
  },
  {
    id: 'cozy_ghibli',
    name: 'Cozy / Studio Ghibli-esque',
    tagline: 'Studio Ghibli Whimsy, Flying Tea Bakeries & Moss Golems',
    description: 'Charming, heartwarming adventures inspired by Studio Ghibli: flying clockwork tea airships, friendly giant moss spirits, soothing herbal infusions, and whimsical parasol gliders.',
    iconName: 'Sparkles',
    gradient: 'from-amber-400/30 via-emerald-800/40 to-slate-950',
    accentColor: '#34d399',
    bgTheme: 'ghibli',
    defaultCharacter: {
      name: 'Mimi & Pip',
      roleClass: 'Spirit Baker',
      raceOrigin: 'Woodland Hearthling',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 12,
      initiativeBonus: 2,
      stats: { str: 10, dex: 14, con: 13, int: 14, wis: 16, cha: 15 },
      inventory: [
        { id: 'i1', name: 'Carved Oak Rolling Pin', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Basket of Star-Flour & Honey Pastries', type: 'potion', quantity: 4 },
        { id: 'i3', name: 'Glider Parasol & Tea Kettle', type: 'misc', quantity: 1 }
      ],
      spells: ['Warmth Spark', 'Mend Spirit', 'Gentle Breeze', 'Plant Whisper'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A heartwarming baker traveling across floating islands to bring joy with enchanted tea.'
    },
    samplePrompts: [
      'I bake a fresh tray of star-honey cinnamon rolls to welcome the morning spirits.',
      'I step out onto the meadow grass with Pip to greet the local flower spirits.',
      'I check my grandmother\'s magical recipe journal for today\'s herbal blend.'
    ]
  },
  {
    id: 'romantic',
    name: 'Romantic',
    tagline: 'GoodNovel Tropes, Masquerades & Star-Crossed Dynasties',
    description: 'Drawn from high-society romance & DramaBox dynamics: secret engagements, midnight masquerade waltzes, enemies-to-lovers tension, and dangerous court intrigue.',
    iconName: 'Heart',
    gradient: 'from-rose-600/30 via-pink-900/40 to-slate-950',
    accentColor: '#f43f5e',
    bgTheme: 'cozy',
    defaultCharacter: {
      name: 'Lady Aurelia Rose',
      roleClass: 'Charming Court Bard',
      raceOrigin: 'Half-Elf Noble',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 13,
      initiativeBonus: 2,
      stats: { str: 9, dex: 15, con: 11, int: 13, wis: 13, cha: 16 },
      inventory: [
        { id: 'i1', name: 'Silver-Strung Pocket Lute', type: 'misc', quantity: 1 },
        { id: 'i2', name: 'Jeweled Stiletto Dagger', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i3', name: 'Velvet Masquerade Mask & Invitation', type: 'misc', quantity: 1 }
      ],
      spells: ['Charm Person', 'Disguise Self', 'Guidance', 'Friends'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'Attending the grand seasonal ball to navigate high-society intrigue and romance.'
    },
    samplePrompts: [
      'I present my engraved silver invitation to the Grand Chamberlain at the palace entrance.',
      'I mingle among the arriving masquerade guests to listen for court gossip with an Insight check.',
      'I step out onto the moonlit canal terrace to admire the palace gardens.'
    ]
  },
  {
    id: 'revenge',
    name: 'Revenge',
    tagline: 'GoodNovel / PrimeDrama Vendettas & The 5-Betrayer Hitlist',
    description: 'Inspired by anti-hero vengeance sagas: the 5-traitor hit list, returning disgraced dragon lords, dismantling corrupt syndicate empires, and cold, calculated retribution.',
    iconName: 'Flame',
    gradient: 'from-orange-700/30 via-red-950 to-slate-950',
    accentColor: '#f97316',
    bgTheme: 'dungeon',
    defaultCharacter: {
      name: 'Kaelen Thorne',
      roleClass: 'Shadow Avenger',
      raceOrigin: 'Tiefling',
      level: 1,
      hp: 12,
      maxHp: 12,
      armorClass: 14,
      initiativeBonus: 3,
      stats: { str: 14, dex: 16, con: 14, int: 12, wis: 12, cha: 10 },
      inventory: [
        { id: 'i1', name: 'Concealed Shadow Daggers', type: 'weapon', quantity: 2, isEquipped: true },
        { id: 'i2', name: 'Reinforced Leather Trench Coat', type: 'armor', quantity: 1, isEquipped: true },
        { id: 'i3', name: 'Untouched List of the Five Betrayers', type: 'misc', quantity: 1 }
      ],
      spells: ['Hunter\'s Mark', 'Pass Without Trace', 'Thaumaturgy'],
      statusEffects: ['Well-Rested'],
      backgroundNotes: 'A disciplined avenger returning to the city to methodically dismantle the corrupt syndicate.'
    },
    samplePrompts: [
      'I cross the station plaza to meet my informant Jax at the corner diner.',
      'I check my concealed blades and survey the platform for syndicate watchers with a Perception check.',
      'I review my map of the city\'s five merchant districts to plan my route.'
    ]
  },
  {
    id: 'apocalypse',
    name: 'Apocalypse',
    tagline: 'Fallout 76 Wasteland Survival, C.A.M.P. & Rad-Cryptids',
    description: 'Loosely inspired by Fallout 76 wasteland survival: scorched ash storms, Geiger counter clicks, C.A.M.P. scrap fortifications, bottlecap trading, quirky protectron vendors, and glowing cryptids.',
    iconName: 'Radio',
    gradient: 'from-yellow-800/30 via-stone-900 to-slate-950',
    accentColor: '#eab308',
    bgTheme: 'desert',
    defaultCharacter: {
      name: 'Maya Steel',
      roleClass: 'Wasteland Scavenger',
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
    samplePrompts: [
      'I check the Geiger counter readings and calibrate my moisture recycler.',
      'I use my brass binoculars to scout the path down toward the New Horizon Trading Outpost.',
      'I inspect the abandoned roadside checkpoint at the base of the ridge with an Investigation check.'
    ]
  },
  {
    id: 'zombie',
    name: 'Zombie Outbreak',
    tagline: 'The Walking Dead Survival, Highway Gridlocks & Stealth Scavenging',
    description: 'Loosely inspired by The Walking Dead: abandoned highway car graveyards, morning mist walker herds, rural farmstead barricades, and tense stealth pharmacy supply runs.',
    iconName: 'Skull',
    gradient: 'from-green-900/40 via-stone-950 to-slate-950',
    accentColor: '#22c55e',
    bgTheme: 'cyber',
    defaultCharacter: {
      name: 'Dr. Marcus Drake',
      roleClass: 'Outbreak Specialist',
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
    samplePrompts: [
      'I log into the hospital terminal to review the emergency triage intake logs with an Investigation check.',
      'I gather my emergency first-aid kit and secure the laboratory keycard access.',
      'I look through the reinforced hallway observation window to assess the situation.'
    ]
  },
  {
    id: 'cosmic_horror',
    name: 'Cosmic Horror',
    tagline: 'Lovecraft, Beksiński & Non-Euclidean Sanity Mechanics',
    description: 'Inspired by H.P. Lovecraft, Wayne Barlowe, Beksiński, and Junji Ito: impossible geometric spirals, iridescent violet-black voids, star-spawn obelisks, and sanity-fraying truths.',
    iconName: 'Eye',
    gradient: 'from-violet-800/30 via-fuchsia-950 to-slate-950',
    accentColor: '#a855f7',
    bgTheme: 'eldritch',
    defaultCharacter: {
      name: 'Dr. Arthur Pendelton',
      roleClass: 'Occult Astronomer',
      raceOrigin: 'Human',
      level: 1,
      hp: 10,
      maxHp: 10,
      armorClass: 12,
      initiativeBonus: 1,
      stats: { str: 10, dex: 12, con: 11, int: 16, wis: 15, cha: 12 },
      inventory: [
        { id: 'i1', name: 'Antique Pocket Revolver (Unloaded)', type: 'weapon', quantity: 1, isEquipped: false },
        { id: 'i2', name: 'Magnifying Glass & Translation Notebook', type: 'misc', quantity: 1 },
        { id: 'i3', name: 'Armitage\'s Telegram & Wax Seal', type: 'relic', quantity: 1 }
      ],
      spells: ['Guidance', 'Comprehend Languages', 'Detect Magic'],
      statusEffects: ['Well-Rested', 'Sanity: 100/100'],
      backgroundNotes: 'An academic scholar called to decipher an astronomical anomaly recorded in ancient texts.'
    },
    samplePrompts: [
      'I show Armitage\'s telegram to the head archivist to request the rare manuscript catalog.',
      'I examine the antique celestial globe in the library corner for strange star markings with an Investigation check.',
      'I sit at the reading desk to transcribe the notes sent in Armitage\'s letter.'
    ]
  },
  {
    id: 'psychedelic_trip',
    name: 'Psychedelic Trip',
    tagline: 'Erowid Experience Vaults, Synesthesia & The Geometric Nexus',
    description: 'Inspired by Erowid experience reports and surrealist cinema: liquid stained-glass bridges, tasting indigo frequencies, neon origami entities speaking backward riddles, and time-dilation loops.',
    iconName: 'Palette',
    gradient: 'from-fuchsia-600/30 via-cyan-900/40 to-slate-950',
    accentColor: '#ec4899',
    bgTheme: 'cyber',
    defaultCharacter: {
      name: 'Zephyr Synapse',
      roleClass: 'Chroma Shaman',
      raceOrigin: 'Dimensional Wanderer',
      level: 1,
      hp: 11,
      maxHp: 11,
      armorClass: 13,
      initiativeBonus: 3,
      stats: { str: 10, dex: 15, con: 12, int: 14, wis: 16, cha: 15 },
      inventory: [
        { id: 'i1', name: 'Crystal Chime Staff', type: 'weapon', quantity: 1, isEquipped: true },
        { id: 'i2', name: 'Vial of Luminous Aurora Water', type: 'potion', quantity: 2 },
        { id: 'i3', name: 'Prismatic Prism Pendant', type: 'relic', quantity: 1 }
      ],
      spells: ['Color Spark', 'Harmonic Whisper', 'Gentle Levitation'],
      statusEffects: ['Well-Rested', 'Expanded Awareness'],
      backgroundNotes: 'A voyager exploring the tranquil realms of expanded consciousness and art.'
    },
    samplePrompts: [
      'I ring my crystal chime staff to harmonize with the meadow\'s ambient melody.',
      'I observe the shifting fractal patterns along the rainbow river path with a Perception check.',
      'I reach out gently to communicate with a floating origami spirit entity.'
    ]
  },
  {
    id: 'tiktok_drama',
    name: 'TikTok Short Drama',
    tagline: 'GoodNovel & DramaBox: Secret Heiress, $50B Slap & Arrogant CEOs',
    description: 'High-octane viral drama inspired by GoodNovel, DramaBox, and PrimeDrama tropes: undercover billionaires, shocking banquet reveals, public slaps, and dramatic contract marriages.',
    iconName: 'Clapperboard',
    gradient: 'from-pink-600/30 via-purple-900/40 to-slate-950',
    accentColor: '#f43f5e',
    bgTheme: 'cozy',
    defaultCharacter: {
      name: 'Sienna Sterling',
      roleClass: 'Undercover Heiress',
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
    samplePrompts: [
      'I review the VIP banquet seating chart to see who is attending the evening gala.',
      'I speak with the friendly head chef in the kitchen to prepare the banquet room.',
      'I check my encrypted phone for the arrival confirmation from my family\'s security team.'
    ]
  },
  {
    id: 'ancient_greek',
    name: 'Ancient Greek',
    tagline: 'Homeric Epics, Spartan Phalanxes & The Delphic Oracle',
    description: 'Inspired by Greek history and Homeric epics: Spartan hoplites holding the hot gates, Delphic oracle laurel vapors, Minotaur bronze labyrinths, and Olympian demigod trials.',
    iconName: 'Landmark',
    gradient: 'from-amber-500/30 via-yellow-900/40 to-slate-950',
    accentColor: '#eab308',
    bgTheme: 'forest',
    defaultCharacter: {
      name: 'Perseus of Sparta',
      roleClass: 'Hoplite Hero',
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
    samplePrompts: [
      'I offer a tribute of olive oil and barley at the temple altar to request an audience.',
      'I speak to the Spartan herald waiting on the temple terrace for news from home.',
      'I inspect the bronze dedications and mythic murals along the Sacred Way with a History check.'
    ]
  },
  {
    id: 'mythology',
    name: 'Mythology',
    tagline: 'Norse Eddas, Egyptian Book of the Dead & Hermetic Alchemy',
    description: 'Drawn from world religions and occult lore: the Bifrost rainbow bridge siege, Anubis weighing the heart in the Hall of Two Truths, Celtic Tír na nÓg, and Hermetic alchemy.',
    iconName: 'Zap',
    gradient: 'from-cyan-600/30 via-blue-900/40 to-slate-950',
    accentColor: '#06b6d4',
    bgTheme: 'snow',
    defaultCharacter: {
      name: 'Freya Stormweaver',
      roleClass: 'Valkyrie Champion',
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
    samplePrompts: [
      'I greet Heimdall and receive today\'s celestial watch assignments.',
      'I peer through the golden observatory spyglass toward Midgard and Jotunheim with a Perception check.',
      'I inscribe a rune of warding along my aegis shield before stepping onto your patrol route.'
    ]
  },
  {
    id: 'real_life',
    name: 'Real Life Experiences',
    tagline: 'Reddit Everyday Dilemmas: FAANG Panels, 2 AM Bodegas & HOA Disputes',
    description: 'Drawn from Reddit everyday experiences (r/AskReddit, r/TalesFromTechSupport, r/talesfromthefrontdesk, r/antiwork): grueling FAANG whiteboard interviews, 2 AM convenience store shifts, and HOA crises.',
    iconName: 'Briefcase',
    gradient: 'from-sky-700/30 via-slate-900 to-slate-950',
    accentColor: '#0284c7',
    bgTheme: 'cyber',
    defaultCharacter: {
      name: 'Alex Rivera',
      roleClass: 'Infiltration Specialist',
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
    samplePrompts: [
      'I check in at the ground-floor security reception desk to obtain my visitor badge.',
      'I grab a coffee at the atrium espresso bar while reviewing the building floor plans.',
      'I observe the staff security turnstiles and badge readers with an Investigation check.'
    ]
  }
];
