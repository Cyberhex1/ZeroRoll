import type { CategoryContent } from '../types';

// Adventure. Openers, tropes and media are checked by scripts/validate-content.ts.
export const adventure = {
  "card": {
    "name": "Adventure",
    "tagline": "Swashbuckling Expeditions & Lost Pirate Armadas",
    "description": "Inspired by classic high-seas epics and treasure expeditions: obsidian compass fragments, uncharted coral atolls, swinging rigging duels, and forgotten jungle ruins.",
    "iconName": "Compass",
    "gradient": "from-emerald-600/30 via-teal-900/40 to-slate-950",
    "accentColor": "#10b981",
    "bgTheme": "forest",
    "defaultCharacter": {
      "name": "Captain Cora Vane",
      "roleClass": "Swashbuckler Explorer",
      "raceOrigin": "Human",
      "level": 1,
      "hp": 11,
      "maxHp": 11,
      "armorClass": 14,
      "initiativeBonus": 3,
      "stats": {
        "str": 12,
        "dex": 16,
        "con": 12,
        "int": 13,
        "wis": 13,
        "cha": 15
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Polished Brass Cutlass",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Flintlock Pistol & Powder Horn",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i3",
          "name": "Obsidian Compass Needle & Sea Chart",
          "type": "relic",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A daring navigator seeking the legendary sunken fleet of the Obsidian Atolls."
    },
    "samplePrompts": [
      "I visit the Salty Kraken Tavern to recruit a trustworthy navigator and deckhands.",
      "I examine the obsidian compass needle against the harbor landmarks with an Investigation check.",
      "I inspect the supply crates at the quartermaster dock before boarding our sloop."
    ]
  },
  "profile": {
    "seedSource": "Classic High-Seas Epics & Treasure Expeditions",
    "voice": "Brisk, daring, spirited, full of nautical flavor and the pulse of discovery. Emphasizes momentum, physical agility, and clever problem-solving.",
    "atmosphere": "Sunlit wooden docks, crashing surf, unrolled sea charts weighted by brass coins, creaking ship rigging, squawking gulls, tropical trade winds, obsidian compasses.",
    "sceneStructure": "1. Stepping onto bustling harbor or island docks -> 2. Inspecting a mysterious navigational artifact or map -> 3. Recruiting allies or bargaining for supplies -> 4. Outbound expedition choice.",
    "storyBeats": "High-momentum exploration: securing sea charts, outfitting vessels, navigating treacherous reefs, unearthing ancient pirate relics, daring escapes.",
    "characterDynamics": "Swashbuckler explorers, grizzled quartermasters, island navigators, daring privateers, eccentric harbor cartographers.",
    "encounterPatterns": "Harbor supply negotiations, recruiting deckhands at tavern, inspecting sea chart compass bearings, navigating coral shallows, cliffside climbing.",
    "sensoryMotifs": [
      "Salt spray misting over sun-bleached wooden piers and hemp mooring ropes",
      "The crisp unrolling of parchment charts marked with compass roses and soundings",
      "The metallic click and balance of a polished brass cutlass in the morning light",
      "Shouting dockworkers and the creak of timber hulls rocking against the pier"
    ],
    "avoid": "Gloomy stagnant inaction, overly dry bureaucratic dialogue, endless waiting without initiative.",
    "avoidKeywords": [
      "bureaucra*",
      "paperwork"
    ]
  },
  "media": [
    {
      "title": "Pirates of the Caribbean: Curse of the Black Pearl",
      "medium": "Film"
    },
    {
      "title": "Treasure Island",
      "medium": "Book"
    },
    {
      "title": "Uncharted 4: A Thief's End",
      "medium": "Game"
    },
    {
      "title": "Master and Commander",
      "medium": "Film"
    },
    {
      "title": "Black Sails",
      "medium": "TV Show"
    },
    {
      "title": "Indiana Jones: Raiders of the Lost Ark",
      "medium": "Film"
    },
    {
      "title": "The Mummy (1999)",
      "medium": "Film"
    },
    {
      "title": "Assassin's Creed IV: Black Flag",
      "medium": "Game"
    },
    {
      "title": "The Goonies",
      "medium": "Film"
    },
    {
      "title": "Journey to the Center of the Earth",
      "medium": "Book/Film"
    },
    {
      "title": "Sea of Thieves",
      "medium": "Game"
    },
    {
      "title": "Tomb Raider",
      "medium": "Games"
    },
    {
      "title": "Romancing the Stone",
      "medium": "Film"
    },
    {
      "title": "The Princess Bride",
      "medium": "Film/Book"
    },
    {
      "title": "Around the World in 80 Days",
      "medium": "Book"
    },
    {
      "title": "One Piece",
      "medium": "Manga/Anime"
    },
    {
      "title": "Monkey Island",
      "medium": "Games"
    },
    {
      "title": "Atlantis: The Lost Empire",
      "medium": "Film"
    },
    {
      "title": "King Kong (2005)",
      "medium": "Film"
    },
    {
      "title": "Sid Meier's Pirates!",
      "medium": "Game"
    }
  ],
  "openers": [],
  "tropes": [
    {
      "premise": "A cannonball shreds the mainsail above you as the ghost ship rams your starboard side, splintering the deck."
    },
    {
      "premise": "The obsidian compass you found in the smuggler's den points not north, but straight down into the abyssal ocean trench."
    },
    {
      "premise": "You swing on a frayed rope across a collapsing jungle temple, clutching a golden idol as the floor falls away to lava."
    },
    {
      "premise": "The mutinous crew corners you on the quarterdeck, demanding you hand over the map to the Sunken City of Gold."
    },
    {
      "premise": "In the crowded bazaar, a monkey steals your coin purse, leading you on a chase into a hidden thieves' guild beneath the city."
    },
    {
      "premise": "The ancient mechanism grinds to a halt, trapping you in a room slowly filling with sand as a riddle echoes from the walls."
    },
    {
      "premise": "A kraken tentacle the size of a galleon wraps around your ship's hull, dragging the vessel toward the maelstrom."
    },
    {
      "premise": "You decode the pirate king's final riddle, realizing the treasure is buried directly beneath the governor's heavily guarded mansion."
    },
    {
      "premise": "A rival explorer beats you to the artifact, holding you at gunpoint on a precarious rope bridge suspended over a gorge."
    },
    {
      "premise": "The cursed gold piece in your pocket begins to burn hot as the skeletal crew of the Black Galleon emerges from the fog."
    },
    {
      "premise": "You discover a subterranean river deep within the cavern, illuminated by bioluminescent flora and a docked, ancient submarine."
    },
    {
      "premise": "The jungle vines part to reveal a massive, forgotten ziggurat, its golden peak glinting under the harsh midday sun."
    },
    {
      "premise": "Your ship is caught in the doldrums for weeks until a strange, glowing fog rolls in, carrying the sound of ghostly singing."
    },
    {
      "premise": "You win a battered treasure map in a high-stakes tavern card game, but the man you beat turns out to be the Royal Navy admiral."
    },
    {
      "premise": "A massive tidal wave threatens to capsize your sloop just as you spot the rocky entrance to the hidden pirate cove."
    },
    {
      "premise": "The booby-trapped tomb seals shut behind you, and the only light comes from the glowing eyes of the stone jaguar statues."
    },
    {
      "premise": "You are marooned on a desert island, but soon discover a set of massive, unhuman footprints leading into the jungle."
    },
    {
      "premise": "A treacherous whirlpool sucks your crew toward the ocean floor, where a domed, underwater city waits intact."
    },
    {
      "premise": "The pirate queen offers you a choice: join her armada against the empire, or walk the plank into shark-infested waters."
    },
    {
      "premise": "You trigger a pressure plate in the ruins, releasing a massive rolling boulder that forces you to sprint blindly into the dark."
    }
  ],
  "procedural": {
    "titles": [
      "The Obsidian Compass Expedition: Chapter I",
      "Voyage of the Emerald Galleon: Chapter I",
      "The Lost Atoll of Isla Nublar: Chapter I",
      "The Tide-Cave of Marauder's Reach: Chapter I",
      "Sovereigns of the Coral Sea: Chapter I"
    ],
    "firstNames": [
      "Cora",
      "Edward",
      "Marlowe",
      "Cassian",
      "Talia",
      "Gideon",
      "Beatrix",
      "Silas"
    ],
    "lastNames": [
      "Vane",
      "Drake",
      "Hawthorne",
      "Blackwood",
      "Sterling",
      "O'Malley",
      "Fairchild"
    ],
    "roles": [
      "Swashbuckler Explorer",
      "Harbor Navigator",
      "Privateer Duelist",
      "Cartographer Archaeologist",
      "Corsair Scout"
    ],
    "origins": [
      "Human",
      "Half-Elf Seafarer",
      "Triton Outlander",
      "Tiefling Privateer"
    ],
    "physicalTraits": [
      "Sun-bronzed skin, sea-green eyes, dark curls held by a crimson bandana, equipped with a polished brass spyglass and cutlass.",
      "Weathered leather trench coat, confident grin, observant gray eyes, carrying a notched flintlock and rolled nautical chart."
    ],
    "hooks": [
      {
        "hook": "Salt spray fills the morning air as you step off the gangplank onto the bustling wooden docks of Port Tempest. In your coat pocket rests a weathered sea chart and an obsidian compass needle you recently acquired.",
        "actions": [
          "Visit the Salty Kraken Tavern to recruit a trustworthy navigator",
          "Examine the obsidian compass needle against the harbor landmarks",
          "Inspect the supply crates at the quartermaster dock before boarding your sloop"
        ],
        "gear": [
          {
            "name": "Polished Brass Cutlass",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Obsidian Compass",
            "type": "relic",
            "isEquipped": true
          }
        ],
        "spells": [],
        "hp": 11
      },
      {
        "hook": "Golden morning light glints off the turquoise surf of Siren's Cove. Before you rises the jungle-cloaked bluff holding the stone ruins of an ancient temple observatory, untouched for centuries.",
        "actions": [
          "Unfurl your parchment expedition notes",
          "Scout the jungle tree line for booby traps",
          "Check water rations before ascending the ridge"
        ],
        "gear": [
          {
            "name": "Machete",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Water Canteen",
            "type": "potion"
          }
        ],
        "spells": [],
        "hp": 12
      },
      {
        "hook": "Thick fog rolls over the deck of your skiff as you approach the jagged teeth of the Dead Man's Reef. A flickering beacon glows from the top of the central sea stack.",
        "actions": [
          "Check your navigation lantern",
          "Consult the star charts to avoid hidden reefs",
          "Signal the beacon with your mirror"
        ],
        "gear": [
          {
            "name": "Hand-axe",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Signal Mirror",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 10
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Polished Brass Cutlass",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "A well-balanced naval blade."
    },
    {
      "name": "Salt-stained Leather Coat",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Obsidian Compass",
      "type": "relic",
      "quantity": 1,
      "isEquipped": false,
      "description": "A needle that points to something other than magnetic north."
    },
    {
      "name": "Rolled Nautical Chart",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "A gull cries overhead and wheels back toward the harbor.",
    "The rope at your belt creaks gently as the ship lists to starboard.",
    "A warm salt wind presses against the canvas of your coat.",
    "Planks beneath your feet groan with the slow rhythm of the sea."
  ]
} satisfies CategoryContent;
