import type { CategoryContent } from '../types';

// Ancient Greek. Openers, tropes and media are checked by scripts/validate-content.ts.
export const ancientGreek = {
  "card": {
    "name": "Ancient Greek",
    "tagline": "Homeric Epics, Spartan Phalanxes & The Delphic Oracle",
    "description": "Inspired by Greek history and Homeric epics: Spartan hoplites holding the hot gates, Delphic oracle laurel vapors, Minotaur bronze labyrinths, and Olympian demigod trials.",
    "iconName": "Landmark",
    "gradient": "from-amber-500/30 via-yellow-900/40 to-slate-950",
    "accentColor": "#eab308",
    "bgTheme": "forest",
    "defaultCharacter": {
      "name": "Perseus of Sparta",
      "roleClass": "Hoplite Hero",
      "raceOrigin": "Spartan Demigod",
      "level": 1,
      "hp": 13,
      "maxHp": 13,
      "armorClass": 16,
      "initiativeBonus": 1,
      "stats": {
        "str": 16,
        "dex": 13,
        "con": 15,
        "int": 11,
        "wis": 13,
        "cha": 12
      },
      "inventory": [
        {
          "id": "ag1",
          "name": "Forged Bronze Dory Spear",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "ag2",
          "name": "Bronze Aspis Shield & Linothorax Armor",
          "type": "armor",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "ag3",
          "name": "Flask of Olive Oil & Traveler's Bread",
          "type": "potion",
          "quantity": 2
        }
      ],
      "spells": [
        "Spartan Courage",
        "Athena's Guidance"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A brave Spartan sent by his elders to seek the wisdom of the gods before embarking on his trials."
    },
    "samplePrompts": [
      "I offer a tribute of olive oil and barley at the temple altar to request an audience.",
      "I speak to the Spartan herald waiting on the temple terrace for news from home.",
      "I inspect the bronze dedications and mythic murals along the Sacred Way with a History check."
    ]
  },
  "profile": {
    "seedSource": "Homeric Epics, Spartan History & Mythological Antiquity",
    "voice": "Homeric, solemn, mythic, honor-bound. Elevated prose echoing the cadence of epic poetry, divine omens, and heroic virtue.",
    "atmosphere": "Sun-baked marble temple steps, olive groves rustling in Aegean breezes, bronze hoplite round shields, smoking laurel leaves at Delphic altars, wine-dark sea cliffs.",
    "sceneStructure": "1. Arrival at sacred oracle shrine or coastal mountain pass -> 2. Inspecting divine omens and preparing bronze arms -> 3. Receiving prophecy or royal decree -> 4. Heroic path choice.",
    "storyBeats": "Mythic trials and heroic destiny: consulting oracles, proving valor against monstrous trials, honoring vows to gods and companions, choosing between glorious peril and safe obscurity.",
    "characterDynamics": "Spartan champions, Delphic oracles, Athenian philosophers, Mycenaean kings, demigod wanderers.",
    "encounterPatterns": "Interpreting oracle laurel vapors, sacrificing offerings at marble altars, polishing bronze hoplite aspis shields, reciting oaths under Olympian skies.",
    "sensoryMotifs": [
      "The heat of sun-baked white marble underfoot and the salt wind off the wine-dark sea",
      "The heavy, reassuring weight of a bronze round shield strapped across the forearm",
      "The fragrant, dizzying smoke of crushed laurel leaves burning on a bronze brazier",
      "The resounding clash of bronze spearheads saluting before the Spartan phalanx"
    ],
    "avoid": "Medieval European feudal knights, modern casualisms, treating Greek heroes as generic fantasy wizards.",
    "avoidKeywords": [
      "knight",
      "castle",
      "feudal",
      "wizard",
      "smartphone"
    ]
  },
  "media": [
    {
      "title": "The Iliad",
      "medium": "Epic Poem"
    },
    {
      "title": "The Odyssey",
      "medium": "Epic Poem"
    },
    {
      "title": "300",
      "medium": "Film/Comic"
    },
    {
      "title": "Troy (2004)",
      "medium": "Film"
    },
    {
      "title": "Clash of the Titans (1981/2010)",
      "medium": "Film"
    },
    {
      "title": "Assassin's Creed Odyssey",
      "medium": "Game"
    },
    {
      "title": "Hades",
      "medium": "Game"
    },
    {
      "title": "God of War (Original Trilogy)",
      "medium": "Games"
    },
    {
      "title": "Percy Jackson and the Olympians",
      "medium": "Books/TV"
    },
    {
      "title": "The Song of Achilles",
      "medium": "Book"
    },
    {
      "title": "Immortals (2011)",
      "medium": "Film"
    },
    {
      "title": "Hercules (Disney)",
      "medium": "Film"
    },
    {
      "title": "Jason and the Argonauts (1963)",
      "medium": "Film"
    },
    {
      "title": "Titan Quest",
      "medium": "Game"
    },
    {
      "title": "Blood of Zeus",
      "medium": "Netflix"
    },
    {
      "title": "Alexander (2004)",
      "medium": "Film"
    },
    {
      "title": "Troy: Fall of a City",
      "medium": "TV Show"
    },
    {
      "title": "Spartacus",
      "medium": "TV Show"
    },
    {
      "title": "Circe",
      "medium": "Book"
    }
  ],
  "openers": [
    {
      "id": "seed_grk_01",
      "title": "The Delphic Laurel Prophecy",
      "tagline": "The Pythia whispers that your own brother will poison the Spartan spring.",
      "premise": "Standing before the smoking bronze brazier at the Oracle of Delphi, the Pythia breathes deep of the laurel vapors and locks her unseeing eyes onto you: \"The hero who returns to Sparta with the golden spear shall find their brother pouring hemlock into the garrison well.\"",
      "hero": {
        "name": "Leonidas of Sparta",
        "role": "Hoplite Champion",
        "origin": "Spartan Warrior"
      },
      "actions": [
        "Sacrifice a black ram at the marble altar to demand clarification from Apollo.",
        "Mount your chariot to race across the mountain pass before sunset.",
        "Inspect your bronze spear for divine omens of favor."
      ],
      "gear": [
        {
          "name": "Dory Spear",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Aspis",
          "type": "armor"
        }
      ],
      "spells": [
        "Spartan Courage"
      ],
      "hp": 13
    }
  ],
  "tropes": [
    {
      "premise": "The oracle inhales the sulfurous fumes of Delphi and points a trembling finger directly at you, prophesying the fall of Olympus."
    },
    {
      "premise": "A massive bronze automaton awakens outside the city gates, sent by Hephaestus to test the mettle of the mortal heroes."
    },
    {
      "premise": "You draw your xiphos sword as the Minotaur roars, the sound echoing endlessly through the twisting, bloodstained corridors of the Labyrinth."
    },
    {
      "premise": "The Spartan king demands you hold the narrow mountain pass against a horde of Persian immortals with only a handful of hoplites."
    },
    {
      "premise": "A tempest summoned by Poseidon shatters your trireme, washing you ashore on an island inhabited by a dangerous, alluring enchantress."
    },
    {
      "premise": "The gods themselves intervene on the battlefield, the ground trembling as Ares descends in a chariot of fire to turn the tide of the war."
    },
    {
      "premise": "You must steal the Golden Fleece from the sacred grove of Ares, heavily guarded by a sleepless dragon with scales of iron."
    },
    {
      "premise": "The shade of a fallen hero approaches you in the gloom of the Underworld, offering vital information in exchange for a drop of sacrificial blood."
    },
    {
      "premise": "You face the Gorgon in the ruined temple, relying entirely on the polished reflection of your bronze shield to avoid her petrifying gaze."
    },
    {
      "premise": "The arrogant king refuses to honor his vow to the gods, and a terrible plague of serpents is unleashed upon the city."
    },
    {
      "premise": "A centaur offers to train you in the arts of war and healing, provided you can pass a grueling trial of endurance in the mountains."
    },
    {
      "premise": "You compete in the Olympic games, but the rival champion is revealed to be a demigod cheating with the blessings of Hermes."
    },
    {
      "premise": "The siren song drifts across the Aegean Sea, and you must lash yourself to the mast to prevent yourself from diving into the jagged rocks."
    },
    {
      "premise": "You navigate the treacherous politics of the Athenian Senate, trying to prevent a disastrous war with a rival city-state."
    },
    {
      "premise": "The wrath of Achilles threatens to doom the entire Greek army, and you are chosen to negotiate a truce with the sulking hero."
    },
    {
      "premise": "A Harpy swoops down from the cliffs, snatching the vital map to the Elysian Fields from your hands."
    },
    {
      "premise": "You are tasked with completing twelve impossible labors to atone for a terrible crime, beginning with slaying an invulnerable lion."
    },
    {
      "premise": "The Trojan Horse has been breached, and you are fighting desperately through the burning streets of Troy as the city falls."
    },
    {
      "premise": "A satyr offers you a cup of enchanted wine that reveals hidden truths, but threatens to induce a state of permanent madness."
    },
    {
      "premise": "You ascend the slopes of Mount Olympus to demand an audience with Zeus, braving the elemental guardians that protect the summit."
    }
  ],
  "procedural": {
    "titles": [
      "The Oracle's Prophecy: Chapter I",
      "The Spartan Vanguard at Mount Parnassus: Chapter I",
      "Trials of the Olympian Altar: Chapter I",
      "The Minotaur's Bronze Seal: Chapter I",
      "Dawn of the Parthenon Envoy: Chapter I"
    ],
    "firstNames": [
      "Perseus",
      "Leonidas",
      "Thalia",
      "Kassandra",
      "Demetrius",
      "Alexios",
      "Iphigenia",
      "Nikolaos"
    ],
    "lastNames": [
      "of Sparta",
      "of Athens",
      "of Thebes",
      "of Corinth",
      "of Mycenae",
      "Parnassos"
    ],
    "roles": [
      "Hoplite Hero",
      "Spartan Vanguard",
      "Delphic Oracle Scholar",
      "Demigod Champion",
      "Olympic Pankration Duelist"
    ],
    "origins": [
      "Spartan Demigod",
      "Athenian Citizen",
      "Mycenaean Warrior"
    ],
    "physicalTraits": [
      "Athletic muscular frame, sun-darkened skin, scarlet crest helmet, carrying a polished bronze aspis shield and iron-tipped dory spear."
    ],
    "hooks": [
      {
        "hook": "Sunlight on the Temple of Apollo. You have come for a prophecy.",
        "actions": [
          "Offer tribute",
          "Speak to herald",
          "Inspect murals"
        ],
        "gear": [
          {
            "name": "Dory Spear",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Aspis",
            "type": "armor"
          }
        ],
        "spells": [
          "Spartan Courage"
        ],
        "hp": 13
      },
      {
        "hook": "The Minotaur’s labyrinth is ahead. Your bronze seal is glowing.",
        "actions": [
          "Trace maze",
          "Sharpen spear",
          "Prepare"
        ],
        "gear": [
          {
            "name": "Bronze Seal",
            "type": "relic",
            "isEquipped": true
          }
        ],
        "spells": [
          "Athena's Guidance"
        ],
        "hp": 12
      },
      {
        "hook": "Olympic games. The crowd chants your name. You need to win to prove your lineage.",
        "actions": [
          "Stretch",
          "Pray",
          "Check gear"
        ],
        "gear": [
          {
            "name": "Oil",
            "type": "potion",
            "isEquipped": true
          }
        ],
        "spells": [
          "Spartan Courage"
        ],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Iron-tipped Dory Spear",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Polished Bronze Aspis",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Laurel of Apollo",
      "type": "relic",
      "quantity": 1
    }
  ],
  "ambient": [
    "A column of incense smoke rises straight up in the still air.",
    "Distant bronze bowls ring out the noon offering.",
    "A laurel leaf falls from a wreath you did not notice you were wearing.",
    "The oracle's veil trembles though there is no wind."
  ]
} satisfies CategoryContent;
