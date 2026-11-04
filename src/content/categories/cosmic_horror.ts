import type { CategoryContent } from '../types';

// Cosmic Horror. Openers, tropes and media are checked by scripts/validate-content.ts.
export const cosmicHorror = {
  "card": {
    "name": "Cosmic Horror",
    "tagline": "Lovecraft, Beksiński & Non-Euclidean Sanity Mechanics",
    "description": "Inspired by H.P. Lovecraft, Wayne Barlowe, Beksiński, and Junji Ito: impossible geometric spirals, iridescent violet-black voids, star-spawn obelisks, and sanity-fraying truths.",
    "iconName": "Eye",
    "gradient": "from-violet-800/30 via-fuchsia-950 to-slate-950",
    "accentColor": "#a855f7",
    "bgTheme": "eldritch",
    "defaultCharacter": {
      "name": "Dr. Arthur Pendelton",
      "roleClass": "Occult Astronomer",
      "raceOrigin": "Human",
      "level": 1,
      "hp": 10,
      "maxHp": 10,
      "armorClass": 12,
      "initiativeBonus": 1,
      "stats": {
        "str": 10,
        "dex": 12,
        "con": 11,
        "int": 16,
        "wis": 15,
        "cha": 12
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Antique Pocket Revolver (Unloaded)",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": false
        },
        {
          "id": "i2",
          "name": "Magnifying Glass & Translation Notebook",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "i3",
          "name": "Armitage's Telegram & Wax Seal",
          "type": "relic",
          "quantity": 1
        }
      ],
      "spells": [
        "Guidance",
        "Comprehend Languages",
        "Detect Magic"
      ],
      "statusEffects": [
        "Well-Rested",
        "Sanity: 100/100"
      ],
      "backgroundNotes": "An academic scholar called to decipher an astronomical anomaly recorded in ancient texts."
    },
    "samplePrompts": [
      "I show Armitage's telegram to the head archivist to request the rare manuscript catalog.",
      "I examine the antique celestial globe in the library corner for strange star markings with an Investigation check.",
      "I sit at the reading desk to transcribe the notes sent in Armitage's letter."
    ]
  },
  "profile": {
    "seedSource": "H.P. Lovecraft, Wayne Barlowe, Beksiński & Junji Ito",
    "voice": "Scholarly, obsessive, dread-laden, philosophical. Peels back the thin veneer of human sanity to reveal incomprehensible geometries and ancient cyclopean truths.",
    "atmosphere": "Rain drumming on leaded university archive glass, smell of aged leather and dry parchment, brass astrolabes, cryptic telegrams with unfamiliar postmarks, green banker lamps.",
    "sceneStructure": "1. Late night research in university archives -> 2. Uncovering an astronomical anomaly or forbidden translation -> 3. Telegram or relic from missing colleague -> 4. Dangerous investigation choice.",
    "storyBeats": "Intellectual and cosmic dread: translating fragmented tablets, discovering non-Euclidean patterns in photographs, feeling the weight of the indifferent universe, safeguarding sanity.",
    "characterDynamics": "Miskatonic professors, antiquarians, museum curators, obsessive astronomers, doomed academic colleagues.",
    "encounterPatterns": "Examining antique celestial globes, translating Mesopotamian clay tablets, inspecting Antarctic expedition glass plates, deciphering cryptic telegrams.",
    "sensoryMotifs": [
      "Rain drumming steadily against tall leaded archive windows in a silent library",
      "The dry, papery scent of hundred-year-old manuscripts under a green glass desk lamp",
      "The heavy brass weight of an antique astrolabe engraved with unknown constellations",
      "The chilling realization that an ink drawing in a ledger matches an impossible celestial event"
    ],
    "avoid": "Treating cosmic gods as punchable raid bosses with standard HP, slapstick comedy, mundane action hero clichés.",
    "avoidKeywords": [
      "slapstick",
      "raid boss"
    ]
  },
  "media": [
    {
      "title": "Bloodborne",
      "medium": "Game"
    },
    {
      "title": "Call of Cthulhu",
      "medium": "Tabletop RPG"
    },
    {
      "title": "The Shadow Over Innsmouth",
      "medium": "Book"
    },
    {
      "title": "At the Mountains of Madness",
      "medium": "Book"
    },
    {
      "title": "Annihilation",
      "medium": "Film/Book"
    },
    {
      "title": "Color Out of Space",
      "medium": "Film"
    },
    {
      "title": "The Mist",
      "medium": "Film"
    },
    {
      "title": "Event Horizon",
      "medium": "Film"
    },
    {
      "title": "In the Mouth of Madness",
      "medium": "Film"
    },
    {
      "title": "The Void",
      "medium": "Film"
    },
    {
      "title": "Alien",
      "medium": "Film"
    },
    {
      "title": "Prometheus",
      "medium": "Film"
    },
    {
      "title": "Darkest Dungeon",
      "medium": "Game"
    },
    {
      "title": "SOMA",
      "medium": "Game"
    },
    {
      "title": "Uzumaki",
      "medium": "Manga by Junji Ito"
    },
    {
      "title": "Hellraiser",
      "medium": "Film"
    },
    {
      "title": "The Lighthouse",
      "medium": "Film"
    },
    {
      "title": "True Detective (Season 1)",
      "medium": "TV Show"
    },
    {
      "title": "Dredge",
      "medium": "Game"
    },
    {
      "title": "Control",
      "medium": "Game"
    }
  ],
  "openers": [
    {
      "id": "seed_cos_01",
      "title": "The Miskatonic Translation",
      "tagline": "The Sumerian clay tablet contains constellations that haven't happened yet.",
      "premise": "Late at night in the Miskatonic University Rare Books Archive, you complete the translation of a clay tablet brought back from the Mesopotamian desert. The star chart carved into its surface predicts an impossible alignment of stars occurring tonight above Arkham.",
      "hero": {
        "name": "Professor Arthur Vance",
        "role": "Antiquarian Scholar",
        "origin": "Academic"
      },
      "actions": [
        "Cross-reference the clay tablet's star chart with the observatory telescope readings.",
        "Lock the archive library iron doors and extinguish all gas lamps except your green desk light.",
        "Check the telegraph from your missing colleague in Cairo for translation warnings."
      ],
      "gear": [
        {
          "name": "Walking Stick",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Telegram",
          "type": "relic"
        }
      ],
      "spells": [
        "Identify"
      ],
      "hp": 10
    },
    {
      "id": "seed_cos_02",
      "title": "The Lighthouse of Non-Euclidean Light",
      "tagline": "The beam illuminates an island that isn't on any marine chart.",
      "premise": "As lighthouse keeper on Black Rock Reef, you clean the Fresnel lens during a violet sea fog. When the beam sweeps the water, it illuminates a cyclopean basalt island with towering angled monoliths that disappears the moment the beam passes.",
      "hero": {
        "name": "Captain James Howard",
        "role": "Lighthouse Keeper",
        "origin": "Mariner"
      },
      "actions": [
        "Lock the Fresnel lens in place to keep the mysterious basalt island illuminated.",
        "Record the exact compass coordinates and celestial angles in the official logbook.",
        "Load your heavy brass flare gun as strange clicking echoes rise from the surf below."
      ],
      "gear": [
        {
          "name": "Notebook",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Magnifier",
          "type": "relic"
        }
      ],
      "spells": [
        "Detect Magic"
      ],
      "hp": 9
    },
    {
      "id": "seed_cos_03",
      "title": "The Whispering Green Lantern",
      "tagline": "The glass lamp reveals words written between the printed lines.",
      "premise": "You purchase an antique green glass oil lamp from a deceased astronomer's estate. When lit with whale oil, its pale emerald glow reveals hidden microscopic writing inscribed between the lines of every printed book in your study.",
      "hero": {
        "name": "Eleanor Ward",
        "role": "Cryptographer",
        "origin": "New England native"
      },
      "actions": [
        "Read the glowing emerald text hidden inside your grandfather's diary.",
        "Sketch the geometric sigils revealed on your study walls.",
        "Examine the oil reservoir to discover what liquid powers the lamp."
      ],
      "gear": [
        {
          "name": "Camera",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Dagger",
          "type": "weapon"
        }
      ],
      "spells": [
        "Comprehend Languages"
      ],
      "hp": 11
    }
  ],
  "tropes": [
    {
      "premise": "The geometry of the hallway shifts imperceptibly. What was once a straight corridor now curves upward into an endless, spiraling abyss."
    },
    {
      "premise": "You read the translated passages of the ancient tome, and a sudden, terrifying realization shatters your understanding of human existence."
    },
    {
      "premise": "The coastal town is plagued by a strange, iridescent fog that mutates the flora and drives the locals into a violent, cult-like frenzy."
    },
    {
      "premise": "An expedition uncovers a massive, cyclopean city beneath the Antarctic ice, its architecture built for beings far larger than humanity."
    },
    {
      "premise": "You peer through the telescope and realize the stars are not burning spheres of gas, but the glowing eyes of colossal entities watching the earth."
    },
    {
      "premise": "A strange, pulsating meteorite crashes into the farm, poisoning the water supply and causing the livestock to fuse together in horrific ways."
    },
    {
      "premise": "The cultists chant in a guttural, inhuman language, attempting to tear a rift in space-time to summon an ancient, sleeping god."
    },
    {
      "premise": "You discover a hidden room in the asylum where a patient has obsessively drawn fractal patterns that physically hurt to look at."
    },
    {
      "premise": "A massive, shadowy tentacle breaches the surface of the ocean, dragging a naval dreadnought beneath the waves without a sound."
    },
    {
      "premise": "The deeper you delve into the abandoned mine, the more the rock walls resemble pulsating, fleshy tissue."
    },
    {
      "premise": "A strange artifact hums with a frequency that induces intense, waking nightmares of a dead city at the bottom of the sea."
    },
    {
      "premise": "The villagers wear peculiar gold jewelry shaped like amphibians and stare at you with unblinking, bulging eyes."
    },
    {
      "premise": "You realize the \"moon\" in the sky has opened, revealing a colossal, pupil-less eye staring down at the city."
    },
    {
      "premise": "A scientist creates a machine that allows you to see the creatures overlapping our reality, but turning it on alerts them to your presence."
    },
    {
      "premise": "The ancient obelisk in the desert is entirely smooth, yet it casts a shadow that moves independently of the sun."
    },
    {
      "premise": "You suffer a terrifying vision of a dark void filled with writhing shapes, and when you wake, a bizarre symbol is carved into your palm."
    },
    {
      "premise": "The deep-sea submersible loses contact with the surface as it descends past a massive, glowing city built into the Mariana Trench."
    },
    {
      "premise": "A mathematician solves an impossible equation, causing the walls of their study to unfold into a higher-dimensional space."
    },
    {
      "premise": "The strange, alien fungus infecting the facility begins to speak in the voices of the scientists it has consumed."
    },
    {
      "premise": "You realize the horrifying truth: the gods are not benevolent protectors, but indifferent, cosmic anomalies that view humanity as insects."
    }
  ],
  "procedural": {
    "titles": [
      "The Shadow over Miskatonic: Chapter I",
      "The Whispering Star Chart: Chapter I",
      "The Arkham Vault Manuscript: Chapter I",
      "Echoes of the Obsidian Monolith: Chapter I",
      "The Black Tide of Innsmouth: Chapter I"
    ],
    "firstNames": [
      "Professor Thomas",
      "Arthur",
      "Eleanor",
      "Vivian",
      "Julian",
      "Edmund",
      "Beatrice"
    ],
    "lastNames": [
      "Armitage",
      "Blackwood",
      "Dyer",
      "Peabody",
      "Ward",
      "Pickman",
      "Carter"
    ],
    "roles": [
      "Antiquarian Scholar",
      "Professor of Archaeology",
      "Archive Researcher",
      "Astronomy Lecturer",
      "Occult Historian"
    ],
    "origins": [
      "Human Scholar",
      "Miskatonic Faculty",
      "Esoteric Initiate"
    ],
    "physicalTraits": [
      "Tweed jacket with elbow patches, brass spectacles perched on the nose, carrying a leather notebook filled with handwritten Greek and Babylonian translations."
    ],
    "hooks": [
      {
        "hook": "Rain at Miskatonic library. A telegram from Armitage requests a vault key.",
        "actions": [
          "Request catalog",
          "Examine globe",
          "Transcribe"
        ],
        "gear": [
          {
            "name": "Walking Stick",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Telegram",
            "type": "relic"
          }
        ],
        "spells": [
          "Identify"
        ],
        "hp": 10
      },
      {
        "hook": "The telescope lens cracked tonight. You saw something in the void that defies the stars.",
        "actions": [
          "Check star chart",
          "Clean lens",
          "Hide notes"
        ],
        "gear": [
          {
            "name": "Notebook",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Magnifier",
            "type": "relic"
          }
        ],
        "spells": [
          "Detect Magic"
        ],
        "hp": 9
      },
      {
        "hook": "The tide is coming in, and the carvings on the beach are moving on their own.",
        "actions": [
          "Sketch carvings",
          "Retreat to car",
          "Check compass"
        ],
        "gear": [
          {
            "name": "Camera",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Dagger",
            "type": "weapon"
          }
        ],
        "spells": [
          "Comprehend Languages"
        ],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Hand-bound Leather Journal",
      "type": "misc",
      "quantity": 1,
      "isEquipped": false,
      "description": "Filled with cramped handwritten Greek and Babylonian."
    },
    {
      "name": "Brass-handled Walking Cane",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Tarnished Silver Compass",
      "type": "relic",
      "quantity": 1
    }
  ],
  "ambient": [
    "The angle of the corner of the room seems, briefly, to be wrong.",
    "Your notebook hums faintly when you set it down.",
    "Outside, the stars rearrange themselves in a pattern you cannot recall seeing before.",
    "A page of your translation turns of its own accord."
  ]
} satisfies CategoryContent;
