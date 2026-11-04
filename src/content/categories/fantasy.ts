import type { CategoryContent } from '../types';

// Fantasy. Openers, tropes and media are checked by scripts/validate-content.ts.
export const fantasy = {
  "card": {
    "name": "Fantasy",
    "tagline": "D&D 5e Sagas, Dragon Seals & Ancient Catacombs",
    "description": "Venture through mystical realms drawn from classic D&D campaigns and iconic fantasy literature: cracked dragon seals, ancient crypts, mysterious tavern quest-givers, and wild magic.",
    "iconName": "Wand2",
    "gradient": "from-amber-600/30 via-purple-900/40 to-slate-950",
    "accentColor": "#f59e0b",
    "bgTheme": "dungeon",
    "defaultCharacter": {
      "name": "Valerius Starfall",
      "roleClass": "Eldritch Knight",
      "raceOrigin": "High Elf",
      "level": 1,
      "hp": 12,
      "maxHp": 12,
      "armorClass": 15,
      "initiativeBonus": 2,
      "stats": {
        "str": 15,
        "dex": 14,
        "con": 14,
        "int": 14,
        "wis": 12,
        "cha": 10
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Runic Longsword",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Chain Shirt & Travel Cloak",
          "type": "armor",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i3",
          "name": "Healing Potion",
          "type": "potion",
          "quantity": 2
        },
        {
          "id": "i4",
          "name": "Pouch of 15 Gold Coins",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [
        "Shield",
        "Magic Missile",
        "Light",
        "Mage Hand"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "An aspiring knight who has traveled to the frontier to investigate ancient prophecies."
    },
    "samplePrompts": [
      "I approach Elder Bram outside the tavern to learn about the urgent summons.",
      "I step into the Prancing Griffin Tavern to gather local rumors and buy supplies.",
      "I inspect the ancient runic boundary stone at the village gates with an Arcana check."
    ]
  },
  "profile": {
    "seedSource": "Classic D&D 5e Campaigns & Iconic Tabletop Fantasy Literature",
    "voice": "Evocative, adventurous, steeped in rich world lore. Balances the epic scale of dragon seals and ancient crypts with the warmth of frontier taverns and companions.",
    "atmosphere": "Misty cobblestone crossroads, crackling oak hearths, weathered traveling cloaks, glowing runic boundary stones, pine-scented frontier breezes, ancient catacomb echoes.",
    "sceneStructure": "1. Arrival at frontier village or ancient ruins -> 2. Environmental grounding & local lore -> 3. Summons from elder, patron, or warning sign -> 4. Immediate arcane/tactical choice fork.",
    "storyBeats": "Classic heroic progression: setting out on the road, discovering ancient seals or strange tracks, engaging in tactical combat or arcane checks, uncovering deeper mysteries.",
    "characterDynamics": "Eldritch knights, wandering bladesingers, village elders, mysterious cloaked scholars, tavern innkeepers, frontier rangers.",
    "encounterPatterns": "Tavern rumor-gathering, deciphering runic tablets (Arcana Check), inspecting mysterious beast tracks, ancient crypt seals, road ambushes.",
    "sensoryMotifs": [
      "The rich aroma of roasted stew, spiced cider, and woodsmoke from the tavern hearth",
      "The faint violet luminescence humming from ancient carved runic stones",
      "Raindrops pattering against a waxed leather traveling cloak and steel pommel",
      "The scrape of an ancestral longsword drawn cleanly from its scabbard"
    ],
    "avoid": "Modern technology, modern slang, immersion-breaking contemporary references, flat stat-sheet narration without vivid imagery.",
    "avoidKeywords": [
      "smartphone",
      "phone",
      "laptop",
      "internet",
      "computer",
      "email",
      "wifi",
      "gun"
    ]
  },
  "media": [
    {
      "title": "The Lord of the Rings",
      "medium": "Books/Films"
    },
    {
      "title": "Dungeons & Dragons: Honor Among Thieves",
      "medium": "Film"
    },
    {
      "title": "Baldur's Gate 3",
      "medium": "Game"
    },
    {
      "title": "The Witcher",
      "medium": "Books/Games"
    },
    {
      "title": "Critical Role",
      "medium": "Web Series"
    },
    {
      "title": "A Song of Ice and Fire / Game of Thrones",
      "medium": "Books/TV"
    },
    {
      "title": "The Name of the Wind",
      "medium": "Book"
    },
    {
      "title": "Mistborn",
      "medium": "Book Series"
    },
    {
      "title": "Dragon Age: Origins",
      "medium": "Game"
    },
    {
      "title": "The Stormlight Archive",
      "medium": "Book Series"
    },
    {
      "title": "Skyrim",
      "medium": "Game"
    },
    {
      "title": "Divinity: Original Sin 2",
      "medium": "Game"
    },
    {
      "title": "Malazan Book of the Fallen",
      "medium": "Book Series"
    },
    {
      "title": "The Earthsea Cycle",
      "medium": "Book Series"
    },
    {
      "title": "The Legend of Vox Machina",
      "medium": "TV Show"
    },
    {
      "title": "World of Warcraft",
      "medium": "Game"
    },
    {
      "title": "Neverwinter Nights",
      "medium": "Game"
    },
    {
      "title": "The Wheel of Time",
      "medium": "Book Series"
    },
    {
      "title": "Pathfinder: Wrath of the Righteous",
      "medium": "Game"
    },
    {
      "title": "The Chronicles of Narnia",
      "medium": "Books"
    }
  ],
  "openers": [
    {
      "id": "seed_fan_01",
      "title": "The Shattered Boundary Stone",
      "tagline": "The frontier ward is broken and the village elder holds a bloody key.",
      "premise": "You arrive at the mist-covered crossroads of Oakhaven at twilight. The ancient glowing runic boundary stone has been split cleanly by dark iron, and the terrified village elder clutches a bloody bronze key, begging you to descend into the crypt before the blood moon rises.",
      "hero": {
        "name": "Eldrin Sunstrider",
        "role": "Eldritch Bladesinger",
        "origin": "High Elf"
      },
      "actions": [
        "Examine the fractured boundary stone with an Arcana Check to identify the spell residue.",
        "Question the elder about who gave him the bronze key and where the guards have gone.",
        "Draw your ancestral blade and lead the nervous militia toward the cemetery gate."
      ],
      "gear": [
        {
          "name": "Runic Longsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Chain Shirt & Cloak",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Healing Potion",
          "type": "potion"
        },
        {
          "name": "Explorer's Pack & 15 Gold",
          "type": "misc"
        }
      ],
      "spells": [
        "Shield",
        "Magic Missile",
        "Light"
      ],
      "hp": 12
    },
    {
      "id": "seed_fan_02",
      "title": "The Sealed Wyrm's Tooth",
      "tagline": "An ancient obsidian dagger pulses with dragon fire in the village smithy.",
      "premise": "While having your horse reshod at the Ironforge anvil, an apprentice drops an ancient obsidian dagger unearthed from the coal bin. The blade ignites with searing dragon flame, burning runic verses into the stone floor that call out your true family surname.",
      "hero": {
        "name": "Kaelen Drake",
        "role": "Dragon Knight",
        "origin": "Human Veteran"
      },
      "actions": [
        "Grasp the hilt with your gauntlet and test if your dragon-blood grants fire immunity.",
        "Extinguish the flame with forge quench-water and study the inscribed verses.",
        "Bar the forge doors as dark cult scouts circle the outer perimeter."
      ],
      "gear": [
        {
          "name": "Carved Oak Quarterstaff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Traveler's Robes & Herbal Pouch",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Vial of Sacred Spring Water",
          "type": "potion"
        },
        {
          "name": "Divination Bones & Parchment",
          "type": "misc"
        }
      ],
      "spells": [
        "Guidance",
        "Cure Wounds",
        "Entangle"
      ],
      "hp": 11
    },
    {
      "id": "seed_fan_03",
      "title": "The Disgraced Paladin's Oath",
      "tagline": "Stripped of holy rank for refusing to purge an innocent village.",
      "premise": "The High Inquisitor broke your silver holy symbol and cast you out of the Radiant Order for sparing a village of tiefling refugees. Now, armed only with a notched steel longsword and your unyielding faith, you spot the Inquisitor's elite inquisitorial hounds hunting the very children you saved.",
      "hero": {
        "name": "Sir Gareth Vale",
        "role": "Oath of Devotion Paladin",
        "origin": "Human Exile"
      },
      "actions": [
        "Interpose your steel shield between the hunting hounds and the refugee wagon.",
        "Cast Divine Favor on your blade and prepare a defensive stand at the stone bridge.",
        "Lead the refugees through the concealed briar trail into the ancient fey woods."
      ],
      "gear": [
        {
          "name": "Balanced Steel Broadsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Reinforced Scale Armor",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Bandage Kit & Dwarven Stout",
          "type": "potion"
        },
        {
          "name": "Climbing Pitons & 50ft Rope",
          "type": "misc"
        }
      ],
      "spells": [
        "True Strike",
        "Heroism"
      ],
      "hp": 13
    },
    {
      "id": "seed_fan_04",
      "title": "The Sunken Temple of the Tides",
      "tagline": "The tide recedes only once every fifty years — revealing the obsidian portal.",
      "premise": "As the great eclipse begins, the ocean recedes three miles from the harbor docks, exposing the coral-encrusted steps of the Sunken Temple of Moradin. Armed with a brass water-breathing charm and a tide chart, you race against sea cultists to reach the sunken sanctum before the ocean returns.",
      "hero": {
        "name": "Lyra Deepgale",
        "role": "Storm Sorcerer",
        "origin": "Half-Elf"
      },
      "actions": [
        "Sprint across the wet sand dunes to reach the temple entrance ahead of the cultists.",
        "Cast Thunderwave to scatter the amphibious sahuagin scouts guarding the archway.",
        "Read the glowing tideshift glyphs to calculate how many minutes remain before flood tide."
      ],
      "gear": [
        {
          "name": "Runic Longsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Chain Shirt & Cloak",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Healing Potion",
          "type": "potion"
        },
        {
          "name": "Explorer's Pack & 15 Gold",
          "type": "misc"
        }
      ],
      "spells": [
        "Shield",
        "Magic Missile",
        "Light"
      ],
      "hp": 12
    },
    {
      "id": "seed_fan_05",
      "title": "The Stolen Spellbook of Mordenkainen",
      "tagline": "A wizard's apprentice flees into your tavern with an archmage's grimoire.",
      "premise": "A wounded gnome apprentice crashes through the frosted tavern window, thrusting a chain-bound leather grimoire into your hands. As shadow gargoyles land on the tavern roof, the book's eye opens and speaks directly into your mind.",
      "hero": {
        "name": "Zephyr Blackthorn",
        "role": "Abjuration Wizard",
        "origin": "Gnome Prodigy"
      },
      "actions": [
        "Cast Shield as the first gargoyle crashes through the timber ceiling.",
        "Open the grimoire to unleash its stored counterspell against the summoner outside.",
        "Rally the tavern patrons to barricade the cellar and extinguish all light."
      ],
      "gear": [
        {
          "name": "Carved Oak Quarterstaff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Traveler's Robes & Herbal Pouch",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Vial of Sacred Spring Water",
          "type": "potion"
        },
        {
          "name": "Divination Bones & Parchment",
          "type": "misc"
        }
      ],
      "spells": [
        "Guidance",
        "Cure Wounds",
        "Entangle"
      ],
      "hp": 11
    },
    {
      "id": "seed_fan_06",
      "title": "The Necromancer's Tollgate",
      "tagline": "The mountain pass is guarded by spectral sentinels demanding blood-coins.",
      "premise": "The only road across the Frozen Spine pass is now fortified by a renegade necromancer who charges travelers with memories and blood-coins. As a blizzard sets in, you find an abandoned wagon train at the barrier with one surviving child hidden in the chest.",
      "hero": {
        "name": "Vespera Nightshade",
        "role": "Shadow Sorceress",
        "origin": "Tiefling"
      },
      "actions": [
        "Channel dark vision to scout the necromancer's bone-scaffold watchtowers.",
        "Feed healing tea to the frozen child and warm her by a magical spark.",
        "Step forward to the toll archway and display your sovereign arcane sigil."
      ],
      "gear": [
        {
          "name": "Balanced Steel Broadsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Reinforced Scale Armor",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Bandage Kit & Dwarven Stout",
          "type": "potion"
        },
        {
          "name": "Climbing Pitons & 50ft Rope",
          "type": "misc"
        }
      ],
      "spells": [
        "True Strike",
        "Heroism"
      ],
      "hp": 13
    },
    {
      "id": "seed_fan_07",
      "title": "The Cursed Forest Heart",
      "tagline": "The Great Oak is weeping black sap — and the dryads have gone blind.",
      "premise": "Deep in the Whispering Woods, the ancient Elder Tree is bleeding corrupted ichor into the river. The guardian dryads wander blind and maddened, attacking any traveler who approaches. You discover an iron dagger driven directly into the heartwood root.",
      "hero": {
        "name": "Bramble Thorne",
        "role": "Circle of the Moon Druid",
        "origin": "Wood Elf"
      },
      "actions": [
        "Wild Shape into a dire wolf to leap over the thorny brambles toward the root.",
        "Commune with nature spirits using Druidcraft to soothe the frantic dryads.",
        "Grasp the cursed iron dagger and channel Nature's Wrath to draw it out."
      ],
      "gear": [
        {
          "name": "Runic Longsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Chain Shirt & Cloak",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Healing Potion",
          "type": "potion"
        },
        {
          "name": "Explorer's Pack & 15 Gold",
          "type": "misc"
        }
      ],
      "spells": [
        "Shield",
        "Magic Missile",
        "Light"
      ],
      "hp": 12
    },
    {
      "id": "seed_fan_08",
      "title": "The Alchemist's Golden Plague",
      "tagline": "Victims are slowly turning to solid, living gold.",
      "premise": "In the mining city of Goldcrest, a strange contagion is spreading from the royal vaults: victims' skin slowly crystallizes into solid, reflective gold, freezing their joints while keeping their minds fully aware. The Guildmaster has locked the city gates.",
      "hero": {
        "name": "Aurelius Kane",
        "role": "Alchemical Inquisitor",
        "origin": "Mountain Dwarf"
      },
      "actions": [
        "Examine an infected miner's golden arm with your jeweler's glass and reagent kit.",
        "Confront the Guildmaster in the counting house about the imported transmutation dust.",
        "Brew a sulfur-mercury counter-agent before the contagion spreads to the drinking wells."
      ],
      "gear": [
        {
          "name": "Carved Oak Quarterstaff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Traveler's Robes & Herbal Pouch",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Vial of Sacred Spring Water",
          "type": "potion"
        },
        {
          "name": "Divination Bones & Parchment",
          "type": "misc"
        }
      ],
      "spells": [
        "Guidance",
        "Cure Wounds",
        "Entangle"
      ],
      "hp": 11
    },
    {
      "id": "seed_fan_09",
      "title": "The Celestial Comet Shard",
      "tagline": "A fallen star crashes into the frontier monastery courtyard.",
      "premise": "A blazing silver comet strikes the courtyard of St. Jude's Monastery at midnight, leaving a crater filled with celestial starlight glass. As the monks begin chanting in terror, celestial heralds and abyss demons converge simultaneously on the glowing crater.",
      "hero": {
        "name": "Seraphina Dawn",
        "role": "Celestial Warlock",
        "origin": "Aasimar"
      },
      "actions": [
        "Grasp the glowing starlight shard and absorb its radiant power into your arcane focus.",
        "Erect a sacred protective circle around the wounded monks.",
        "Confront the descending abyss demon commander before he reaches the crater rim."
      ],
      "gear": [
        {
          "name": "Balanced Steel Broadsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Reinforced Scale Armor",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Bandage Kit & Dwarven Stout",
          "type": "potion"
        },
        {
          "name": "Climbing Pitons & 50ft Rope",
          "type": "misc"
        }
      ],
      "spells": [
        "True Strike",
        "Heroism"
      ],
      "hp": 13
    },
    {
      "id": "seed_fan_10",
      "title": "The Ghost Ship of the Iron Shoals",
      "tagline": "An elven galleon drifts into harbor with sails of green witchlight.",
      "premise": "An ancient elven galleon thought lost for three centuries drifts silently into the harbor on an unnatural fog. Its hull is pristine, its lanterns burn with cold green flame, and the ship's logbook sits open on the captain's table with wet ink recording your arrival.",
      "hero": {
        "name": "Captain Corin Drake",
        "role": "Swashbuckler Rogue",
        "origin": "Half-Elf Sailor"
      },
      "actions": [
        "Board the ghost galleon via the rope ladder with your cutlass drawn.",
        "Read the freshly written ink entry in the captain's leather logbook.",
        "Inspect the cargo hold where glowing runic crates hum in harmony with the sea."
      ],
      "gear": [
        {
          "name": "Runic Longsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Chain Shirt & Cloak",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Healing Potion",
          "type": "potion"
        },
        {
          "name": "Explorer's Pack & 15 Gold",
          "type": "misc"
        }
      ],
      "spells": [
        "Shield",
        "Magic Missile",
        "Light"
      ],
      "hp": 12
    }
  ],
  "tropes": [
    {
      "premise": "The tavern falls silent as a cloaked figure drops a severed goblin head onto your table and slides over a heavy pouch of gold."
    },
    {
      "premise": "A cracked dragon seal in the catacombs begins to glow with a sickly green light, and the ground beneath you trembles."
    },
    {
      "premise": "The dying king thrusts a rusted, bloodstained crown into your hands, whispering a prophecy before drawing his last breath."
    },
    {
      "premise": "You awaken in a dungeon cell with no memory of how you arrived, only a mysterious arcane brand burning on your forearm."
    },
    {
      "premise": "The ancient bridge over the chasm begins to crumble as a massive wyvern swoops down from the mountain peaks."
    },
    {
      "premise": "A traveling merchant offers you a cursed mirror that reflects a horrific, alternate version of the room you're standing in."
    },
    {
      "premise": "The guildmaster slams a map on the table, pointing to a newly discovered continent completely unmarred by civilization."
    },
    {
      "premise": "As you read the arcane scroll, the ink slithers off the parchment and forms a sentient, shadowy familiar on your desk."
    },
    {
      "premise": "The town guards refuse to let anyone leave the gates, citing a plague of undeath that rises whenever the moon is full."
    },
    {
      "premise": "You step into the fae wilds and immediately realize the trees are whispering your darkest secrets to one another."
    },
    {
      "premise": "A legendary sword is lodged not in a stone, but in the chest of a sleeping titan that forms the landscape of the valley."
    },
    {
      "premise": "The grand archmage summons you to her tower, only to reveal she has been murdered and you are speaking to her lingering ghost."
    },
    {
      "premise": "During the harvest festival, the bonfire flares purple and a demon steps out, demanding the town's firstborn children."
    },
    {
      "premise": "You find a shipwreck in the middle of a dense forest, entirely landlocked and filled with untouched treasure."
    },
    {
      "premise": "The high priest of the sun god is caught performing a ritual of pure, forbidden blood magic in the temple undercroft."
    },
    {
      "premise": "A seemingly abandoned dwarven mine echoes with the rhythmic, mechanical pounding of a forge that hasn't been lit in centuries."
    },
    {
      "premise": "The royal assassin misses their target and falls at your feet, pressing a note into your palm that reads, \"You are next.\""
    },
    {
      "premise": "An elemental rift tears open the sky above the capital city, raining molten ash and cinder-demons onto the streets."
    },
    {
      "premise": "You pull a shimmering silver thread from a loom of fate, and suddenly the timeline of your past begins to rewrite itself."
    },
    {
      "premise": "The ancient dragon awakes, but instead of attacking, it bows its massive head and addresses you as its long-lost master."
    }
  ],
  "procedural": {
    "titles": [
      "The Prophecy of Sunken Aethelgard: Chapter I",
      "Whispers of the Runic Gates: Chapter I",
      "The Ember of the Dragon Shrine: Chapter I",
      "Shadows of the Silverwood: Chapter I",
      "The Forgotten Seal of Morndun: Chapter I",
      "Chronicles of the Starfall Spire: Chapter I"
    ],
    "firstNames": [
      "Valerius",
      "Lyra",
      "Kaelen",
      "Bram",
      "Elian",
      "Seraphina",
      "Garrick",
      "Morwenna",
      "Thoran",
      "Astrid"
    ],
    "lastNames": [
      "Starfall",
      "Ravenshadow",
      "Ironwood",
      "Silverhand",
      "Dawnbringer",
      "Ashford",
      "Moonwhisper",
      "Stormrider"
    ],
    "roles": [
      "Eldritch Knight",
      "Shadow Sorcerer",
      "Arcane Trickster",
      "Oath of the Ancients Paladin",
      "Circle of the Moon Druid",
      "Way of the Kensei Monk",
      "Runecarver Bladesinger"
    ],
    "origins": [
      "High Elf",
      "Dwarf Wanderer",
      "Human Outlander",
      "Tiefling Scholar",
      "Half-Elf Ranger",
      "Dragonborn Champion",
      "Gnome Artificer"
    ],
    "physicalTraits": [
      "Silver hair tied back in a leather thong, keen hazel eyes, traveling cloak lined with runic wool, wielding a notched ancestral sword.",
      "Tall with broad shoulders, dark piercing eyes, braided copper hair, wearing weathered chainmail adorned with forest motifs.",
      "Slender build, violet eyes that faintly hum with arcane luminescence, dark traveling robes with brass spell-tomes."
    ],
    "hooks": [
      {
        "hook": "The morning mist hangs low over the cobblestone crossroads of Oakhaven Village. Shoulder your traveling pack and adjust your runic sword after weeks on the road. Smoke rises from the chimney of the Prancing Griffin Tavern, where Village Elder Bram stands outside waiting for brave wanderers to answer his urgent summons.",
        "actions": [
          "Approach Elder Bram outside the tavern to learn about the urgent summons",
          "Step into the Prancing Griffin Tavern to gather local rumors and buy road supplies",
          "Inspect the ancient runic boundary stone at the village gates (Arcana Check)"
        ],
        "gear": [
          {
            "name": "Runic Longsword",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Chain Shirt & Cloak",
            "type": "armor",
            "isEquipped": true
          },
          {
            "name": "Healing Potion",
            "type": "potion"
          },
          {
            "name": "Explorer's Pack & 15 Gold",
            "type": "misc"
          }
        ],
        "spells": [
          "Shield",
          "Magic Missile",
          "Light"
        ],
        "hp": 12
      },
      {
        "hook": "Sunlight filters through the towering canopy of the Whispering Weald as you arrive at the secluded frontier shrine of Eldath. The shrine's stone basin has begun to glow with an unusual azure shimmer, and Brother Corvus kneels in prayer, looking up with relief at your arrival.",
        "actions": [
          "Greet Brother Corvus and ask what disturbance has afflicted the shrine waters",
          "Examine the glowing azure basin with an Arcana or Nature check",
          "Survey the surrounding perimeter for tracks or signs of wild beasts (Perception Check)"
        ],
        "gear": [
          {
            "name": "Carved Oak Quarterstaff",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Traveler's Robes & Herbal Pouch",
            "type": "armor",
            "isEquipped": true
          },
          {
            "name": "Vial of Sacred Spring Water",
            "type": "potion"
          },
          {
            "name": "Divination Bones & Parchment",
            "type": "misc"
          }
        ],
        "spells": [
          "Guidance",
          "Cure Wounds",
          "Entangle"
        ],
        "hp": 11
      },
      {
        "hook": "Rain patters against the mossy flagstones of the Highcrag Mountain Garrison. You present your guild credentials to the gate sentinel, who unbolts the heavy iron postern. Inside the courtyard, Captain Valerie is reviewing a regional map of recent landslide tremors.",
        "actions": [
          "Report to Captain Valerie to receive your frontier reconnaissance assignment",
          "Inspect the garrison armory supplies to equip torches and climbing pitons",
          "Speak to the mountain dwarf blacksmith tending the forge about local pass conditions"
        ],
        "gear": [
          {
            "name": "Balanced Steel Broadsword",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Reinforced Scale Armor",
            "type": "armor",
            "isEquipped": true
          },
          {
            "name": "Bandage Kit & Dwarven Stout",
            "type": "potion"
          },
          {
            "name": "Climbing Pitons & 50ft Rope",
            "type": "misc"
          }
        ],
        "spells": [
          "True Strike",
          "Heroism"
        ],
        "hp": 13
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Worn Longsword",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "A serviceable steel blade that has seen better days."
    },
    {
      "name": "Leather Armor",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true,
      "description": "A boiled-hide cuirass offering modest protection."
    },
    {
      "name": "Healing Potion",
      "type": "potion",
      "quantity": 2
    },
    {
      "name": "Pouch of 15 Gold Coins",
      "type": "misc",
      "quantity": 1
    },
    {
      "name": "Explorer's Pack & Rations",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "A cold breeze rustles through the high grass. Somewhere, a crow calls twice.",
    "The torch at your belt gutters in a sudden draft, then steadies.",
    "Footsteps echo briefly in the distance, then fade.",
    "Distant bells chime the quarter-hour from a town you cannot yet see."
  ]
} satisfies CategoryContent;
