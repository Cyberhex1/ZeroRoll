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
    },
    {
      "id": "seed_myth_02",
      "title": "The Hearth That Forgets Its Kin",
      "tagline": "An empty place at the hearth is not an empty promise.",
      "premise": "You return to a snowbound hall where the hearth refuses warmth to one family and a guest claims the forgotten place beside your ancestors.",
      "hero": {
        "name": "Sigrun Ashwake",
        "role": "Oath Keeper",
        "origin": "Fjord-born human"
      },
      "actions": [
        "Ask the guest whose name belongs to the cold bench.",
        "Lay your household token beside the failing embers.",
        "Hear the excluded family's account before the feast begins."
      ],
      "gear": [
        {
          "name": "Hearth Spear",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Household Token",
          "type": "relic"
        },
        {
          "name": "Wool Mantle",
          "type": "armor"
        }
      ],
      "spells": [
        "Kinfire"
      ],
      "hp": 12
    },
    {
      "id": "seed_myth_03",
      "title": "The Wolf Beneath the Keel",
      "tagline": "The vessel will float when the thing beneath it finishes counting.",
      "premise": "You trace runes on a beached longship and hear a bound wolf counting the crew beneath its keel as the tide begins to lift it.",
      "hero": {
        "name": "Eirik Mereborn",
        "role": "Rune Carver",
        "origin": "Northern islander"
      },
      "actions": [
        "Trace the damaged binding rune along the keel.",
        "Ask the waiting crew which oath launched this vessel.",
        "Shore the longship above the next rise of the tide."
      ],
      "gear": [
        {
          "name": "Carving Axe",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Rune Chisel",
          "type": "misc"
        },
        {
          "name": "Shore Rope",
          "type": "misc"
        }
      ],
      "spells": [
        "Rune Listening"
      ],
      "hp": 13
    },
    {
      "id": "seed_myth_04",
      "title": "The Cup Beyond the Ninth Wave",
      "tagline": "The returning boat expects more than a cup.",
      "premise": "You reach a stone-ring shore where a cup from the otherworld washes back with an old promise and your companion steps toward its returning boat.",
      "hero": {
        "name": "Nessa Rowanfern",
        "role": "Shore Warden",
        "origin": "Western-isle human"
      },
      "actions": [
        "Speak the remembered terms of the old shore bargain.",
        "Ask your companion what the cup has promised them.",
        "Follow the cup's wet trail back to the outer stones."
      ],
      "gear": [
        {
          "name": "Shore Spear",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Otherworld Cup",
          "type": "relic"
        },
        {
          "name": "Salt Cord",
          "type": "misc"
        }
      ],
      "spells": [
        "Waveward"
      ],
      "hp": 12
    },
    {
      "id": "seed_myth_05",
      "title": "The Antler Road",
      "tagline": "Winter has opened a road and hidden its price.",
      "premise": "You stand before a winter stone circle when antler shadows open a road toward a captive season and the grove's last green branch starts to fade.",
      "hero": {
        "name": "Branoc Hazel",
        "role": "Grove Pathfinder",
        "origin": "Forest-born human"
      },
      "actions": [
        "Examine the antler shadows before stepping between them.",
        "Tie the living branch to a stone where it can be found again.",
        "Call into the road for the captive season's own account."
      ],
      "gear": [
        {
          "name": "Hazel Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Green Branch",
          "type": "relic"
        },
        {
          "name": "Stone Token",
          "type": "misc"
        }
      ],
      "spells": [
        "Grove Listening"
      ],
      "hp": 11
    },
    {
      "id": "seed_myth_06",
      "title": "The Weight of the Unfinished Name",
      "tagline": "A missing name has made an unjust weight.",
      "premise": "You enter a mythic weighing hall bearing a broken name tablet and find the scales tipping against someone whose final act has been erased.",
      "hero": {
        "name": "Merit Iset",
        "role": "Funerary Scribe",
        "origin": "Nile-valley human"
      },
      "actions": [
        "Fit the broken tablet against the empty place on the scale.",
        "Ask the waiting soul to name the act no record preserves.",
        "Request that the weighing pause until a witness is heard."
      ],
      "gear": [
        {
          "name": "Reed Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Broken Name Tablet",
          "type": "relic"
        },
        {
          "name": "Ink Palette",
          "type": "misc"
        }
      ],
      "spells": [
        "Name Recall"
      ],
      "hp": 10
    },
    {
      "id": "seed_myth_07",
      "title": "The Door of Borrowed Dawn",
      "tagline": "Your household has promised away the morning.",
      "premise": "You climb a frostbound ridge to light the morning beacon and find dawn pledged as payment for an oath your household never heard.",
      "hero": {
        "name": "Hrafna Reedcloak",
        "role": "Dawn Watcher",
        "origin": "Frost-coast human"
      },
      "actions": [
        "Read the old pledge beneath the frost on the beacon stone.",
        "Light a small witness flame before offering any new oath.",
        "Ask the unseen creditor what debt the first promise answered."
      ],
      "gear": [
        {
          "name": "Watch Axe",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Beacon Flint",
          "type": "misc"
        },
        {
          "name": "Frost-Carved Token",
          "type": "relic"
        }
      ],
      "spells": [
        "Dawnward"
      ],
      "hp": 12
    },
    {
      "id": "seed_myth_08",
      "title": "The Ferryman's Winter Guest",
      "tagline": "Spring is waiting on the wrong side of a remembered kindness.",
      "premise": "You reach an icebound ferry stone where a silent traveler carries spring beneath a cloak and the river demands a remembered kindness as its fare.",
      "hero": {
        "name": "Solveig Tarn",
        "role": "River Guide",
        "origin": "Inland-valley human"
      },
      "actions": [
        "Ask the traveler what help they have given along the road.",
        "Offer the river a true account of a kindness you witnessed.",
        "Inspect the ferry stone for the terms of an earlier crossing."
      ],
      "gear": [
        {
          "name": "Ferryman's Staff",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Oar Token",
          "type": "relic"
        },
        {
          "name": "Wool Blanket",
          "type": "misc"
        }
      ],
      "spells": [
        "River Memory"
      ],
      "hp": 11
    },
    {
      "id": "seed_myth_09",
      "title": "The Hammer Under the Feast",
      "tagline": "Every oath at the feast strikes a hidden anvil.",
      "premise": "You bring a repaired hammer to a mountain feast and hear it strike from beneath the floor whenever a guest swears loyalty to the host.",
      "hero": {
        "name": "Ketil Embermere",
        "role": "Hall Smith",
        "origin": "Volcanic-island human"
      },
      "actions": [
        "Set the repaired hammer against the sounding floorboards.",
        "Ask the host to explain the oldest oath of the hall.",
        "Mark which guests make the buried blows grow louder."
      ],
      "gear": [
        {
          "name": "Repaired Hammer",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Iron Tongs",
          "type": "misc"
        },
        {
          "name": "Hearth Chalk",
          "type": "misc"
        }
      ],
      "spells": [
        "Stone Hearing"
      ],
      "hp": 13
    },
    {
      "id": "seed_myth_10",
      "title": "The Stag at the Last Ember",
      "tagline": "The last ember can be saved, but an oath must still mean something.",
      "premise": "You tend a hilltop vigil where a white stag guards the final ember and a voice from the stones offers to save it by taking your oldest promise.",
      "hero": {
        "name": "Ailbhe Mossward",
        "role": "Boundary Singer",
        "origin": "Mist-isle human"
      },
      "actions": [
        "Ask the voice whose loss would keep the ember alive.",
        "Sing the history of the promise before accepting new terms.",
        "Offer the stag shelter from the wind while you inspect the stones."
      ],
      "gear": [
        {
          "name": "Ashwood Bow",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Ember Bowl",
          "type": "relic"
        },
        {
          "name": "Weathered Oath Cord",
          "type": "misc"
        }
      ],
      "spells": [
        "Ember Ward"
      ],
      "hp": 11
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
