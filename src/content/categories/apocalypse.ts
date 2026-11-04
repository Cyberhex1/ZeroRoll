import type { CategoryContent } from '../types';

// Apocalypse. Openers, tropes and media are checked by scripts/validate-content.ts.
export const apocalypse = {
  "card": {
    "name": "Apocalypse",
    "tagline": "Fallout 76 Wasteland Survival, C.A.M.P. & Rad-Cryptids",
    "description": "Loosely inspired by Fallout 76 wasteland survival: scorched ash storms, Geiger counter clicks, C.A.M.P. scrap fortifications, bottlecap trading, quirky protectron vendors, and glowing cryptids.",
    "iconName": "Radio",
    "gradient": "from-yellow-800/30 via-stone-900 to-slate-950",
    "accentColor": "#eab308",
    "bgTheme": "desert",
    "defaultCharacter": {
      "name": "Maya Steel",
      "roleClass": "Wasteland Scavenger",
      "raceOrigin": "Human Scavenger",
      "level": 1,
      "hp": 12,
      "maxHp": 12,
      "armorClass": 14,
      "initiativeBonus": 2,
      "stats": {
        "str": 13,
        "dex": 15,
        "con": 14,
        "int": 13,
        "wis": 14,
        "cha": 10
      },
      "inventory": [
        {
          "id": "ap1",
          "name": "Scavenged Lever-Action Rifle",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "ap2",
          "name": "Patchwork Wasteland Duster",
          "type": "armor",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "ap3",
          "name": "Purified Water Canteen & 3 Rations",
          "type": "potion",
          "quantity": 3
        },
        {
          "id": "ap4",
          "name": "Handheld Geiger Counter",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A resourceful survivor stepping out into the wasteland to establish trade routes."
    },
    "samplePrompts": [
      "I check the Geiger counter readings and calibrate my moisture recycler.",
      "I use my brass binoculars to scout the path down toward the New Horizon Trading Outpost.",
      "I inspect the abandoned roadside checkpoint at the base of the ridge with an Investigation check."
    ]
  },
  "profile": {
    "seedSource": "Fallout Sagas & Nuclear Wasteland Survival Lore",
    "voice": "Gritty, resourceful, observant, pragmatic. Highlights the harsh beauty of reclaimed nature, scavenged engineering, and the resilience of wanderers.",
    "atmosphere": "Hissing shelter blast doors, calibrated Geiger counters, sunlit rust valleys, distant wind turbines, scavenged dusters, canteen moisture recyclers, abandoned pre-war checkpoints.",
    "sceneStructure": "1. Emerging from underground vault/shelter into sunlight -> 2. Environmental readings & checking gear -> 3. Spotting distant trading settlement or ruin -> 4. Scavenging route choice.",
    "storyBeats": "Survival and exploration: testing water purity, salvaging scrap parts, trading at frontier outposts, repairing pre-war technology, navigating irradiated ruins.",
    "characterDynamics": "Vault survivors, wasteland scavengers, caravan guards, repair tinkers, frontier settlement traders.",
    "encounterPatterns": "Tapping Geiger counters for safe rad levels, scouting with brass binoculars, prying open pre-war lockers, bargaining at solar water pumps.",
    "sensoryMotifs": [
      "The deep hydraulic groan and hiss of a massive vault blast door opening after years",
      "The rhythmic, reassuring tick of a handheld Geiger counter measuring clean desert air",
      "The taste of metallic canteen water filtered through a scavenged charcoal recycler",
      "Vast blue skies stretching over sun-bleached highway overpasses and rusty windmills"
    ],
    "avoid": "Pristine modern luxury, effortless endless ammo, magic spells without wasteland explanation, loss of resource stakes.",
    "avoidKeywords": [
      "fireball",
      "spell"
    ]
  },
  "media": [
    {
      "title": "Fallout",
      "medium": "Game Series & TV Show"
    },
    {
      "title": "Mad Max: Fury Road",
      "medium": "Film"
    },
    {
      "title": "The Road",
      "medium": "Book/Film"
    },
    {
      "title": "The Book of Eli",
      "medium": "Film"
    },
    {
      "title": "Snowpiercer",
      "medium": "Film/TV"
    },
    {
      "title": "Waterworld",
      "medium": "Film"
    },
    {
      "title": "Horizon Zero Dawn",
      "medium": "Game"
    },
    {
      "title": "Metro 2033",
      "medium": "Games/Books"
    },
    {
      "title": "Wasteland 3",
      "medium": "Game"
    },
    {
      "title": "I Am Legend",
      "medium": "Book/Film"
    },
    {
      "title": "S.T.A.L.K.E.R.: Shadow of Chernobyl",
      "medium": "Game"
    },
    {
      "title": "DayZ",
      "medium": "Game"
    },
    {
      "title": "Children of Men",
      "medium": "Film"
    },
    {
      "title": "Escape from New York",
      "medium": "Film"
    },
    {
      "title": "The Postman",
      "medium": "Film/Book"
    },
    {
      "title": "A Boy and His Dog",
      "medium": "Film"
    },
    {
      "title": "Kenshi",
      "medium": "Game"
    },
    {
      "title": "Rust",
      "medium": "Game"
    },
    {
      "title": "Turbo Kid",
      "medium": "Film"
    },
    {
      "title": "The Last Man on Earth",
      "medium": "TV Show"
    }
  ],
  "openers": [
    {
      "id": "seed_apo_01",
      "title": "The Vault Blast Door Opens",
      "tagline": "Emerging after 50 years into the sun-bleached highway wasteland.",
      "premise": "The heavy hydraulic blast door of Shelter 14 groans open for the first time in fifty years. Armed with a calibrated Geiger counter and a scavenged hunting rifle, you step out onto the sun-scorched interstate to find the settlement water pump that stopped broadcasting two days ago.",
      "hero": {
        "name": "Vance Walker",
        "role": "Vault Scout",
        "origin": "Shelter Born"
      },
      "actions": [
        "Test the ambient desert air with your handheld Geiger counter.",
        "Scout the distant highway overpass with your brass binoculars.",
        "Check the battery charge on your wrist-mounted environmental monitor."
      ],
      "gear": [
        {
          "name": "Rifle",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Counter",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 12
    },
    {
      "id": "seed_apo_02",
      "title": "The Geothermal Water Well",
      "tagline": "The only clean water well within 50 miles has been seized by rust raiders.",
      "premise": "You arrive at the Oasis 4 water pump with three empty canteens and a dying moisture recycler. A gang of motorized scavengers has welded iron plating over the wellhead and is demanding 100 copper rounds for a single liter.",
      "hero": {
        "name": "Mara Rust",
        "role": "Wasteland Tinker",
        "origin": "Scavenger"
      },
      "actions": [
        "Bypass the external pressure bypass valve to tap clean water from the overflow line.",
        "Negotiate with the gang leader using a rare pre-war solar capacitor as trade collateral.",
        "Take cover behind the rusted tanker truck and prepare your hunting rifle."
      ],
      "gear": [
        {
          "name": "Pistol",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Wrench",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_apo_03",
      "title": "The Pre-War Radio Beacon",
      "tagline": "An automated broadcast from the lost military bunker in the crater.",
      "premise": "Your scavenged ham radio suddenly crackles with an automated pre-war broadcast: \"Bunker Echo-7 operational. Automated medical synthesizers online. Keycode required.\" The crater is surrounded by magnetic radiation dust.",
      "hero": {
        "name": "Eliot Vance",
        "role": "Signals Scavenger",
        "origin": "Wastelander"
      },
      "actions": [
        "Calibrate your lead-lined hazmat poncho before descending the crater rim.",
        "Hack the radio broadcast with your terminal deck to extract the numeric keycode.",
        "Scout the crater floor for subterranean tunnel ventilation shafts."
      ],
      "gear": [
        {
          "name": "Radio",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Machete",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_apo_04",
      "title": "The Solar Train of the Dust Sea",
      "tagline": "A perpetual armored locomotive crossing the salt flats.",
      "premise": "The Iron Nomad, a massive solar-powered locomotive that has run nonstop since the collapse, is scheduled to pass through the Canyon Pass in twenty minutes. You need to board it to deliver a clean seed-vault container to the northern survivors.",
      "hero": {
        "name": "Cole Jackson",
        "role": "Nomad Courier",
        "origin": "Dustborn"
      },
      "actions": [
        "Position your dune buggy on the canyon bluff to time your leap onto the train roof.",
        "Fire your grappling hook line at the armored caboose railing.",
        "Check the climate seal on the precious seed-vault container strapped to your chest."
      ],
      "gear": [
        {
          "name": "Rifle",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Counter",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 12
    },
    {
      "id": "seed_apo_05",
      "title": "The Hydroponic Dome Ruin",
      "tagline": "A sealed glass greenhouse with clean apples in the middle of the ash desert.",
      "premise": "Beneath the shattered skyline of New Denver, you discover a sealed reinforced geodesic dome where pre-war apple trees are still blooming under solar UV lamps. The automated sentry turrets are active and scanning for intruders.",
      "hero": {
        "name": "Rhea Stone",
        "role": "Botanical Scavenger",
        "origin": "Settler"
      },
      "actions": [
        "Use an EMP pulse grenade to temporarily disable the sentry turret scanning arc.",
        "Crawl through the drainage conduit to access the greenhouse interior.",
        "Harvest fresh fruit and seeds while monitoring the security terminal countdown."
      ],
      "gear": [
        {
          "name": "Pistol",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Wrench",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "The Geiger counter crackles violently as a massive, irradiated monstrosity bursts through the rusted shell of a pre-war bus."
    },
    {
      "premise": "A dust storm rolls in across the wasteland, forcing you to seek shelter in an abandoned, half-buried convenience store."
    },
    {
      "premise": "You scavenge a pristine can of dog food from a collapsed diner, only to hear the roar of a raider convoy approaching outside."
    },
    {
      "premise": "The robotic vendor at the trading outpost glitches, offering to sell you a highly classified military weapon for a handful of bottlecaps."
    },
    {
      "premise": "A mutated cryptid stalks you through the glowing, irradiated forest, its eyes reflecting the eerie green light of the toxic sludge."
    },
    {
      "premise": "You patch the leaks in your hazmat suit with duct tape just as the toxic acid rain begins to fall on the ruined cityscape."
    },
    {
      "premise": "The caravan guard demands an exorbitant toll of purified water to cross the makeshift bridge over the dried riverbed."
    },
    {
      "premise": "You discover a sealed underground bunker, the blast doors humming with power and a biometric scanner waiting for a handprint."
    },
    {
      "premise": "A group of heavily armed zealots who worship an unexploded nuclear bomb corner you in the ruins of a cathedral."
    },
    {
      "premise": "You cannibalize parts from a broken-down vehicle to repair your water purifier, a vital necessity for surviving the week."
    },
    {
      "premise": "The faint signal of a radio broadcast cuts through the static, promising a safe haven free of radiation and raiders."
    },
    {
      "premise": "A rival scavenger pulls a rusted shotgun on you as you reach for the same box of intact medical supplies in the ruined pharmacy."
    },
    {
      "premise": "You navigate the treacherous subway tunnels, relying on a flickering flashlight to spot the mutated creatures lurking in the dark."
    },
    {
      "premise": "The nomadic tribe offers you a seat at their fire, serving a stew of questionable origin and asking for news of the outside world."
    },
    {
      "premise": "You defend your makeshift scrap fortress from a nighttime raid by feral ghouls, using jury-rigged traps and limited ammo."
    },
    {
      "premise": "A mysterious stranger in a pristine, pre-war suit approaches you in the wasteland, offering a job that sounds far too good to be true."
    },
    {
      "premise": "You stumble upon a massive, crashed satellite, its databanks still intact and holding the coordinates to a pristine military cache."
    },
    {
      "premise": "The oppressive heat of the scorched desert drains your stamina, and your canteen is completely empty with miles left to walk."
    },
    {
      "premise": "You negotiate a tense trade with a heavily armored warlord, offering your mechanical expertise in exchange for safe passage."
    },
    {
      "premise": "The automated defense turrets of the ruined facility lock onto you, forcing you to sprint for cover behind a concrete barrier."
    }
  ],
  "procedural": {
    "titles": [
      "The Wasteland Horizon: Chapter I",
      "Shelter 44: First Dawn: Chapter I",
      "Echoes of the Rust Valley: Chapter I",
      "The Cobalt Caravan Route: Chapter I",
      "Scavenger's Vow: Chapter I"
    ],
    "firstNames": [
      "Maya",
      "Caleb",
      "Rust",
      "Jax",
      "Tara",
      "Dax",
      "Nova",
      "Boone"
    ],
    "lastNames": [
      "Steel",
      "Vance",
      "Miller",
      "Cross",
      "Stone",
      "Walker",
      "Ryder"
    ],
    "roles": [
      "Wasteland Scavenger",
      "Shelter Vault Dweller",
      "Caravan Scout",
      "Radio Engineer",
      "Gunsmith Wanderer"
    ],
    "origins": [
      "Human Scavenger",
      "Wasteland Nomad",
      "Cyber-Enhanced Survivor"
    ],
    "physicalTraits": [
      "Resilient build, dust-streaked face, amber goggles resting on the forehead, patchwork leather duster."
    ],
    "hooks": [
      {
        "hook": "Shelter 44 doors hiss open. Fresh desert air rushes in.",
        "actions": [
          "Calibrate counter",
          "Scout ridge",
          "Inspect checkpoint"
        ],
        "gear": [
          {
            "name": "Rifle",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Counter",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 12
      },
      {
        "hook": "The caravan engine stalls. Raiders are visible on the horizon, kicking up red dust.",
        "actions": [
          "Fix engine",
          "Prepare defense",
          "Scan threats"
        ],
        "gear": [
          {
            "name": "Pistol",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Wrench",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "A radio signal breaks the silence. A settlement is calling for help 50 miles away.",
        "actions": [
          "Triangulate signal",
          "Pack gear",
          "Check bike"
        ],
        "gear": [
          {
            "name": "Radio",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Machete",
            "type": "weapon"
          }
        ],
        "spells": [],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Improvised Pipe Rifle",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "Scavenged. Loud. Reliable enough."
    },
    {
      "name": "Patchwork Leather Duster",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Geiger Counter",
      "type": "misc",
      "quantity": 1,
      "isEquipped": false
    },
    {
      "name": "Stimpak (Field Medic)",
      "type": "potion",
      "quantity": 2
    }
  ],
  "ambient": [
    "A dry wind kicks a scrap of old newspaper against your boot.",
    "Your Geiger counter clicks twice, then settles.",
    "Somewhere far off, a metal sign bangs in a hot gust.",
    "The low hum of a dormant protectron drifts from the rubble."
  ]
} satisfies CategoryContent;
