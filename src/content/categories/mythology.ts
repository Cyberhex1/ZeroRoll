import type { CategoryContent } from '../types';

// Mythology. Openers, tropes and media are checked by scripts/validate-content.ts.
export const mythology = {
  "card": {
    "name": "Mythology",
    "tagline": "Norse Eddas, Egyptian Book of the Dead & Hermetic Alchemy",
    "description": "Drawn from world religions and occult lore: the Bifrost rainbow bridge siege, Anubis weighing the heart in the Hall of Two Truths, Celtic Tír na nÓg, and Hermetic alchemy.",
    "iconName": "Zap",
    "gradient": "from-cyan-600/30 via-blue-900/40 to-slate-950",
    "accentColor": "#06b6d4",
    "bgTheme": "snow",
    "defaultCharacter": {
      "name": "Freya Stormweaver",
      "roleClass": "Valkyrie Champion",
      "raceOrigin": "Valkyrie Spirit",
      "level": 1,
      "hp": 12,
      "maxHp": 12,
      "armorClass": 15,
      "initiativeBonus": 2,
      "stats": {
        "str": 15,
        "dex": 14,
        "con": 14,
        "int": 12,
        "wis": 14,
        "cha": 13
      },
      "inventory": [
        {
          "id": "m1",
          "name": "Runic Silver Spear",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "m2",
          "name": "Valkyrie Aegis Shield",
          "type": "armor",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "m3",
          "name": "Mead Horn & Rations of Idunn",
          "type": "potion",
          "quantity": 2
        }
      ],
      "spells": [
        "Rune Ward",
        "Bifrost Shimmer",
        "Valhalla Guidance"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A dedicated guardian taking up her duties to protect the realm from encroaching perils."
    },
    "samplePrompts": [
      "I greet Heimdall and receive today's celestial watch assignments.",
      "I peer through the golden observatory spyglass toward Midgard and Jotunheim with a Perception check.",
      "I inscribe a rune of warding along my aegis shield before stepping onto your patrol route."
    ]
  },
  "profile": {
    "seedSource": "Norse Eddas, Celtic Cycles & Ancient World Myth Sagas",
    "voice": "Saga-like, stark, legendary, fate-woven. Features poetic kennings, deep respect for wyrd/destiny, and the elemental weight of frost, fire, and thunder.",
    "atmosphere": "Howling northern blizzards, carved runic megaliths, ravens circling frostbitten fjords, crackling mead hall hearths, auroras dancing across frozen peaks.",
    "sceneStructure": "1. Standing before an ancient stone circle or fjord cliff -> 2. Reading runic megaliths or raven omens -> 3. Testing ancestral heirloom weapon -> 4. Fate-bound challenge choice.",
    "storyBeats": "Epic destiny and wyrd: honoring blood-oaths, braving frost giant domains, unraveling mythological riddles, defying doom with unwavering courage.",
    "characterDynamics": "Rune-carvers, shieldmaidens, berserkers, skaldic bards, raven emissaries of the All-Father.",
    "encounterPatterns": "Tracing weathered runes on mossy stones, pouring mead libations for the norns, interpreting twin raven flights, bracing against glacial gales.",
    "sensoryMotifs": [
      "Glacial fjord winds carrying the scent of pine smoke and distant sea ice",
      "Twin black ravens calling out against the vibrant green curtain of the northern lights",
      "The cold bite of carved granite beneath fingertips tracing ancestral elder runes",
      "The thrum of an ash-wood bowstring drawn taut before the frozen ridge"
    ],
    "avoid": "Trivial modern complaints, silly cartoon Viking stereotypes, weak cowardly surrender to fate.",
    "avoidKeywords": [
      "cartoon"
    ]
  },
  "media": [
    {
      "title": "God of War (Norse Saga)",
      "medium": "Games"
    },
    {
      "title": "Thor: Ragnarok",
      "medium": "Film"
    },
    {
      "title": "American Gods",
      "medium": "Book/TV"
    },
    {
      "title": "The Northman",
      "medium": "Film"
    },
    {
      "title": "Valheim",
      "medium": "Game"
    },
    {
      "title": "Assassin's Creed Valhalla",
      "medium": "Game"
    },
    {
      "title": "Senua's Sacrifice",
      "medium": "Game"
    },
    {
      "title": "Moon Knight",
      "medium": "TV Show"
    },
    {
      "title": "Stargate SG-1",
      "medium": "TV Show"
    },
    {
      "title": "The Kane Chronicles",
      "medium": "Books"
    },
    {
      "title": "Age of Mythology",
      "medium": "Game"
    },
    {
      "title": "Smite",
      "medium": "Game"
    },
    {
      "title": "Lore Olympus",
      "medium": "Webtoon"
    },
    {
      "title": "The Lesser Key of Solomon",
      "medium": "Ars Goetia"
    },
    {
      "title": "The Book of the Law",
      "medium": "Aleister Crowley"
    },
    {
      "title": "The Kybalion",
      "medium": "Hermeticism"
    },
    {
      "title": "The Picatrix",
      "medium": "Astrological Magic"
    },
    {
      "title": "The Book of Abramelin",
      "medium": "Occult Grimoire"
    },
    {
      "title": "The Voynich Manuscript",
      "medium": "Unciphered Codex"
    }
  ],
  "openers": [
    {
      "id": "seed_myth_01",
      "title": "The Ravens of the All-Father",
      "tagline": "A black raven drops an engraved rune stone into your foaming mead horn.",
      "premise": "In the great timber mead hall of Valhalla, a black raven swoops from the smoke hole and drops a frost-carved rune stone into your horn. The carving ignites with blue lightning, spelling out a warning: the Frost Giants have breached the Bifrost gate.",
      "hero": {
        "name": "Torstein Bloodaxe",
        "role": "Viking Skald",
        "origin": "Norse Warrior"
      },
      "actions": [
        "Raise your battleaxe and rally the mead hall warriors with a skaldic battle song.",
        "Interpret the elder runes with an insight roll to learn the giant's weakness.",
        "Pour the lightning mead onto the hearth to seal your oath of defense."
      ],
      "gear": [
        {
          "name": "Silver Spear",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Aegis",
          "type": "armor"
        }
      ],
      "spells": [
        "Rune Ward"
      ],
      "hp": 12
    }
  ],
  "tropes": [
    {
      "premise": "You chant the final verses of the Picatrix under a blood moon, and the chalk circle begins to glow as a demonic entity materializes from the sulfurous smoke."
    },
    {
      "premise": "The frost giants breach the gates of Asgard, and you must defend the Bifrost bridge alongside the Valkyries as Ragnarok begins."
    },
    {
      "premise": "Anubis weighs your heart against the feather of truth, but the scales tip, and the devourer beast steps forward from the shadows."
    },
    {
      "premise": "You decipher a hidden passage in the Voynich Manuscript that reveals the exact astrological alignment required to achieve true Hermetic alchemy."
    },
    {
      "premise": "A draugr bursts from its burial mound in the freezing snow, wielding a rusted iron sword glowing with ancient, necrotic runes."
    },
    {
      "premise": "The pharaoh's tomb is sealed behind you, and the hieroglyphs on the walls begin to shift and rearrange into a curse of eternal suffering."
    },
    {
      "premise": "You invoke the seventy-two demons of the Ars Goetia to bind a powerful spirit to your will, but the entity demands a terrible sacrifice."
    },
    {
      "premise": "The World Tree, Yggdrasil, shudders violently as the great serpent Jörmungandr releases its tail and causes earthquakes across Midgard."
    },
    {
      "premise": "You follow the instructions in the Book of Abramelin, isolating yourself for months to summon your Holy Guardian Angel for divine guidance."
    },
    {
      "premise": "A secret society in Victorian London attempts to enact the principles of the Kybalion to manipulate reality through mental transmutation."
    },
    {
      "premise": "The Celtic gods of the Tuatha Dé Danann offer you a place in Tír na nÓg, but you can never return to the mortal world if you accept."
    },
    {
      "premise": "You must navigate the perilous journey through the Egyptian Duat, facing demons and trials of the soul to reach the Field of Reeds."
    },
    {
      "premise": "A modern-day cult attempts to summon an ancient deity using the rituals detailed in the Book of the Law, ignoring the apocalyptic consequences."
    },
    {
      "premise": "Odin the Allfather arrives at your longhouse disguised as a wanderer, testing your hospitality before offering a cryptic prophecy."
    },
    {
      "premise": "The scarab beetles swarm out of the sarcophagus, covering the floor of the burial chamber as the mummified priest awakens."
    },
    {
      "premise": "You seek the wisdom of the Norns at the base of the World Tree, demanding to know the fate woven into the threads of your destiny."
    },
    {
      "premise": "A rival alchemist discovers the secret to creating the Philosopher's Stone, and you must stop them from achieving dangerous, unchecked immortality."
    },
    {
      "premise": "The Egyptian sun god Ra requires your aid to defend his solar barge from the chaos serpent Apophis during its nightly journey through the underworld."
    },
    {
      "premise": "You uncover a grimoire that teaches the forbidden art of creating a homunculus, but the creature begins to develop a malicious will of its own."
    },
    {
      "premise": "The wild hunt rides across the stormy night sky, and you must hide before the spectral hounds catch your scent."
    }
  ],
  "procedural": {
    "titles": [
      "The Bifrost Watch: Chapter I",
      "The Scales of Ma'at: Chapter I",
      "The Gate of Tír na nÓg: Chapter I",
      "The Alchemist's Magnum Opus: Chapter I",
      "Echoes of Valhalla: Chapter I"
    ],
    "firstNames": [
      "Freya",
      "Sigurd",
      "Astrid",
      "Torin",
      "Hervor",
      "Anhur",
      "Ciaran",
      "Althea"
    ],
    "lastNames": [
      "Stormweaver",
      "Ironfist",
      "Frostbane",
      "Ravenheart",
      "Goldenhair",
      "Mooncaller"
    ],
    "roles": [
      "Valkyrie Champion",
      "Einherjar Guard",
      "Priest of Anubis",
      "Celtic Druid Herald",
      "Hermetic Alchemist"
    ],
    "origins": [
      "Valkyrie Spirit",
      "Asgardian Warrior",
      "Egyptian High Priest",
      "Tuatha Dé Danann"
    ],
    "physicalTraits": [
      "Radiant auroral glow surrounding silver hair, engraved wing motifs across light plate armor, wielding a runic silver spear."
    ],
    "hooks": [
      {
        "hook": "Bifrost Bridge glows. Heimdall nods as you arrive.",
        "actions": [
          "Receive assignment",
          "Use spyglass",
          "Inscribe rune"
        ],
        "gear": [
          {
            "name": "Silver Spear",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Aegis",
            "type": "armor"
          }
        ],
        "spells": [
          "Rune Ward"
        ],
        "hp": 12
      },
      {
        "hook": "The Scales of Ma'at weigh your heart. The feather is light.",
        "actions": [
          "Meditate",
          "Ask Anubis",
          "Look at soul"
        ],
        "gear": [
          {
            "name": "Scale",
            "type": "relic",
            "isEquipped": true
          }
        ],
        "spells": [
          "Bifrost Shimmer"
        ],
        "hp": 10
      },
      {
        "hook": "Tír na nÓg gate is open. The fairy music is intoxicating.",
        "actions": [
          "Enter gate",
          "Hold breath",
          "Check charm"
        ],
        "gear": [
          {
            "name": "Charm",
            "type": "misc",
            "isEquipped": true
          }
        ],
        "spells": [
          "Valhalla Guidance"
        ],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Runic Silver Spear",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Engraved Aegis",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Whispering Rune-stone",
      "type": "relic",
      "quantity": 1
    }
  ],
  "ambient": [
    "The runes on your forearm glow briefly, then dim.",
    "A raven lands on the fence post and regards you with one eye.",
    "Somewhere, a horn sounds across a valley that was empty an hour ago.",
    "The wind smells of iron and cold starlight."
  ]
} satisfies CategoryContent;
