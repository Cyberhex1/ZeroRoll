import type { CategoryContent } from '../types';

// Historical Adventure. Openers, tropes and media are checked by scripts/validate-content.ts.
export const historicalAdventure = {
  "card": {
    "name": "Historical Adventure",
    "tagline": "Alexandria, Edo Ninja Sieges & Venetian Conspiracies",
    "description": "Immerse yourself in history's most thrilling turning points: evacuating the burning Library of Alexandria, stormy Edo castle ninja raids, or Venetian Carnival Doge conspiracies.",
    "iconName": "ShieldAlert",
    "gradient": "from-yellow-700/30 via-stone-900/40 to-slate-950",
    "accentColor": "#d97706",
    "bgTheme": "desert",
    "defaultCharacter": {
      "name": "Kenjiro Sato",
      "roleClass": "Master Ronin",
      "raceOrigin": "Human (Edo Era)",
      "level": 1,
      "hp": 12,
      "maxHp": 12,
      "armorClass": 15,
      "initiativeBonus": 2,
      "stats": {
        "str": 14,
        "dex": 15,
        "con": 14,
        "int": 12,
        "wis": 14,
        "cha": 10
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Folded-Steel Katana",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Wakizashi Short Sword",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i3",
          "name": "Sealed Bamboo Dispatch Tube",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A disciplined wanderer entrusted with delivering a critical dispatch across contested territory."
    },
    "samplePrompts": [
      "I stop at the mountain tea house to ask the proprietor about road conditions ahead.",
      "I observe the imperial guard patrol stationed at the barrier gate with a Perception check.",
      "I check the wax seal on my bamboo dispatch tube to ensure it remains untouched."
    ]
  },
  "profile": {
    "seedSource": "High-Stakes Points in Authentic & Fictionalized World History",
    "voice": "Disciplined, authentic, culturally grounded, cinematic. Rich in historical terminology, respectful period etiquette, and realistic martial stakes.",
    "atmosphere": "Morning dew glistening on bamboo mountain passes, sealed imperial bamboo cylinders, woven straw sandals, quiet roadside tea houses, fortified provincial checkpoints.",
    "sceneStructure": "1. Arrival at mountain checkpoint or historical landmark -> 2. Cultural grounding & verifying permits/dispatches -> 3. Encounter with provincial guards or scholars -> 4. Tactical route decision.",
    "storyBeats": "Historical tension and honor: delivering imperial decrees, navigating political border friction, surviving historical sieges or conspiracies, tactical martial duels.",
    "characterDynamics": "Masterless wanderers, imperial scribes, tea house proprietors, provincial barrier guards, historical emissaries.",
    "encounterPatterns": "Identity verification at barrier gates, assessing landslide road hazards, diplomatic bows and courtesies, deciphering historical scrolls.",
    "sensoryMotifs": [
      "Morning dew dripping from bamboo stalks onto a wide straw travel hat",
      "The unbroken red wax seal on a polished bamboo imperial dispatch cylinder",
      "The fragrant steam rising from a bowl of hot roasted green tea at a roadside stall",
      "The rhythmic crunch of straw sandals on gravel mountain switchbacks"
    ],
    "avoid": "High-fantasy magic monsters (unless explicitly requested), modern gadgets, disrespectful historical caricatures, anachronistic slang.",
    "avoidKeywords": [
      "dragon",
      "smartphone",
      "laptop",
      "internet",
      "wizard",
      "sorcer*",
      "elf"
    ]
  },
  "media": [
    {
      "title": "Ghost of Tsushima",
      "medium": "Game"
    },
    {
      "title": "Assassin's Creed (Ezio Trilogy)",
      "medium": "Games"
    },
    {
      "title": "Shōgun",
      "medium": "Book/FX Show"
    },
    {
      "title": "Gladiator",
      "medium": "Film"
    },
    {
      "title": "Kingdom of Heaven",
      "medium": "Film"
    },
    {
      "title": "The Last Samurai",
      "medium": "Film"
    },
    {
      "title": "Sekiro: Shadows Die Twice",
      "medium": "Game"
    },
    {
      "title": "Rome",
      "medium": "HBO Series"
    },
    {
      "title": "The Three Musketeers",
      "medium": "Book"
    },
    {
      "title": "Ninja Scroll",
      "medium": "Anime"
    },
    {
      "title": "The Borgias",
      "medium": "TV Show"
    },
    {
      "title": "Assassin's Creed Origins",
      "medium": "Game"
    },
    {
      "title": "Crouching Tiger, Hidden Dragon",
      "medium": "Film"
    },
    {
      "title": "Seven Samurai",
      "medium": "Film"
    },
    {
      "title": "Yojimbo",
      "medium": "Film"
    },
    {
      "title": "A Tale of Two Cities",
      "medium": "Book"
    },
    {
      "title": "The Pillars of the Earth",
      "medium": "Book/TV"
    },
    {
      "title": "Marco Polo",
      "medium": "Netflix Series"
    },
    {
      "title": "Master of the Flying Guillotine",
      "medium": "Film"
    }
  ],
  "openers": [
    {
      "id": "seed_his_01",
      "title": "The Seal at the Mountain Barrier",
      "tagline": "The seal is sound; the description beside the gate is not.",
      "premise": "You reach an Edo-period mountain barrier with an intact dispatch seal and discover that the posted travel description names the companion beside you as a fugitive.",
      "hero": {
        "name": "Akiyama Sayo",
        "role": "Dispatch Courier",
        "origin": "Mountain-village Japanese"
      },
      "actions": [
        "Present the sealed dispatch without surrendering your companion.",
        "Ask the barrier guard which household issued the description.",
        "Study the wooded detour before the gate closes."
      ],
      "gear": [
        {
          "name": "Travel Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Sealed Dispatch",
          "type": "misc"
        },
        {
          "name": "Straw Rain Cape",
          "type": "armor"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_his_02",
      "title": "The Waterlogged Folio",
      "tagline": "Water is rising around the folio and the person who saved it.",
      "premise": "You arrive at a Hellenistic harbor workshop to collect a damaged manuscript as rising water traps its owner behind a jammed storeroom door.",
      "hero": {
        "name": "Leontia of Canopus",
        "role": "Manuscript Binder",
        "origin": "Alexandrian Greek"
      },
      "actions": [
        "Lever the storeroom door with a binding press bar.",
        "Pass dry boards through the window to raise the manuscript.",
        "Call the neighboring boat crews to help lift the jammed frame."
      ],
      "gear": [
        {
          "name": "Binding Knife",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Linen Wrapping",
          "type": "misc"
        },
        {
          "name": "Press Bar",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_his_03",
      "title": "The Glassmaker's Cipher",
      "tagline": "A warning has cooled inside the patron's glass.",
      "premise": "You open a Renaissance furnace workshop and find a warning formed inside cooling glass while a patron's servants wait outside to seize the batch.",
      "hero": {
        "name": "Lucia Bellori",
        "role": "Glassworker",
        "origin": "Venetian"
      },
      "actions": [
        "Turn the cooling glass to read the concealed pattern.",
        "Ask the waiting servants for the patron's receipt.",
        "Send a workshop apprentice to warn the intended recipient."
      ],
      "gear": [
        {
          "name": "Glassworker's Shears",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Leather Gloves",
          "type": "armor"
        },
        {
          "name": "Cooling Tongs",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_his_04",
      "title": "The Broken Relay Saddle",
      "tagline": "The warning must travel farther than the relay horses will.",
      "premise": "You reach a Ming relay station with a sealed flood warning and find the fresh horses taken and the downstream ferry already preparing its final crossing.",
      "hero": {
        "name": "Qiao Wen",
        "role": "Relay Rider",
        "origin": "North China village-born"
      },
      "actions": [
        "Show the ferry keeper the dispatch's unbroken seal.",
        "Ask the station workers who requisitioned the fresh horses.",
        "Lead your tired mount toward the shorter riverbank track."
      ],
      "gear": [
        {
          "name": "Riding Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Dispatch Case",
          "type": "misc"
        },
        {
          "name": "Water Flask",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 12
    },
    {
      "id": "seed_his_05",
      "title": "The Measure of the Aqueduct",
      "tagline": "The first water is coming toward a deliberately weakened support.",
      "premise": "You inspect a provincial Roman aqueduct before a public opening and find tool marks beneath a new support as the first water surges toward it.",
      "hero": {
        "name": "Decima Vibia",
        "role": "Water Surveyor",
        "origin": "Roman provincial"
      },
      "actions": [
        "Signal the upstream crew to hold the sluice.",
        "Measure the fresh cuts beneath the new support.",
        "Clear the workers from the downstream inspection passage."
      ],
      "gear": [
        {
          "name": "Survey Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Measuring Cord",
          "type": "misc"
        },
        {
          "name": "Wax Tablet",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_his_06",
      "title": "The Loom Behind the Gate",
      "tagline": "A family's passage is hidden in the cloth being seized.",
      "premise": "You bring cloth to a medieval city gate and discover a displaced family's travel token sewn into the bolt that a guard has ordered confiscated.",
      "hero": {
        "name": "Yusuf al-Saffar",
        "role": "Textile Trader",
        "origin": "Andalusi urban-born"
      },
      "actions": [
        "Unroll the bolt to keep its sewn token in view.",
        "Ask the gate guard to name the grounds for confiscation.",
        "Offer another merchant your pack space in return for an introduction."
      ],
      "gear": [
        {
          "name": "Trade Knife",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Cloth Bolt",
          "type": "misc"
        },
        {
          "name": "Travel Token",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_his_07",
      "title": "The Ink on the Tea Bowl",
      "tagline": "A bowl carries a message its recipient cannot stop to read.",
      "premise": "You deliver bowls to a Joseon roadside inn and discover a message under the glaze while the intended recipient is being escorted through the courtyard.",
      "hero": {
        "name": "Jeong Haejin",
        "role": "Kiln Painter",
        "origin": "Joseon village-born"
      },
      "actions": [
        "Rotate the bowl in the courtyard light to inspect its glaze.",
        "Offer tea service to delay the departing escort.",
        "Ask the innkeeper which road the escorted traveler will take."
      ],
      "gear": [
        {
          "name": "Kiln Trimming Knife",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Padded Bowl Basket",
          "type": "misc"
        },
        {
          "name": "Tea Cloth",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_his_08",
      "title": "The Bridge Before the Thaw",
      "tagline": "Two parties want the bridge before the river takes it.",
      "premise": "You reach a seventeenth-century river crossing to repair its mooring as a thaw sends timber downstream and two armed parties demand first passage.",
      "hero": {
        "name": "Martin Desroches",
        "role": "Pontoon Carpenter",
        "origin": "Loire valley French"
      },
      "actions": [
        "Lash a fresh mooring around the nearest sound piling.",
        "Call both parties to help clear the approaching timber.",
        "Inspect the downstream bank for a safer temporary crossing."
      ],
      "gear": [
        {
          "name": "Carpenter's Hatchet",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Rope Coil",
          "type": "misc"
        },
        {
          "name": "Mooring Wedge",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 12
    },
    {
      "id": "seed_his_09",
      "title": "The Caravan's Second Weight",
      "tagline": "The caravan is counting stones as water.",
      "premise": "You weigh supplies at a medieval desert caravan halt and discover stones replacing water jars just as the guide announces an early departure.",
      "hero": {
        "name": "Zaynab bint Rashid",
        "role": "Caravan Quartermaster",
        "origin": "Maghrebi oasis-born"
      },
      "actions": [
        "Open a suspect jar in front of the other travelers.",
        "Ask the guide to delay departure while you tally the real supply.",
        "Trace the swapped jars back through the camp's loading marks."
      ],
      "gear": [
        {
          "name": "Camp Knife",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Balance Weights",
          "type": "misc"
        },
        {
          "name": "Water Skin",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_his_10",
      "title": "The Printer's Last Forme",
      "tagline": "The press is set to make a lie official.",
      "premise": "You unlock an early-modern printshop to find a forged proclamation locked in the press while its sponsor waits for the first copies in the street.",
      "hero": {
        "name": "Tomaz Valeiro",
        "role": "Printshop Compositor",
        "origin": "Lisbon-born Portuguese"
      },
      "actions": [
        "Lift the forme to inspect the changed lines before printing.",
        "Ask the sponsor's messenger to verify the proclamation's seal.",
        "Warn the shop owner through the rear delivery door."
      ],
      "gear": [
        {
          "name": "Compositor's Bodkin",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Ink Roller",
          "type": "misc"
        },
        {
          "name": "Proof Sheet",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "The Shogun's guards pass the sliding paper doors, completely unaware that you are clinging to the rafters above the assassination target."
    },
    {
      "premise": "The Library of Alexandria is burning, and you must choose between saving a trapped scholar or the only remaining copy of a world-altering text."
    },
    {
      "premise": "During the Venetian masquerade, you notice the Doge's wine cup has been swapped with one laced with a slow-acting poison."
    },
    {
      "premise": "You draw your katana in the moonlit snow, facing down three rival ronin who have come to collect the bounty on your head."
    },
    {
      "premise": "The Roman Colosseum roars as the Emperor gives a thumbs down, leaving you to fight a trio of starved, enraged tigers."
    },
    {
      "premise": "A French musketeer presses a secret, sealed letter into your hand before dying in the muddy streets of 17th-century Paris."
    },
    {
      "premise": "You sneak through the Ming Dynasty imperial palace, dodging eunuch guards to steal back your family's stolen jade seal."
    },
    {
      "premise": "The crusader army breaches the city walls, and you must escort a group of refugees through the catacombs to safety."
    },
    {
      "premise": "A hidden blade slips from your sleeve just as the corrupt Borgia cardinal steps out onto the Vatican balcony."
    },
    {
      "premise": "The siege engines launch flaming pitch over the castle walls of Edo, illuminating the shinobi scaling the stone ramparts."
    },
    {
      "premise": "You decode a cipher in Leonardo da Vinci's workshop that reveals a secret Templar vault hidden beneath Florence."
    },
    {
      "premise": "The Samurai lord demands you commit seppuku for failing your mission, forcing you to choose between honor and survival."
    },
    {
      "premise": "A riot breaks out in the streets of Revolutionary France, and you are trapped in a carriage with an aristocratic target."
    },
    {
      "premise": "You duel a master swordsman atop a bamboo forest canopy, balancing on swaying stalks in a display of Wuxia martial arts."
    },
    {
      "premise": "The Roman legion forms a testudo formation to protect you from a volley of barbarian arrows as you carry vital dispatches."
    },
    {
      "premise": "You uncover a plot by the Medici family to collapse the Florentine economy using a massive, forged banking ledger."
    },
    {
      "premise": "A ninja throws a smoke bomb into the teahouse, and when the air clears, the emperor's heir has vanished."
    },
    {
      "premise": "You stand in the mud of Agincourt, bracing your longbow as the thunderous charge of French cavalry approaches."
    },
    {
      "premise": "A Venetian gondolier pulls a stiletto dagger on you in the middle of a foggy canal with no witnesses in sight."
    },
    {
      "premise": "You must hold the narrow mountain pass against a horde of advancing mercenaries to buy time for the village to evacuate."
    }
  ],
  "procedural": {
    "titles": [
      "Shadows of the Shogunate: Chapter I",
      "The Alexandria Manuscript Rescue: Chapter I",
      "Venetian Carnival Conspiracy: Chapter I",
      "Secrets of the Silk Road Envoy: Chapter I",
      "The Doge's Hidden Decree: Chapter I"
    ],
    "firstNames": [
      "Kenjiro",
      "Amara",
      "Marco",
      "Tomoe",
      "Cassius",
      "Helena",
      "Zhen",
      "Matteo"
    ],
    "lastNames": [
      "Sato",
      "Conti",
      "Al-Rashid",
      "Minamoto",
      "Barbaro",
      "Vandermeer",
      "Valois"
    ],
    "roles": [
      "Master Ronin",
      "Alexandrian Scholar Scribe",
      "Venetian Spymaster",
      "Silk Road Courier",
      "Imperial Guard"
    ],
    "origins": [
      "Human (Edo Era)",
      "Human (Hellenistic Era)",
      "Human (Renaissance)",
      "Human (Dynastic Silk Road)"
    ],
    "physicalTraits": [
      "Calm composed posture, dark hair tied in a traditional topknot, wearing a deep indigo traveler's haori with a folded steel katana.",
      "Flowing scholar's linen tunic, sharp observant gaze, carrying a brass stylus, inkwell, and wax seals."
    ],
    "hooks": [
      {
        "hook": "The first rays of sunlight pierce through the morning mist over the mountain tea house. Secured beneath your kimono is a sealed bamboo tube containing an imperial decree.",
        "actions": [
          "Consult tea house proprietor",
          "Observe patrol",
          "Check wax seal"
        ],
        "gear": [
          {
            "name": "Katana",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Dispatch Tube",
            "type": "relic"
          }
        ],
        "spells": [],
        "hp": 12
      },
      {
        "hook": "You stand in the shadows of the Great Library, holding the stolen papyrus scrolls that could change history. The guards are approaching the northern archive hall.",
        "actions": [
          "Hide in the alcove",
          "Read the scroll",
          "Prepare a distraction"
        ],
        "gear": [
          {
            "name": "Dagger",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Scroll",
            "type": "relic"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "The Venetian canal is quiet tonight, save for the rhythmic splashing of oars. You clutch a gilded invitation to the Doge’s ball, but your real prize is the cipher key hidden in your mask.",
        "actions": [
          "Secure your mask",
          "Watch the gondoliers",
          "Check your cloak"
        ],
        "gear": [
          {
            "name": "Rapier",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Mask",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Worn Saber",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "A serviceable cavalry blade."
    },
    {
      "name": "Field Coat & Bandolier",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Encrypted Dispatch",
      "type": "misc",
      "quantity": 1,
      "isEquipped": false,
      "description": "Sealed letter bearing an unfamiliar wax sigil."
    },
    {
      "name": "Field Bandage Kit",
      "type": "potion",
      "quantity": 1
    }
  ],
  "ambient": [
    "A street vendor calls out the morning price of persimmons.",
    "Distant temple bells ring, marking the quarter-hour.",
    "A clerk in a stiff indigo haori brushes past without looking up.",
    "The smell of woodsmoke and steamed rice drifts from a nearby stall."
  ]
} satisfies CategoryContent;
