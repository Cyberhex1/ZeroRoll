import { ExperienceCategory, InventoryItem } from '../types';

export interface RandomizedScenarioData {
  title: string;
  heroName: string;
  roleClass: string;
  raceOrigin: string;
  hookText: string;
  physicalDescription: string;
  suggestedActions: string[];
  initialInventory: InventoryItem[];
  initialSpells: string[];
  initialConditions: string[];
  startingHp: number;
}

interface CategoryTemplates {
  titles: string[];
  firstNames: string[];
  lastNames: string[];
  roles: string[];
  races: string[];
  physicalTraits: string[];
  hooks: {
    hook: string;
    actions: string[];
    gear: { name: string; type: 'weapon' | 'armor' | 'potion' | 'relic' | 'misc'; isEquipped?: boolean; description?: string }[];
    spells: string[];
    hp: number;
  }[];
}

export const CATEGORY_GENERATOR_DATA: Record<ExperienceCategory, CategoryTemplates> = {
  fantasy: {
    titles: [
      'The Prophecy of Sunken Aethelgard: Chapter I',
      'Whispers of the Runic Gates: Chapter I',
      'The Ember of the Dragon Shrine: Chapter I',
      'Shadows of the Silverwood: Chapter I',
      'The Forgotten Seal of Morndun: Chapter I',
      'Chronicles of the Starfall Spire: Chapter I'
    ],
    firstNames: ['Valerius', 'Lyra', 'Kaelen', 'Bram', 'Elian', 'Seraphina', 'Garrick', 'Morwenna', 'Thoran', 'Astrid'],
    lastNames: ['Starfall', 'Ravenshadow', 'Ironwood', 'Silverhand', 'Dawnbringer', 'Ashford', 'Moonwhisper', 'Stormrider'],
    roles: ['Eldritch Knight', 'Shadow Sorcerer', 'Arcane Trickster', 'Oath of the Ancients Paladin', 'Circle of the Moon Druid', 'Way of the Kensei Monk', 'Runecarver Bladesinger'],
    races: ['High Elf', 'Dwarf Wanderer', 'Human Outlander', 'Tiefling Scholar', 'Half-Elf Ranger', 'Dragonborn Champion', 'Gnome Artificer'],
    physicalTraits: [
      'Silver hair tied back in a leather thong, keen hazel eyes, traveling cloak lined with runic wool, wielding a notched ancestral sword.',
      'Tall with broad shoulders, dark piercing eyes, braided copper hair, wearing weathered chainmail adorned with forest motifs.',
      'Slender build, violet eyes that faintly hum with arcane luminescence, dark traveling robes with brass spell-tomes.'
    ],
    hooks: [
      {
        hook: 'The morning mist hangs low over the cobblestone crossroads of Oakhaven Village. Shoulder your traveling pack and adjust your runic sword after weeks on the road. Smoke rises from the chimney of the Prancing Griffin Tavern, where Village Elder Bram stands outside waiting for brave wanderers to answer his urgent summons.',
        actions: [
          'Approach Elder Bram outside the tavern to learn about the urgent summons',
          'Step into the Prancing Griffin Tavern to gather local rumors and buy road supplies',
          'Inspect the ancient runic boundary stone at the village gates (Arcana Check)'
        ],
        gear: [
          { name: 'Runic Longsword', type: 'weapon', isEquipped: true },
          { name: 'Chain Shirt & Cloak', type: 'armor', isEquipped: true },
          { name: 'Healing Potion', type: 'potion' },
          { name: 'Explorer\'s Pack & 15 Gold', type: 'misc' }
        ],
        spells: ['Shield', 'Magic Missile', 'Light'],
        hp: 12
      },
      {
        hook: 'Sunlight filters through the towering canopy of the Whispering Weald as you arrive at the secluded frontier shrine of Eldath. The shrine\'s stone basin has begun to glow with an unusual azure shimmer, and Brother Corvus kneels in prayer, looking up with relief at your arrival.',
        actions: [
          'Greet Brother Corvus and ask what disturbance has afflicted the shrine waters',
          'Examine the glowing azure basin with an Arcana or Nature check',
          'Survey the surrounding perimeter for tracks or signs of wild beasts (Perception Check)'
        ],
        gear: [
          { name: 'Carved Oak Quarterstaff', type: 'weapon', isEquipped: true },
          { name: 'Traveler\'s Robes & Herbal Pouch', type: 'armor', isEquipped: true },
          { name: 'Vial of Sacred Spring Water', type: 'potion' },
          { name: 'Divination Bones & Parchment', type: 'misc' }
        ],
        spells: ['Guidance', 'Cure Wounds', 'Entangle'],
        hp: 11
      },
      {
        hook: 'Rain patters against the mossy flagstones of the Highcrag Mountain Garrison. You present your guild credentials to the gate sentinel, who unbolts the heavy iron postern. Inside the courtyard, Captain Valerie is reviewing a regional map of recent landslide tremors.',
        actions: [
          'Report to Captain Valerie to receive your frontier reconnaissance assignment',
          'Inspect the garrison armory supplies to equip torches and climbing pitons',
          'Speak to the mountain dwarf blacksmith tending the forge about local pass conditions'
        ],
        gear: [
          { name: 'Balanced Steel Broadsword', type: 'weapon', isEquipped: true },
          { name: 'Reinforced Scale Armor', type: 'armor', isEquipped: true },
          { name: 'Bandage Kit & Dwarven Stout', type: 'potion' },
          { name: 'Climbing Pitons & 50ft Rope', type: 'misc' }
        ],
        spells: ['True Strike', 'Heroism'],
        hp: 13
      }
    ]
  },

  adventure: {
    titles: [
      'The Obsidian Compass Expedition: Chapter I',
      'Voyage of the Emerald Galleon: Chapter I',
      'The Lost Atoll of Isla Nublar: Chapter I',
      'The Tide-Cave of Marauder\'s Reach: Chapter I',
      'Sovereigns of the Coral Sea: Chapter I'
    ],
    firstNames: ['Cora', 'Edward', 'Marlowe', 'Cassian', 'Talia', 'Gideon', 'Beatrix', 'Silas'],
    lastNames: ['Vane', 'Drake', 'Hawthorne', 'Blackwood', 'Sterling', 'O\'Malley', 'Fairchild'],
    roles: ['Swashbuckler Explorer', 'Harbor Navigator', 'Privateer Duelist', 'Cartographer Archaeologist', 'Corsair Scout'],
    races: ['Human', 'Half-Elf Seafarer', 'Triton Outlander', 'Tiefling Privateer'],
    physicalTraits: [
      'Sun-bronzed skin, sea-green eyes, dark curls held by a crimson bandana, equipped with a polished brass spyglass and cutlass.',
      'Weathered leather trench coat, confident grin, observant gray eyes, carrying a notched flintlock and rolled nautical chart.'
    ],
    hooks: [
      {
        hook: 'Salt spray fills the morning air as you step off the gangplank onto the bustling wooden docks of Port Tempest. In your coat pocket rests a weathered sea chart and an obsidian compass needle you recently acquired.',
        actions: [
          'Visit the Salty Kraken Tavern to recruit a trustworthy navigator',
          'Examine the obsidian compass needle against the harbor landmarks',
          'Inspect the supply crates at the quartermaster dock before boarding your sloop'
        ],
        gear: [
          { name: 'Polished Brass Cutlass', type: 'weapon', isEquipped: true },
          { name: 'Obsidian Compass', type: 'relic', isEquipped: true }
        ],
        spells: [],
        hp: 11
      },
      {
        hook: 'Golden morning light glints off the turquoise surf of Siren\'s Cove. Before you rises the jungle-cloaked bluff holding the stone ruins of an ancient temple observatory, untouched for centuries.',
        actions: [
          'Unfurl your parchment expedition notes',
          'Scout the jungle tree line for booby traps',
          'Check water rations before ascending the ridge'
        ],
        gear: [
          { name: 'Machete', type: 'weapon', isEquipped: true },
          { name: 'Water Canteen', type: 'potion' }
        ],
        spells: [],
        hp: 12
      },
      {
        hook: 'Thick fog rolls over the deck of your skiff as you approach the jagged teeth of the Dead Man\'s Reef. A flickering beacon glows from the top of the central sea stack.',
        actions: [
          'Check your navigation lantern',
          'Consult the star charts to avoid hidden reefs',
          'Signal the beacon with your mirror'
        ],
        gear: [
          { name: 'Hand-axe', type: 'weapon', isEquipped: true },
          { name: 'Signal Mirror', type: 'misc' }
        ],
        spells: [],
        hp: 10
      }
    ]
  },

  historical_adventure: {
    titles: [
      'Shadows of the Shogunate: Chapter I',
      'The Alexandria Manuscript Rescue: Chapter I',
      'Venetian Carnival Conspiracy: Chapter I',
      'Secrets of the Silk Road Envoy: Chapter I',
      'The Doge\'s Hidden Decree: Chapter I'
    ],
    firstNames: ['Kenjiro', 'Amara', 'Marco', 'Tomoe', 'Cassius', 'Helena', 'Zhen', 'Matteo'],
    lastNames: ['Sato', 'Conti', 'Al-Rashid', 'Minamoto', 'Barbaro', 'Vandermeer', 'Valois'],
    roles: ['Master Ronin', 'Alexandrian Scholar Scribe', 'Venetian Spymaster', 'Silk Road Courier', 'Imperial Guard'],
    races: ['Human (Edo Era)', 'Human (Hellenistic Era)', 'Human (Renaissance)', 'Human (Dynastic Silk Road)'],
    physicalTraits: [
      'Calm composed posture, dark hair tied in a traditional topknot, wearing a deep indigo traveler\'s haori with a folded steel katana.',
      'Flowing scholar\'s linen tunic, sharp observant gaze, carrying a brass stylus, inkwell, and wax seals.'
    ],
    hooks: [
      {
        hook: 'The first rays of sunlight pierce through the morning mist over the mountain tea house. Secured beneath your kimono is a sealed bamboo tube containing an imperial decree.',
        actions: ['Consult tea house proprietor', 'Observe patrol', 'Check wax seal'],
        gear: [{ name: 'Katana', type: 'weapon', isEquipped: true }, { name: 'Dispatch Tube', type: 'relic' }],
        spells: [],
        hp: 12
      },
      {
        hook: 'You stand in the shadows of the Great Library, holding the stolen papyrus scrolls that could change history. The guards are approaching the northern archive hall.',
        actions: ['Hide in the alcove', 'Read the scroll', 'Prepare a distraction'],
        gear: [{ name: 'Dagger', type: 'weapon', isEquipped: true }, { name: 'Scroll', type: 'relic' }],
        spells: [],
        hp: 10
      },
      {
        hook: 'The Venetian canal is quiet tonight, save for the rhythmic splashing of oars. You clutch a gilded invitation to the Doge’s ball, but your real prize is the cipher key hidden in your mask.',
        actions: ['Secure your mask', 'Watch the gondoliers', 'Check your cloak'],
        gear: [{ name: 'Rapier', type: 'weapon', isEquipped: true }, { name: 'Mask', type: 'misc' }],
        spells: [],
        hp: 11
      }
    ]
  },

  horror: {
    titles: [
      'The Mystery of Blackwood Ridge: Chapter I',
      'The Whispering Pines Motel: Chapter I',
      'Night Shift at Tower 9: Chapter I',
      'The Sanatorium on Ash Hill: Chapter I',
      'The Cold Fog of Raven\'s Hollow: Chapter I'
    ],
    firstNames: ['Silas', 'Elena', 'Julian', 'Clara', 'Arthur', 'Vera', 'Roland', 'Evelyn'],
    lastNames: ['Vane', 'Crane', 'Holloway', 'Blackwood', 'Cross', 'Morrow', 'Sinclair'],
    roles: ['Inquisitor Hunter', 'Forestry Survey Specialist', 'Paranormal Investigator', 'Night Shift Fire Watcher', 'Antique Appraiser'],
    races: ['Human', 'Haunted Wanderer', 'Grimbound Scholar'],
    physicalTraits: [
      'Pale features, tired but razor-sharp gray eyes, dark woolen overcoat with collar turned up against the cold wind, clutching a brass lantern.',
      'Sturdy hiking gear, tactical flashlight clipped to the chest strap, cautious gait and attentive posture.'
    ],
    hooks: [
      {
        hook: 'Dusk settles over Blackwood Ridge. A handwritten note pinned to the cabin door bears your name.',
        actions: ['Read note', 'Light lantern', 'Scan forest'],
        gear: [{ name: 'Crossbow', type: 'weapon', isEquipped: true }, { name: 'Lantern', type: 'misc' }],
        spells: ['Detect Evil'],
        hp: 10
      },
      {
        hook: 'You pull into the Whispering Pines Motel. The neon sign hums with a sickly flicker, and room 13 appears to be open despite the lobby being locked.',
        actions: ['Check room 13', 'Search lobby', 'Inspect your car'],
        gear: [{ name: 'Flashlight', type: 'misc', isEquipped: true }, { name: 'Crowbar', type: 'weapon' }],
        spells: [],
        hp: 9
      },
      {
        hook: 'Tower 9 is silent. The radio crackles with static, and you see movement in the trees beneath the fire watch platform.',
        actions: ['Check binoculars', 'Call headquarters', 'Lock the tower hatch'],
        gear: [{ name: 'Radio', type: 'misc', isEquipped: true }, { name: 'Knife', type: 'weapon' }],
        spells: [],
        hp: 11
      }
    ]
  },

  cozy_ghibli: {
    titles: [
      'The Flying Tea Shop & The Meadow Spirits: Chapter I',
      'Apothecary of the Mossy Windmill: Chapter I',
      'The Star-Bun Bakery of Clover Valley: Chapter I',
      'Whispers of the Clockwork Garden: Chapter I',
      'The Lantern Post Lighthouse: Chapter I'
    ],
    firstNames: ['Mimi', 'Pip', 'Sophie', 'Toby', 'Kiki', 'Hana', 'Oliver', 'Lulu'],
    lastNames: ['Honeywood', 'Tealeaf', 'Starling', 'Bramble', 'Fern', 'Bloom', 'Merryweather'],
    roles: ['Spirit Baker', 'Flying Herbalist', 'Whimsical Glider Courier', 'Clockwork Hearthkeeper', 'Meadow Tea Brewer'],
    races: ['Woodland Hearthling', 'Gentle Sprite Companion', 'River Spirit Kin', 'Human Dreamer'],
    physicalTraits: [
      'Bright sparkling eyes, linen apron with flour smudges, knit cardigan, accompanied by a tiny glowing spirit companion perched on the shoulder.'
    ],
    hooks: [
      {
        hook: 'Morning sunlight filters through the windows of your flying tea shop. Pip, your spirit fox, wakes you up.',
        actions: ['Bake pastries', 'Greet spirits', 'Check journal'],
        gear: [{ name: 'Rolling Pin', type: 'weapon', isEquipped: true }],
        spells: ['Warmth Spark'],
        hp: 12
      },
      {
        hook: 'The mossy windmill turns slowly. You gather lavender for your tinctures as a raincloud approaches.',
        actions: ['Harvest herbs', 'Check windmill gear', 'Brew tea'],
        gear: [{ name: 'Herbal Pouch', type: 'misc', isEquipped: true }],
        spells: ['Gentle Breeze'],
        hp: 11
      },
      {
        hook: 'Your glider is packed with letters for the mountain villages. The wind is favorable, and the view is spectacular.',
        actions: ['Check glider wings', 'Verify letters', 'Launch'],
        gear: [{ name: 'Aviator Goggles', type: 'misc', isEquipped: true }],
        spells: ['Astral Float'],
        hp: 13
      }
    ]
  },

  romantic: {
    titles: [
      'The Venetian Masquerade & Secret Vows: Chapter I',
      'The Duke\'s Hidden Betrothal: Chapter I',
      'Waltz of the Star-Crossed Dynasties: Chapter I',
      'The Masque of Golden Lilies: Chapter I',
      'Embers of the Solstice Ball: Chapter I'
    ],
    firstNames: ['Aurelia', 'Julian', 'Seraphina', 'Dante', 'Genevieve', 'Lucian', 'Rosalind', 'Darian'],
    lastNames: ['Rose', 'De La Tour', 'Valmont', 'Castiglione', 'Montague', 'Ravencroft', 'St. Clair'],
    roles: ['Court Bard', 'Masquerade Diplomat', 'Noble Scion', 'Secret Envoy', 'Royal Confidante'],
    races: ['Half-Elf Noble', 'Human Highborn', 'Tiefling Aristocrat', 'Elven Emissary'],
    physicalTraits: [
      'Graceful posture, flowing silk velvet dress/doublet in midnight blue, silver domino mask concealing emerald eyes.'
    ],
    hooks: [
      {
        hook: 'Venetian gondolas glide along the Grand Canal. You hold an engraved invitation to the Palais de L\'Amour.',
        actions: ['Present invite', 'Mingle', 'Terrace walk'],
        gear: [{ name: 'Dagger', type: 'weapon', isEquipped: true }, { name: 'Mask', type: 'misc' }],
        spells: ['Charm Person'],
        hp: 10
      },
      {
        hook: 'The Duke’s ball is in full swing. You spot your rival dancing with the person you’re meant to protect.',
        actions: ['Cut in', 'Observe from the balcony', 'Check for spies'],
        gear: [{ name: 'Fan', type: 'misc', isEquipped: true }],
        spells: ['Disguise Self'],
        hp: 11
      },
      {
        hook: 'You wait in the moonlit rose garden for your secret correspondent. A letter is tucked inside your silk bodice.',
        actions: ['Wait for signal', 'Hide message', 'Check shadows'],
        gear: [{ name: 'Signet Ring', type: 'relic', isEquipped: true }],
        spells: ['Guidance'],
        hp: 12
      }
    ]
  },

  revenge: {
    titles: [
      'The Red Vow of Iron Cross: Chapter I',
      'The Five Names of Vengeance: Chapter I',
      'Shadow of the Exiled Dragon: Chapter I',
      'The Debt of Crimson Gold: Chapter I',
      'Vendetta of the Forgotten Lord: Chapter I'
    ],
    firstNames: ['Kaelen', 'Vesper', 'Marcus', 'Damian', 'Riven', 'Thalia', 'Corin', 'Zane'],
    lastNames: ['Thorne', 'Vance', 'Grimm', 'Blackwell', 'Vane', 'Rook', 'Mordecai'],
    roles: ['Shadow Avenger', 'Exiled Commander', 'Contract Hitman', 'Disowned Scion', 'Infiltration Hunter'],
    races: ['Tiefling', 'Human Exiled Noble', 'Dark Elf Rogue', 'Revenant Outcast'],
    physicalTraits: [
      'Grim determination in dark hazel eyes, long reinforced trench coat worn over dark armor, twin concealed blades resting at the wrists.'
    ],
    hooks: [
      {
        hook: 'Train steam hisses at Iron Cross Station. You have a list of five names in your pocket.',
        actions: ['Meet informant', 'Survey platform', 'Review map'],
        gear: [{ name: 'Daggers', type: 'weapon', isEquipped: true }, { name: 'List', type: 'relic' }],
        spells: ['Hunter\'s Mark'],
        hp: 12
      },
      {
        hook: 'Rain pours over the docks. The syndicate leader is departing on the midnight ship.',
        actions: ['Infiltrate boat', 'Cut lines', 'Wait in shadow'],
        gear: [{ name: 'Grapple', type: 'misc', isEquipped: true }, { name: 'Blade', type: 'weapon' }],
        spells: ['Pass Without Trace'],
        hp: 11
      },
      {
        hook: 'The mansion party is loud. You know the safe is behind the painting in the study.',
        actions: ['Pick lock', 'Knock out guard', 'Find safe'],
        gear: [{ name: 'Lockpicks', type: 'misc', isEquipped: true }],
        spells: ['Thaumaturgy'],
        hp: 10
      }
    ]
  },

  apocalypse: {
    titles: [
      'The Wasteland Horizon: Chapter I',
      'Shelter 44: First Dawn: Chapter I',
      'Echoes of the Rust Valley: Chapter I',
      'The Cobalt Caravan Route: Chapter I',
      'Scavenger\'s Vow: Chapter I'
    ],
    firstNames: ['Maya', 'Caleb', 'Rust', 'Jax', 'Tara', 'Dax', 'Nova', 'Boone'],
    lastNames: ['Steel', 'Vance', 'Miller', 'Cross', 'Stone', 'Walker', 'Ryder'],
    roles: ['Wasteland Scavenger', 'Shelter Vault Dweller', 'Caravan Scout', 'Radio Engineer', 'Gunsmith Wanderer'],
    races: ['Human Scavenger', 'Wasteland Nomad', 'Cyber-Enhanced Survivor'],
    physicalTraits: [
      'Resilient build, dust-streaked face, amber goggles resting on the forehead, patchwork leather duster.'
    ],
    hooks: [
      {
        hook: 'Shelter 44 doors hiss open. Fresh desert air rushes in.',
        actions: ['Calibrate counter', 'Scout ridge', 'Inspect checkpoint'],
        gear: [{ name: 'Rifle', type: 'weapon', isEquipped: true }, { name: 'Counter', type: 'misc' }],
        spells: [],
        hp: 12
      },
      {
        hook: 'The caravan engine stalls. Raiders are visible on the horizon, kicking up red dust.',
        actions: ['Fix engine', 'Prepare defense', 'Scan threats'],
        gear: [{ name: 'Pistol', type: 'weapon', isEquipped: true }, { name: 'Wrench', type: 'misc' }],
        spells: [],
        hp: 10
      },
      {
        hook: 'A radio signal breaks the silence. A settlement is calling for help 50 miles away.',
        actions: ['Triangulate signal', 'Pack gear', 'Check bike'],
        gear: [{ name: 'Radio', type: 'misc', isEquipped: true }, { name: 'Machete', type: 'weapon' }],
        spells: [],
        hp: 11
      }
    ]
  },

  zombie: {
    titles: [
      'Outbreak Protocol: Chapter I',
      'Quarantine Zone 7: Chapter I',
      'The Morning of Day Zero: Chapter I',
      'St. Jude Memorial Code Silver: Chapter I',
      'The Highway Barricade: Chapter I'
    ],
    firstNames: ['Marcus', 'Dr. Evelyn', 'Officer Ramos', 'Chloe', 'David', 'Sam', 'Sarah'],
    lastNames: ['Reid', 'Chen', 'Vance', 'Mercer', 'Hayes', 'Walker', 'Torres'],
    roles: ['Virology Specialist', 'First Responder Officer', 'Trauma Surgeon', 'Logistics Coordinator', 'Field Medic'],
    races: ['Human Specialist', 'Hospital Staff Survivor', 'Tactical Officer'],
    physicalTraits: [
      'Focused gaze, sterile white lab coat with an emergency hospital ID badge clipped to the chest, rubber-gripped tactical flashlight.'
    ],
    hooks: [
      {
        hook: 'Code Silver alert at St. Jude’s. The East Wing is locked down.',
        actions: ['Check logs', 'Gather kit', 'Look out window'],
        gear: [{ name: 'Flashlight', type: 'weapon', isEquipped: true }, { name: 'First Aid', type: 'potion' }],
        spells: [],
        hp: 10
      },
      {
        hook: 'The police barricade has fallen. You are in the last patrol car, and the radio is filled with screaming.',
        actions: ['Start engine', 'Check weapon', 'Find route'],
        gear: [{ name: 'Service Pistol', type: 'weapon', isEquipped: true }, { name: 'Radio', type: 'misc' }],
        spells: [],
        hp: 11
      },
      {
        hook: 'Your apartment building stairs are blocked by something groaning. The fire escape is your only way down.',
        actions: ['Check rope', 'Grab bag', 'Climb out'],
        gear: [{ name: 'Bat', type: 'weapon', isEquipped: true }, { name: 'Rope', type: 'misc' }],
        spells: [],
        hp: 9
      }
    ]
  },

  cosmic_horror: {
    titles: [
      'The Shadow over Miskatonic: Chapter I',
      'The Whispering Star Chart: Chapter I',
      'The Arkham Vault Manuscript: Chapter I',
      'Echoes of the Obsidian Monolith: Chapter I',
      'The Black Tide of Innsmouth: Chapter I'
    ],
    firstNames: ['Professor Thomas', 'Arthur', 'Eleanor', 'Vivian', 'Julian', 'Edmund', 'Beatrice'],
    lastNames: ['Armitage', 'Blackwood', 'Dyer', 'Peabody', 'Ward', 'Pickman', 'Carter'],
    roles: ['Antiquarian Scholar', 'Professor of Archaeology', 'Archive Researcher', 'Astronomy Lecturer', 'Occult Historian'],
    races: ['Human Scholar', 'Miskatonic Faculty', 'Esoteric Initiate'],
    physicalTraits: [
      'Tweed jacket with elbow patches, brass spectacles perched on the nose, carrying a leather notebook filled with handwritten Greek and Babylonian translations.'
    ],
    hooks: [
      {
        hook: 'Rain at Miskatonic library. A telegram from Armitage requests a vault key.',
        actions: ['Request catalog', 'Examine globe', 'Transcribe'],
        gear: [{ name: 'Walking Stick', type: 'weapon', isEquipped: true }, { name: 'Telegram', type: 'relic' }],
        spells: ['Identify'],
        hp: 10
      },
      {
        hook: 'The telescope lens cracked tonight. You saw something in the void that defies the stars.',
        actions: ['Check star chart', 'Clean lens', 'Hide notes'],
        gear: [{ name: 'Notebook', type: 'misc', isEquipped: true }, { name: 'Magnifier', type: 'relic' }],
        spells: ['Detect Magic'],
        hp: 9
      },
      {
        hook: 'The tide is coming in, and the carvings on the beach are moving on their own.',
        actions: ['Sketch carvings', 'Retreat to car', 'Check compass'],
        gear: [{ name: 'Camera', type: 'misc', isEquipped: true }, { name: 'Dagger', type: 'weapon' }],
        spells: ['Comprehend Languages'],
        hp: 11
      }
    ]
  },

  psychedelic_trip: {
    titles: [
      'The Kaleidoscope Nexus: Chapter I',
      'The Meadow of Synesthesia: Chapter I',
      'Harmonies of the Prismatic Void: Chapter I',
      'The River of Liquid Starlight: Chapter I',
      'Threshold of the Aurora Garden: Chapter I'
    ],
    firstNames: ['Orion', 'Solana', 'Kairo', 'Lyra', 'Zephyr', 'Astra', 'Echo', 'Indigo'],
    lastNames: ['Prism', 'Vortex', 'Chroma', 'Harmonia', 'Lumina', 'Solstice', 'Mirage'],
    roles: ['Dimensional Nomad', 'Prismatic Weaver', 'Harmonic Seeker', 'Cosmic Lucid Voyager', 'Synthesist'],
    races: ['Astral Being', 'Consciousness Wanderer', 'Lightbound Entity'],
    physicalTraits: [
      'Iridescent clothing that subtly shifts color in the ambient light, calm serene smile, carrying a resonant crystal chime staff.'
    ],
    hooks: [
      {
        hook: 'A door of iridescent light opens. You step into the Meadow of Synesthesia.',
        actions: ['Ring chime', 'Observe patterns', 'Talk to flower'],
        gear: [{ name: 'Chime Staff', type: 'weapon', isEquipped: true }],
        spells: ['Color Shift'],
        hp: 12
      },
      {
        hook: 'Liquid starlight flows up the river. It tastes like memories.',
        actions: ['Drink drop', 'Measure frequency', 'Float'],
        gear: [{ name: 'Crystal Vial', type: 'potion', isEquipped: true }],
        spells: ['Astral Float'],
        hp: 10
      },
      {
        hook: 'The sky folds into a triangle. You are drifting between realities.',
        actions: ['Stabilize vision', 'Tune resonance', 'Dream'],
        gear: [{ name: 'Prismatic Robe', type: 'armor', isEquipped: true }],
        spells: ['Sonic Harmony'],
        hp: 11
      }
    ]
  },

  tiktok_drama: {
    titles: [
      'The Secret Heiress\'s 3-Year Test: Chapter I',
      'The $50 Billion Signet Ring: Chapter I',
      'Undercover Chairman\'s Morning Shift: Chapter I',
      'The Grand Mirage Hotel Gala: Chapter I',
      'The Billionaire\'s Silent Return: Chapter I'
    ],
    firstNames: ['Victoria', 'Alexander', 'Chloe', 'Sebastian', 'Serena', 'Lucas', 'Julian', 'Vivian'],
    lastNames: ['Sterling', 'Vance', 'DuPont', 'Rothschild', 'Sinclair', 'Fairfax', 'Montgomery'],
    roles: ['Undercover Heiress', 'Disguised Chairman', 'Corporate Strategist', 'Secret Tycoon', 'Executive Envoy'],
    races: ['Billionaire Heiress', 'Disguised Tycoon', 'Executive Sovereign'],
    physicalTraits: [
      'Dressed in simple hotel staff attire but with impeccable regal posture and piercing sapphire eyes, carrying an antique heirloom ring hidden inside a tote bag.'
    ],
    hooks: [
      {
        hook: 'Morning at the Grand Mirage. You have your grandmother’s signet ring in your tote.',
        actions: ['Check seating', 'Talk to chef', 'Check phone'],
        gear: [{ name: 'Signet Ring', type: 'relic', isEquipped: true }, { name: 'ID', type: 'armor' }],
        spells: ['Insightful Observation'],
        hp: 10
      },
      {
        hook: 'The $50B deal is today. You wear a cheap suit, but you hold the power.',
        actions: ['Review contract', 'Scan guests', 'Check accounts'],
        gear: [{ name: 'Tablet', type: 'misc', isEquipped: true }],
        spells: ['Authoritative Presence'],
        hp: 11
      },
      {
        hook: 'The gala host just accused you of being a fraud. Everyone is watching.',
        actions: ['Show ring', 'Laugh', 'Walk away'],
        gear: [{ name: 'Ring', type: 'relic', isEquipped: true }],
        spells: ['Graceful Composure'],
        hp: 12
      }
    ]
  },

  ancient_greek: {
    titles: [
      'The Oracle\'s Prophecy: Chapter I',
      'The Spartan Vanguard at Mount Parnassus: Chapter I',
      'Trials of the Olympian Altar: Chapter I',
      'The Minotaur\'s Bronze Seal: Chapter I',
      'Dawn of the Parthenon Envoy: Chapter I'
    ],
    firstNames: ['Perseus', 'Leonidas', 'Thalia', 'Kassandra', 'Demetrius', 'Alexios', 'Iphigenia', 'Nikolaos'],
    lastNames: ['of Sparta', 'of Athens', 'of Thebes', 'of Corinth', 'of Mycenae', 'Parnassos'],
    roles: ['Hoplite Hero', 'Spartan Vanguard', 'Delphic Oracle Scholar', 'Demigod Champion', 'Olympic Pankration Duelist'],
    races: ['Spartan Demigod', 'Athenian Citizen', 'Mycenaean Warrior'],
    physicalTraits: [
      'Athletic muscular frame, sun-darkened skin, scarlet crest helmet, carrying a polished bronze aspis shield and iron-tipped dory spear.'
    ],
    hooks: [
      {
        hook: 'Sunlight on the Temple of Apollo. You have come for a prophecy.',
        actions: ['Offer tribute', 'Speak to herald', 'Inspect murals'],
        gear: [{ name: 'Dory Spear', type: 'weapon', isEquipped: true }, { name: 'Aspis', type: 'armor' }],
        spells: ['Spartan Courage'],
        hp: 13
      },
      {
        hook: 'The Minotaur’s labyrinth is ahead. Your bronze seal is glowing.',
        actions: ['Trace maze', 'Sharpen spear', 'Prepare'],
        gear: [{ name: 'Bronze Seal', type: 'relic', isEquipped: true }],
        spells: ['Athena\'s Guidance'],
        hp: 12
      },
      {
        hook: 'Olympic games. The crowd chants your name. You need to win to prove your lineage.',
        actions: ['Stretch', 'Pray', 'Check gear'],
        gear: [{ name: 'Oil', type: 'potion', isEquipped: true }],
        spells: ['Spartan Courage'],
        hp: 11
      }
    ]
  },

  mythology: {
    titles: [
      'The Bifrost Watch: Chapter I',
      'The Scales of Ma\'at: Chapter I',
      'The Gate of Tír na nÓg: Chapter I',
      'The Alchemist\'s Magnum Opus: Chapter I',
      'Echoes of Valhalla: Chapter I'
    ],
    firstNames: ['Freya', 'Sigurd', 'Astrid', 'Torin', 'Hervor', 'Anhur', 'Ciaran', 'Althea'],
    lastNames: ['Stormweaver', 'Ironfist', 'Frostbane', 'Ravenheart', 'Goldenhair', 'Mooncaller'],
    roles: ['Valkyrie Champion', 'Einherjar Guard', 'Priest of Anubis', 'Celtic Druid Herald', 'Hermetic Alchemist'],
    races: ['Valkyrie Spirit', 'Asgardian Warrior', 'Egyptian High Priest', 'Tuatha Dé Danann'],
    physicalTraits: [
      'Radiant auroral glow surrounding silver hair, engraved wing motifs across light plate armor, wielding a runic silver spear.'
    ],
    hooks: [
      {
        hook: 'Bifrost Bridge glows. Heimdall nods as you arrive.',
        actions: ['Receive assignment', 'Use spyglass', 'Inscribe rune'],
        gear: [{ name: 'Silver Spear', type: 'weapon', isEquipped: true }, { name: 'Aegis', type: 'armor' }],
        spells: ['Rune Ward'],
        hp: 12
      },
      {
        hook: 'The Scales of Ma\'at weigh your heart. The feather is light.',
        actions: ['Meditate', 'Ask Anubis', 'Look at soul'],
        gear: [{ name: 'Scale', type: 'relic', isEquipped: true }],
        spells: ['Bifrost Shimmer'],
        hp: 10
      },
      {
        hook: 'Tír na nÓg gate is open. The fairy music is intoxicating.',
        actions: ['Enter gate', 'Hold breath', 'Check charm'],
        gear: [{ name: 'Charm', type: 'misc', isEquipped: true }],
        spells: ['Valhalla Guidance'],
        hp: 11
      }
    ]
  },

  real_life: {
    titles: [
      'The Shibuya Nexus Assignment: Chapter I',
      'The 42nd Floor Panel Interview: Chapter I',
      'Night Shift at the 24/7 Terminal: Chapter I',
      'The Emergency HOA Board Meeting: Chapter I',
      'The Airport Connection Sprint: Chapter I'
    ],
    firstNames: ['Alex', 'Morgan', 'Taylor', 'Jordan', 'Sam', 'Riley', 'Casey', 'Jesse'],
    lastNames: ['Rivera', 'Kovacs', 'Tanaka', 'Chen', 'Vance', 'Patel', 'Hayes', 'Morrison'],
    roles: ['Infiltration Security Consultant', 'Senior Systems Architect', 'Crisis Resolution Specialist', 'Logistics Coordinator', 'Investigative Journalist'],
    races: ['Human', 'Corporate Strategist', 'Field Specialist'],
    physicalTraits: [
      'Clean tailored dark navy suit, polished Oxford shoes, dark rimmed glasses, carrying an encrypted leather briefcase.'
    ],
    hooks: [
      {
        hook: 'Shibuya crosswalk. You have your briefcase for the Nexus Corporation job.',
        actions: ['Check in', 'Grab coffee', 'Observe gates'],
        gear: [{ name: 'Multi-Tool', type: 'weapon', isEquipped: true }, { name: 'Letter', type: 'misc' }],
        spells: [],
        hp: 11
      },
      {
        hook: '42nd-floor panel interview. You are overqualified, but they don’t know that.',
        actions: ['Fix tie', 'Review resume', 'Check notes'],
        gear: [{ name: 'Tablet', type: 'misc', isEquipped: true }],
        spells: [],
        hp: 10
      },
      {
        hook: 'Night shift. Terminal 4 is empty, but your server alert is flashing red.',
        actions: ['Login', 'Check power', 'Call boss'],
        gear: [{ name: 'Pen', type: 'weapon', isEquipped: true }],
        spells: [],
        hp: 9
      }
    ]
  }
};

/**
 * Procedurally generates a completely randomized, unique 5-field campaign setup
 * guaranteed to start at Act 1, Scene 1 for the given category.
 */
export function generateRandomScenarioSetup(category: ExperienceCategory): RandomizedScenarioData {
  const data = CATEGORY_GENERATOR_DATA[category] || CATEGORY_GENERATOR_DATA.fantasy;

  // 1. Roll Random Title with dynamic combinations
  const titlePrefixes = ['The Legend of', 'Chronicles of', 'Whispers from', 'The Mystery of', 'Shadows over', 'The Rise of', 'Secrets of', 'The Prophecy of'];
  const titleTemplates = data.titles || [];
  let title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  if (Math.random() > 0.5 && titleTemplates.length > 0) {
    const prefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
    const noun = titleTemplates[Math.floor(Math.random() * titleTemplates.length)].replace(/^The\s+|^Chronicles\s+of\s+|^Whispers\s+of\s+/, '');
    title = `${prefix} ${noun}`;
  }

  // 2. Roll Random Hero Name
  const firstNames = data.firstNames || ['Aiden', 'Lyra', 'Rowan', 'Kaelen', 'Elena', 'Dorian', 'Valen'];
  const lastNames = data.lastNames || ['Vance', 'Sterling', 'Blackwood', 'Ironheart', 'Dawnbringer', 'Ashford'];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const heroName = `${first} ${last}`;

  // 3. Roll Random Role & Race
  const roles = data.roles || ['Adventurer', 'Knight', 'Scout', 'Mage', 'Rogue'];
  const races = data.races || ['Human', 'Elf', 'Dwarf', 'Outlander'];
  const roleClass = roles[Math.floor(Math.random() * roles.length)];
  const raceOrigin = races[Math.floor(Math.random() * races.length)];

  // 4. Roll Physical Traits
  const traits = data.physicalTraits || [];
  const physicalDescription = traits.length > 0
    ? traits[Math.floor(Math.random() * traits.length)]
    : `${heroName} is a ${raceOrigin} ${roleClass} with an observant gaze, steady posture, and tailored traveling gear.`;

  // 5. Roll Hook & Gear
  const hooks = data.hooks && data.hooks.length > 0 ? data.hooks : [{
    hook: `The morning air is crisp as ${heroName}, a ${raceOrigin} ${roleClass}, arrives at the starting crossroads. Your journey begins with your essential gear packed and your primary weapon ready.`,
    actions: ['Investigate the immediate surroundings', 'Speak with the nearest local contact', 'Check your supplies and prepare an action'],
    gear: [{ name: 'Primary Weapon', type: 'weapon' as const, isEquipped: true }],
    spells: ['Focus Ability'],
    hp: 12
  }];

  const hookObj = hooks[Math.floor(Math.random() * hooks.length)];
  let formattedHook = hookObj.hook;

  const inventory: InventoryItem[] = (hookObj.gear || []).map((g, idx) => ({
    id: `item_${Date.now()}_${idx}_${Math.floor(Math.random() * 10000)}`,
    name: g.name,
    type: g.type,
    quantity: 1,
    isEquipped: !!g.isEquipped,
    description: g.description
  }));

  return {
    title,
    heroName,
    roleClass,
    raceOrigin,
    hookText: formattedHook,
    physicalDescription,
    suggestedActions: hookObj.actions || [
      'Investigate the surroundings',
      'Interact with the nearest entity',
      'Ready equipment'
    ],
    initialInventory: inventory,
    initialSpells: hookObj.spells || [],
    initialConditions: ['Well-Rested'],
    startingHp: hookObj.hp || 12
  };
}

