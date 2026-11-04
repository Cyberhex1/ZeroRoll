import type { CategoryContent } from '../types';

// Psychedelic Trip. Openers, tropes and media are checked by scripts/validate-content.ts.
export const psychedelicTrip = {
  "card": {
    "name": "Psychedelic Trip",
    "tagline": "Erowid Experience Vaults, Synesthesia & The Geometric Nexus",
    "description": "Inspired by Erowid experience reports and surrealist cinema: liquid stained-glass bridges, tasting indigo frequencies, neon origami entities speaking backward riddles, and time-dilation loops.",
    "iconName": "Palette",
    "gradient": "from-fuchsia-600/30 via-cyan-900/40 to-slate-950",
    "accentColor": "#ec4899",
    "bgTheme": "cyber",
    "defaultCharacter": {
      "name": "Zephyr Synapse",
      "roleClass": "Chroma Shaman",
      "raceOrigin": "Dimensional Wanderer",
      "level": 1,
      "hp": 11,
      "maxHp": 11,
      "armorClass": 13,
      "initiativeBonus": 3,
      "stats": {
        "str": 10,
        "dex": 15,
        "con": 12,
        "int": 14,
        "wis": 16,
        "cha": 15
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Crystal Chime Staff",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Vial of Luminous Aurora Water",
          "type": "potion",
          "quantity": 2
        },
        {
          "id": "i3",
          "name": "Prismatic Prism Pendant",
          "type": "relic",
          "quantity": 1
        }
      ],
      "spells": [
        "Color Spark",
        "Harmonic Whisper",
        "Gentle Levitation"
      ],
      "statusEffects": [
        "Well-Rested",
        "Expanded Awareness"
      ],
      "backgroundNotes": "A voyager exploring the tranquil realms of expanded consciousness and art."
    },
    "samplePrompts": [
      "I ring my crystal chime staff to harmonize with the meadow's ambient melody.",
      "I observe the shifting fractal patterns along the rainbow river path with a Perception check.",
      "I reach out gently to communicate with a floating origami spirit entity."
    ]
  },
  "profile": {
    "seedSource": "Surrealist Art, Psychonauts & Mind-Bending Dimension Hopping",
    "voice": "Lyrical, kaleidoscopic, mind-bending, shifting realities. Evokes rich synesthesia where colors have sound and thoughts shape physical terrain.",
    "atmosphere": "Neon fractal dunes, velvet violet skies, floating crystal obelisks, melting clockwork compasses, echoing harmonic chimes, shimmering mirror lakes.",
    "sceneStructure": "1. Crossing the threshold into the surreal dimension -> 2. Experiencing sensory shift and fluid physics -> 3. Encountering an enigmatic dream entity -> 4. Symbolic perception choice.",
    "storyBeats": "Mind-expanding odyssey: discovering shifting landscapes, unraveling metaphysical puzzles, bending personal perception, harmonizing with abstract thoughtforms.",
    "characterDynamics": "Astral wanderers, dream weavers, mirror oracles, celestial psychonauts, manifestation guardians.",
    "encounterPatterns": "Attuning to harmonic crystal frequencies, walking on liquid glass bridges, conversing in riddles with floating dream oracles, manipulating geometric light.",
    "sensoryMotifs": [
      "Violet and iridescent neon waves rolling silently across sand that hums in key of C",
      "A clockwork compass whose hands spin backward to point toward forgotten memories",
      "The sensation of gravity shifting gently sideways as crystal obelisks glow in harmony",
      "Echoing chime notes that leave trails of radiant indigo sparks in the air"
    ],
    "avoid": "Boring mundane realism, rigid linear physical constraints, flat literal descriptions, cheap drug tropes without poetic wonder.",
    "avoidKeywords": [
      "spreadsheet"
    ]
  },
  "media": [
    {
      "title": "2001: A Space Odyssey",
      "medium": "Film"
    },
    {
      "title": "Enter the Void",
      "medium": "Film"
    },
    {
      "title": "Fear and Loathing in Las Vegas",
      "medium": "Film/Book"
    },
    {
      "title": "Doctor Strange (MCU)",
      "medium": "Film"
    },
    {
      "title": "The Matrix",
      "medium": "Film"
    },
    {
      "title": "\"A Journey to the Center of the Mind\"",
      "medium": "Erowid DMT Vault"
    },
    {
      "title": "\"Meeting the Machine Elves\"",
      "medium": "Erowid DMT Vault"
    },
    {
      "title": "\"The Geometric Nexus\"",
      "medium": "Erowid Salvia Vault"
    },
    {
      "title": "\"Complete Ego Death and Rebirth\"",
      "medium": "Erowid LSD Vault"
    },
    {
      "title": "\"The Chrysanthemum Pattern\"",
      "medium": "Erowid Psilocybin Vault"
    },
    {
      "title": "\"Conversations with the Plant Teacher\"",
      "medium": "Erowid Ayahuasca Vault"
    },
    {
      "title": "\"Slipping Outside of Time\"",
      "medium": "Erowid LSD Vault"
    },
    {
      "title": "\"The Cosmic Waiting Room\"",
      "medium": "Erowid DMT Vault"
    },
    {
      "title": "\"Dissolution into the White Light\"",
      "medium": "Erowid 5-MeO-DMT Vault"
    },
    {
      "title": "\"The Zipper Unzipping Reality\"",
      "medium": "Erowid Salvia Vault"
    },
    {
      "title": "\"Synesthetic Symphony of Colors\"",
      "medium": "Erowid LSD Vault"
    },
    {
      "title": "\"The Grid and the Entities\"",
      "medium": "Erowid DMT Vault"
    },
    {
      "title": "\"A Glimpse into the Akashic Records\"",
      "medium": "Erowid Psilocybin Vault"
    },
    {
      "title": "\"The Gravity of a Thousand Suns\"",
      "medium": "Erowid Ketamine Vault"
    },
    {
      "title": "\"Fractal Landscapes of the Mind\"",
      "medium": "Erowid Mescaline Vault"
    }
  ],
  "openers": [
    {
      "id": "seed_psy_01",
      "title": "The Clockwork Compass of Backward Time",
      "tagline": "The hands spin counter-clockwise to point toward forgotten childhood memories.",
      "premise": "You step through a shimmering doorway in the sand into a desert of glowing violet fractal dunes. A brass clockwork compass in your hand spins backward, chiming in chord harmonies that shape the physical terrain into crystal bridges with every step.",
      "hero": {
        "name": "Astraea Moon",
        "role": "Dreamwalker",
        "origin": "Astral Wanderer"
      },
      "actions": [
        "Follow the harmonic chime resonance across the violet crystal dunes.",
        "Ask the floating geometric mirror entity for the true name of the threshold.",
        "Tune your mind's focus to alter the color of the liquid glass horizon."
      ],
      "gear": [
        {
          "name": "Chime Staff",
          "type": "weapon",
          "isEquipped": true
        }
      ],
      "spells": [
        "Color Shift"
      ],
      "hp": 12
    },
    {
      "id": "seed_psy_02",
      "title": "The Symphony of Liquid Light",
      "tagline": "Sound has physical weight and colors speak in philosophical riddles.",
      "premise": "Walking across a lake of liquid silver under a magenta nebula sky, every word you speak crystallizes into floating origami birds that carry your thoughts to the Mirror Oracle seated on the horizon.",
      "hero": {
        "name": "Orion Vale",
        "role": "Harmonic Psychonaut",
        "origin": "Dreamer"
      },
      "actions": [
        "Speak a word of truth to create a radiant indigo phoenix bridge.",
        "Listen to the silver lake water whispering memories you haven't lived yet.",
        "Approach the Mirror Oracle to receive the key to the waking world."
      ],
      "gear": [
        {
          "name": "Crystal Vial",
          "type": "potion",
          "isEquipped": true
        }
      ],
      "spells": [
        "Astral Float"
      ],
      "hp": 10
    },
    {
      "id": "seed_psy_03",
      "title": "The Orchard of Borrowed Echoes",
      "tagline": "Tomorrow's farewell has ripened before its speaker is ready.",
      "premise": "You step into an orchard where fruit repeats tomorrow's farewells and a transparent gardener asks which voice you will return before the roots learn it.",
      "hero": {
        "name": "Serein Lilt",
        "role": "Echo Gardener",
        "origin": "Reverie-born"
      },
      "actions": [
        "Taste the echo in the lowest silver fruit.",
        "Ask the transparent gardener whose roots are learning the voice.",
        "Hum a new greeting into the branch before it closes."
      ],
      "gear": [
        {
          "name": "Tuning Fork Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Echo Fruit",
          "type": "relic"
        },
        {
          "name": "Velvet Pouch",
          "type": "misc"
        }
      ],
      "spells": [
        "Echo Graft",
        "Color Hearing"
      ],
      "hp": 10
    },
    {
      "id": "seed_psy_04",
      "title": "The Staircase That Tastes of Rain",
      "tagline": "A folding sun is closing the landing above your tongue.",
      "premise": "You cross a doorway into stairs that taste blue beneath your feet while a paper sun folds shut around the landing you meant to reach.",
      "hero": {
        "name": "Vela Prismatic",
        "role": "Threshold Cartographer",
        "origin": "Lucid Dreamer"
      },
      "actions": [
        "Follow the taste of rain toward the next indigo step.",
        "Ask the paper sun to leave one crease unfolded.",
        "Sketch the staircase's changing rhythm in the air."
      ],
      "gear": [
        {
          "name": "Prism Rod",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Folded Raincoat",
          "type": "misc"
        },
        {
          "name": "Stair Chalk",
          "type": "relic"
        }
      ],
      "spells": [
        "Prism Step",
        "Taste Weather"
      ],
      "hp": 11
    },
    {
      "id": "seed_psy_05",
      "title": "The Museum of Almost",
      "tagline": "A possibility has stepped out to look for its missing choice.",
      "premise": "You enter a museum of choices never made and find your unfinished reflection climbing out of its frame as the corridors rearrange around its footsteps.",
      "hero": {
        "name": "Nacre Sol",
        "role": "Possibility Restorer",
        "origin": "Mirror-born"
      },
      "actions": [
        "Match your reflection's pace without entering its frame.",
        "Ask the nearest unfinished portrait which corridor remembers you.",
        "Turn the empty frame toward a choice you can still make."
      ],
      "gear": [
        {
          "name": "Frame Cane",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Blank Exhibition Ticket",
          "type": "relic"
        },
        {
          "name": "Silver Cloth",
          "type": "misc"
        }
      ],
      "spells": [
        "Frame Turn",
        "Possibility Sense"
      ],
      "hp": 10
    },
    {
      "id": "seed_psy_06",
      "title": "A Sea Sewn from Sleeves",
      "tagline": "Your coat has become a sea that needs a reason to sail.",
      "premise": "You unfold a coat into a phosphorescent sea where the buttons are islands and a needle-shaped boat demands the memory that will serve as its sail.",
      "hero": {
        "name": "Omi Afterlight",
        "role": "Memory Tailor",
        "origin": "Daydream Wanderer"
      },
      "actions": [
        "Offer the boat a remembered direction rather than a destination.",
        "Unfasten one island-button to slow the phosphorescent current.",
        "Ask the needle boat which stitch keeps the sea together."
      ],
      "gear": [
        {
          "name": "Silver Needle Pike",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Ocean Coat",
          "type": "relic"
        },
        {
          "name": "Spool of Moon Thread",
          "type": "misc"
        }
      ],
      "spells": [
        "Memory Stitch",
        "Tide Fold"
      ],
      "hp": 11
    },
    {
      "id": "seed_psy_07",
      "title": "The Choir Under Your Footprint",
      "tagline": "One footprint is singing after its walker has vanished.",
      "premise": "You arrive on a shore of humming footprints and hear one singing without its walker while a tide of silence approaches the unfinished song.",
      "hero": {
        "name": "Quillan Hush",
        "role": "Resonance Listener",
        "origin": "Thoughtform"
      },
      "actions": [
        "Answer the lonely footprint with a note of your own.",
        "Follow the fading song away from the tide of silence.",
        "Ask the surrounding footprints what shape the walker left."
      ],
      "gear": [
        {
          "name": "Resonance Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Shell of Hums",
          "type": "relic"
        },
        {
          "name": "Felt Pouch",
          "type": "misc"
        }
      ],
      "spells": [
        "Echo Trace",
        "Sound Shelter"
      ],
      "hp": 10
    },
    {
      "id": "seed_psy_08",
      "title": "The Umbrella of Sideways Seasons",
      "tagline": "Four seasons are falling; only one can find the ground.",
      "premise": "You open an umbrella under a violet sky and four seasons fall sideways from its ribs as a snowflower asks you to choose which season may touch ground.",
      "hero": {
        "name": "Luma Venn",
        "role": "Weather Interpreter",
        "origin": "Betweenworld Traveler"
      },
      "actions": [
        "Tilt the umbrella toward the season the snowflower can bear.",
        "Ask each falling season what it will leave behind.",
        "Catch one sideways raindrop to weigh its unspent spring."
      ],
      "gear": [
        {
          "name": "Season Cane",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Four-Rib Umbrella",
          "type": "relic"
        },
        {
          "name": "Clear Vial",
          "type": "misc"
        }
      ],
      "spells": [
        "Season Tilt",
        "Gravity Fold"
      ],
      "hp": 11
    },
    {
      "id": "seed_psy_09",
      "title": "The Door in the Sleeping Color",
      "tagline": "Amber has fallen asleep with every yellow door locked inside it.",
      "premise": "You enter a field where amber has fallen asleep and every yellow doorway locks while a blue silhouette offers its own outline as a temporary key.",
      "hero": {
        "name": "Eno Saffron",
        "role": "Chromatic Wayfinder",
        "origin": "Spectrum-born"
      },
      "actions": [
        "Listen for the sleeping color's slowest pulse.",
        "Ask the blue silhouette what lending its outline will cost.",
        "Trace a temporary doorway using the dawn at your feet."
      ],
      "gear": [
        {
          "name": "Spectrum Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Borrowed Outline",
          "type": "relic"
        },
        {
          "name": "Dawn Thread",
          "type": "misc"
        }
      ],
      "spells": [
        "Color Wake",
        "Outline Step"
      ],
      "hp": 10
    },
    {
      "id": "seed_psy_10",
      "title": "The Parade of Unfinished Faces",
      "tagline": "The procession is waiting for a name you have not given it.",
      "premise": "You cross a bridge of folded laughter into a procession of blank masks and find the final face forming from the name you have not yet spoken.",
      "hero": {
        "name": "Ruelle Chime",
        "role": "Dream Maskmaker",
        "origin": "Cloud-memory Being"
      },
      "actions": [
        "Turn the unfinished mask toward a sound that belongs to nobody.",
        "Ask the nearest blank face where the parade began.",
        "Fold a bridge of laughter toward the procession's open end."
      ],
      "gear": [
        {
          "name": "Maskmaker's Wand",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Unfinished Mask",
          "type": "relic"
        },
        {
          "name": "Ribbon of Laughter",
          "type": "misc"
        }
      ],
      "spells": [
        "Face Weave",
        "Name Echo"
      ],
      "hp": 11
    }
  ],
  "tropes": [
    {
      "premise": "The walls breathe in time with your heartbeat as a towering entity made entirely of folding geometric light asks you a question in a language you can taste."
    },
    {
      "premise": "A sudden rush of synesthesia overwhelms you; the sound of the wind becomes a brilliant shade of indigo that shatters into glass fractals."
    },
    {
      "premise": "You step through a doorway and reality unzips itself, revealing the underlying grid of the universe maintained by clockwork elves."
    },
    {
      "premise": "The concept of time dissolves completely. You experience your past, present, and future simultaneously in a single, crystalline moment of eternity."
    },
    {
      "premise": "A benevolent, plant-like intelligence communicates with you not through words, but by downloading intense, emotional memories directly into your mind."
    },
    {
      "premise": "You feel your sense of self shatter into a million pieces, ego death washing over you as you merge with the infinite white light of the cosmos."
    },
    {
      "premise": "The forest floor begins to flow like a river of vibrant, neon colors, and the trees twist themselves into impossible, non-Euclidean shapes."
    },
    {
      "premise": "A jester made of impossible, folding colors dances around you, mocking the arbitrary rules of physics and gravity."
    },
    {
      "premise": "You find yourself in the \"cosmic waiting room,\" a sterile, pastel-colored dimension where souls wait to be assigned a reality."
    },
    {
      "premise": "The music playing in the room physically manifests as glowing ribbons of energy that wrap around you in a warm embrace."
    },
    {
      "premise": "You look at your hands and see them aging and decaying into dust, only to bloom rapidly into a vibrant bed of lotus flowers."
    },
    {
      "premise": "A massive, kaleidoscopic chrysanthemum pattern expands across your vision, pulling you deeper into a swirling vortex of consciousness."
    },
    {
      "premise": "You realize you are not a physical being, but a localized vibration of energy in a vast, interconnected web of cosmic frequencies."
    },
    {
      "premise": "The room you are standing in begins to fold inward on itself like an origami puzzle, revealing a sprawling, alien landscape outside."
    },
    {
      "premise": "A deep, heavy gravity pulls you into the floor, separating your consciousness from your body as you float above yourself."
    },
    {
      "premise": "You communicate telepathically with a hyper-intelligent mushroom colony that reveals the interconnected mycelial network of the universe."
    },
    {
      "premise": "The everyday objects around you begin to melt and stretch, transforming into cartoonish, exaggerated versions of themselves."
    },
    {
      "premise": "You access a vast, library-like dimension where every thought and memory ever conceived is stored as a glowing, floating orb."
    },
    {
      "premise": "A sudden wave of profound, unconditional love washes over you, emanating from a massive, fractal entity that calls itself the mother of creation."
    },
    {
      "premise": "The texture of reality feels like a thin veil, and with a single thought, you pull it back to reveal the blinding, terrifying truth behind the simulation."
    }
  ],
  "procedural": {
    "titles": [
      "The Kaleidoscope Nexus: Chapter I",
      "The Meadow of Synesthesia: Chapter I",
      "Harmonies of the Prismatic Void: Chapter I",
      "The River of Liquid Starlight: Chapter I",
      "Threshold of the Aurora Garden: Chapter I"
    ],
    "firstNames": [
      "Orion",
      "Solana",
      "Kairo",
      "Lyra",
      "Zephyr",
      "Astra",
      "Echo",
      "Indigo"
    ],
    "lastNames": [
      "Prism",
      "Vortex",
      "Chroma",
      "Harmonia",
      "Lumina",
      "Solstice",
      "Mirage"
    ],
    "roles": [
      "Dimensional Nomad",
      "Prismatic Weaver",
      "Harmonic Seeker",
      "Cosmic Lucid Voyager",
      "Synthesist"
    ],
    "origins": [
      "Astral Being",
      "Consciousness Wanderer",
      "Lightbound Entity"
    ],
    "physicalTraits": [
      "Iridescent clothing that subtly shifts color in the ambient light, calm serene smile, carrying a resonant crystal chime staff."
    ],
    "hooks": [
      {
        "hook": "A door of iridescent light opens. You step into the Meadow of Synesthesia.",
        "actions": [
          "Ring chime",
          "Observe patterns",
          "Talk to flower"
        ],
        "gear": [
          {
            "name": "Chime Staff",
            "type": "weapon",
            "isEquipped": true
          }
        ],
        "spells": [
          "Color Shift"
        ],
        "hp": 12
      },
      {
        "hook": "Liquid starlight flows up the river. It tastes like memories.",
        "actions": [
          "Drink drop",
          "Measure frequency",
          "Float"
        ],
        "gear": [
          {
            "name": "Crystal Vial",
            "type": "potion",
            "isEquipped": true
          }
        ],
        "spells": [
          "Astral Float"
        ],
        "hp": 10
      },
      {
        "hook": "The sky folds into a triangle. You are drifting between realities.",
        "actions": [
          "Stabilize vision",
          "Tune resonance",
          "Dream"
        ],
        "gear": [
          {
            "name": "Prismatic Robe",
            "type": "armor",
            "isEquipped": true
          }
        ],
        "spells": [
          "Sonic Harmony"
        ],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Resonant Crystal Chime Staff",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "Hums in harmony with nearby thoughts."
    },
    {
      "name": "Vial of Liquid Starlight",
      "type": "potion",
      "quantity": 1,
      "isEquipped": false
    },
    {
      "name": "Iridescent Robes",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    }
  ],
  "ambient": [
    "The color of the air shifts, slowly, from teal to amber.",
    "A sound like distant bells resolves into a taste like mint.",
    "The floor breathes once, then holds still.",
    "Your shadow points a half-second after you do."
  ]
} satisfies CategoryContent;
