import type { CategoryContent } from '../types';

// Romantic. Openers, tropes and media are checked by scripts/validate-content.ts.
export const romantic = {
  "card": {
    "name": "Romantic",
    "tagline": "GoodNovel Tropes, Masquerades & Star-Crossed Dynasties",
    "description": "Drawn from high-society romance & DramaBox dynamics: secret engagements, midnight masquerade waltzes, enemies-to-lovers tension, and dangerous court intrigue.",
    "iconName": "Heart",
    "gradient": "from-rose-600/30 via-pink-900/40 to-slate-950",
    "accentColor": "#f43f5e",
    "bgTheme": "cozy",
    "defaultCharacter": {
      "name": "Lady Aurelia Rose",
      "roleClass": "Charming Court Bard",
      "raceOrigin": "Half-Elf Noble",
      "level": 1,
      "hp": 10,
      "maxHp": 10,
      "armorClass": 13,
      "initiativeBonus": 2,
      "stats": {
        "str": 9,
        "dex": 15,
        "con": 11,
        "int": 13,
        "wis": 13,
        "cha": 16
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Silver-Strung Pocket Lute",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "i2",
          "name": "Jeweled Stiletto Dagger",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i3",
          "name": "Velvet Masquerade Mask & Invitation",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [
        "Charm Person",
        "Disguise Self",
        "Guidance",
        "Friends"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "Attending the grand seasonal ball to navigate high-society intrigue and romance."
    },
    "samplePrompts": [
      "I present my engraved silver invitation to the Grand Chamberlain at the palace entrance.",
      "I mingle among the arriving masquerade guests to listen for court gossip with an Insight check.",
      "I step out onto the moonlit canal terrace to admire the palace gardens."
    ]
  },
  "profile": {
    "seedSource": "GoodNovel & PrimeDrama Passionate Dynasties & Masquerades",
    "voice": "Elegant, witty, emotionally perceptive, sensory-rich prose. High subtext, sparkling dialogue, lingering romantic tension, and sharp courtly awareness.",
    "atmosphere": "Venetian grand canals, moonlit palace balustrades, velvet domino masks, glittering crystal flutes, candlelit ballrooms, soft violin waltzes echoing over water.",
    "sceneStructure": "1. Arrival at an opulent masquerade or court ball -> 2. Tense encounter or lingering glance with a brooding rival/contract partner -> 3. Delicate social intrigue or secret letter -> 4. High-stakes conversational choice.",
    "storyBeats": "Emotional friction and vulnerability: starts with a guarded public encounter, deepens through private banter and shared peril, escalating mutual fascination and court stakes.",
    "characterDynamics": "Brooding commanders, sharp-witted heiresses, rival diplomats, gossiping court matriarchs, watchful grand chamberlains.",
    "encounterPatterns": "Invitation scrutiny at the gates, ballroom dance invitations, balcony confrontations, intercepted love letters, whispered court rumors.",
    "sensoryMotifs": [
      "Gilded gondolas gliding across moonlit canal waters under paper lanterns",
      "The rustle of heavy silk velvet and the click of delicate fans",
      "A lingering glance exchanged across a crowded chandelier ballroom",
      "The scent of crushed rosewater and melting beeswax candles on a terrace"
    ],
    "avoid": "Modern internet slang, crude unromantic dialogue, flat emotionless exposition, disjointed action without romantic stakes.",
    "avoidKeywords": [
      "lol",
      "omg",
      "zombie",
      "gore"
    ]
  },
  "media": [
    {
      "title": "Bridgerton",
      "medium": "TV/Books"
    },
    {
      "title": "Pride and Prejudice",
      "medium": "Book/Film"
    },
    {
      "title": "Outlander",
      "medium": "Book/TV"
    },
    {
      "title": "The Great",
      "medium": "TV Show"
    },
    {
      "title": "The Crown",
      "medium": "TV Show"
    },
    {
      "title": "Downton Abbey",
      "medium": "TV Show"
    },
    {
      "title": "Gossip Girl",
      "medium": "TV Show"
    },
    {
      "title": "Cruel Intentions",
      "medium": "Film"
    },
    {
      "title": "The Vampire Diaries",
      "medium": "TV Show"
    },
    {
      "title": "A Court of Thorns and Roses",
      "medium": "Book Series"
    },
    {
      "title": "The Selection",
      "medium": "Book Series"
    },
    {
      "title": "Sense and Sensibility",
      "medium": "Book"
    },
    {
      "title": "Marie Antoinette (2006)",
      "medium": "Film"
    },
    {
      "title": "Reign",
      "medium": "TV Show"
    },
    {
      "title": "Euphoria",
      "medium": "TV Show"
    },
    {
      "title": "After by Anna Todd",
      "medium": "Wattpad"
    },
    {
      "title": "The Kissing Booth by Beth Reekles",
      "medium": "Wattpad"
    },
    {
      "title": "Through My Window by Ariana Godoy",
      "medium": "Wattpad"
    },
    {
      "title": "Chasing Red by Isabelle Ronin",
      "medium": "Wattpad"
    },
    {
      "title": "Perfect Illusion by Claudia Tan",
      "medium": "Wattpad"
    }
  ],
  "openers": [
    {
      "id": "seed_rom_01",
      "title": "The Midnight Masquerade",
      "tagline": "Dancing with the brooding duke who condemned your family.",
      "premise": "Beneath a velvet domino mask at the Venetian Doge's gala, you are swept into a waltz by Duke Sterling — the cold commander whose signature seized your family estates. As his gloved hand rests on yours, he whispers that he knows who you are and wants to make a deal.",
      "hero": {
        "name": "Genevieve Valois",
        "role": "Masked Noblewoman",
        "origin": "Venetian Aristocrat"
      },
      "actions": [
        "Match his steps in the waltz while demanding to know what deal could possibly undo his treason.",
        "Steer the dance toward the moonlit balcony to speak away from prying courtiers.",
        "Slip your concealed stiletto against his waistline to test his composure."
      ],
      "gear": [
        {
          "name": "Dagger",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Mask",
          "type": "misc"
        }
      ],
      "spells": [
        "Charm Person"
      ],
      "hp": 10
    },
    {
      "id": "seed_rom_02",
      "title": "The Counterfeit Betrothal",
      "tagline": "Faking a high-society romance with your sharpest courtroom rival.",
      "premise": "To secure a massive maritime trading concession, you and your fiercest legal rival, Lord Julian, must convince the high tribunal that you are passionately betrothed. At the opening reception, a rival barrister steps forward to challenge your love story.",
      "hero": {
        "name": "Rosalind Claire",
        "role": "High Court Barrister",
        "origin": "Provincial Elite"
      },
      "actions": [
        "Laugh charmingly, take Julian's arm, and fabricate a romantic first-meeting anecdote.",
        "Whisper sharp tactical instructions into Julian's ear while smiling for the socialites.",
        "Present the joint maritime charter bearing both your forged wax seals."
      ],
      "gear": [
        {
          "name": "Fan",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Disguise Self"
      ],
      "hp": 11
    },
    {
      "id": "seed_rom_03",
      "title": "The Intercepted Love Letters",
      "tagline": "The poet who wooed you through parchment is actually the stoic general.",
      "premise": "For six months, you have traded brilliant, intimate philosophical letters with a mysterious poet signed \"A.S.\" Tonight at the royal garden gala, you accidentally discover the identical custom watermark paper and fountain pen inside General Alexander Sterling's dispatch case.",
      "hero": {
        "name": "Cecilia Thorne",
        "role": "Royal Archivist",
        "origin": "Capital-born human"
      },
      "actions": [
        "Quote a line from his latest letter to him and watch his stoic expression shatter.",
        "Slip a coded reply into his dispatch case before he returns from speaking with the king.",
        "Ask him why the most feared general in the empire writes love poetry by candlelight."
      ],
      "gear": [
        {
          "name": "Signet Ring",
          "type": "relic",
          "isEquipped": true
        }
      ],
      "spells": [
        "Guidance"
      ],
      "hp": 12
    },
    {
      "id": "seed_rom_04",
      "title": "The Spite Marriage",
      "tagline": "Proposing to the enemy commander to humiliate your unfaithful fiancé.",
      "premise": "Minutes after discovering your aristocratic fiancé embracing your cousin behind the ballroom curtains, you turn to find the imposing foreign ambassador Lord Vane watching with amusement. In a flash of defiance, you offer him your hand and family alliance on the spot.",
      "hero": {
        "name": "Aurelia Sterling",
        "role": "Defiant Heiress",
        "origin": "Imperial Aristocrat"
      },
      "actions": [
        "Announce the engagement to Lord Vane loudly in front of the entire ballroom.",
        "Pull Lord Vane onto the terrace to negotiate the private terms of your marriage contract.",
        "Watch your unfaithful ex-fiancé turn pale as the ambassador accepts with a slow smile."
      ],
      "gear": [
        {
          "name": "Dagger",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Mask",
          "type": "misc"
        }
      ],
      "spells": [
        "Charm Person"
      ],
      "hp": 10
    },
    {
      "id": "seed_rom_05",
      "title": "The Governess's Secret",
      "tagline": "Hired to tutor the reclusive lord's ward — with a price on your head.",
      "premise": "Hiding from a corrupt magistrate under the guise of an unassuming French tutor, you arrive at the windswept coastal manor of Lord Gabriel Vance. Within an hour, he catches you translating an ancient cipher you were never supposed to understand.",
      "hero": {
        "name": "Camille Laurent",
        "role": "Disguised Cipherist",
        "origin": "Borderland human"
      },
      "actions": [
        "Offer to decipher the rest of his late father's journal in exchange for sanctuary.",
        "Maintain your innocent governess facade and feign ignorance of the language.",
        "Slip out to the seaside cliffs to verify your escape route if he calls the authorities."
      ],
      "gear": [
        {
          "name": "Fan",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Disguise Self"
      ],
      "hp": 11
    },
    {
      "id": "seed_rom_06",
      "title": "The Stolen Heirloom Fan",
      "tagline": "Recovering your grandmother's ivory fan from a dashing jewel thief.",
      "premise": "At the midnight opera in Vienna, a notorious gentleman thief steals the carved ivory fan that conceals your family's sovereign signet. You corner him in the velvet curtained royal box, only for him to offer an irresistible partnership instead of a fight.",
      "hero": {
        "name": "Vivienne Moreau",
        "role": "Diplomatic Envoy",
        "origin": "Viennese Noble"
      },
      "actions": [
        "Hold him at stiletto-point and demand the ivory fan back immediately.",
        "Listen to his proposal regarding the corrupt minister sitting in Box 4.",
        "Signal the opera house guards while keeping him occupied in conversation."
      ],
      "gear": [
        {
          "name": "Signet Ring",
          "type": "relic",
          "isEquipped": true
        }
      ],
      "spells": [
        "Guidance"
      ],
      "hp": 12
    },
    {
      "id": "seed_rom_07",
      "title": "The Rival Architects",
      "tagline": "Competing for the royal cathedral commission with the man you once loved.",
      "premise": "The king announces an open competition to design the Grand Basilica of the Sun. Your fiercest competitor across the drafting tables is Lucas DuPont — your former mentor and the only person who knows why you left the academy seven years ago.",
      "hero": {
        "name": "Beatrice Fontaine",
        "role": "Master Architect",
        "origin": "Guild Prodigy"
      },
      "actions": [
        "Unroll your revolutionary vaulted dome blueprint before the royal jury.",
        "Meet Lucas by the moonlit construction quarry to settle old scores.",
        "Inspect his blueprints to verify if he is still using the load-bearing formula you co-created."
      ],
      "gear": [
        {
          "name": "Dagger",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Mask",
          "type": "misc"
        }
      ],
      "spells": [
        "Charm Person"
      ],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "At the masquerade ball, your sworn enemy suddenly pulls you behind a heavy velvet curtain, their breath catching as their eyes lock onto yours."
    },
    {
      "premise": "The arrogant duke offers a contract marriage to save your family's estate, but his cold demeanor slips when he sees you in your wedding attire."
    },
    {
      "premise": "You are caught sneaking out of the royal gardens at midnight, right into the arms of the notoriously rebellious prince."
    },
    {
      "premise": "The tension between you and the rival academic at the royal academy reaches a boiling point during a heated debate over ancient magic."
    },
    {
      "premise": "You accidentally spill wine on the gown of the high society darling, but her brooding, protective older brother steps in with a surprising proposition."
    },
    {
      "premise": "A scandalous anonymous letter circulating the court reveals a secret you thought only you and your forbidden lover knew."
    },
    {
      "premise": "Forced to share the only remaining room in the roadside inn, the stoic knight insists on sleeping on the floor to protect your honor."
    },
    {
      "premise": "The crown prince announces he will choose his bride at the upcoming gala, and his intense gaze has been fixed on you all evening."
    },
    {
      "premise": "You discover the injured rebel leader hiding in your family's barn, and tending to his wounds sparks an undeniable, dangerous chemistry."
    },
    {
      "premise": "The ice-cold CEO of the magical conglomerate demands you act as his fake fiancé for the season to appease his demanding family."
    },
    {
      "premise": "A passionate, rain-soaked argument in the courtyard ends abruptly when they grab your face and silence you with a kiss."
    },
    {
      "premise": "You are assigned to tutor the notorious bad boy of the magical academy, only to discover a vulnerable, fiercely protective side to him."
    },
    {
      "premise": "The childhood friend who broke your heart returns from a decade-long war, hardened, decorated, and determined to win you back."
    },
    {
      "premise": "A misunderstanding at the high-society banquet leaves you humiliated, until the most powerful noble in the room offers you his arm."
    },
    {
      "premise": "You brush hands with the mysterious stranger while reaching for the same grimoire in the restricted section of the library."
    },
    {
      "premise": "The arranged marriage was supposed to be strictly business, but the way they defend you against court gossip suggests otherwise."
    },
    {
      "premise": "A forbidden romance blooms between you and the vampire lord sworn to destroy your ancestral bloodline."
    },
    {
      "premise": "You slip away from the stifling ballroom to the balcony, only to find the brooding, outcast lord already there, smoking in the dark."
    },
    {
      "premise": "The intense rivalry between your two magical houses is complicated by the undeniable electricity whenever you duel the heir."
    },
    {
      "premise": "They show up at your door in the middle of the night, bleeding and desperate, admitting you are the only one they trust."
    }
  ],
  "procedural": {
    "titles": [
      "The Venetian Masquerade & Secret Vows: Chapter I",
      "The Duke's Hidden Betrothal: Chapter I",
      "Waltz of the Star-Crossed Dynasties: Chapter I",
      "The Masque of Golden Lilies: Chapter I",
      "Embers of the Solstice Ball: Chapter I"
    ],
    "firstNames": [
      "Aurelia",
      "Julian",
      "Seraphina",
      "Dante",
      "Genevieve",
      "Lucian",
      "Rosalind",
      "Darian"
    ],
    "lastNames": [
      "Rose",
      "De La Tour",
      "Valmont",
      "Castiglione",
      "Montague",
      "Ravencroft",
      "St. Clair"
    ],
    "roles": [
      "Court Bard",
      "Masquerade Diplomat",
      "Noble Scion",
      "Secret Envoy",
      "Royal Confidante"
    ],
    "origins": [
      "Half-Elf Noble",
      "Human Highborn",
      "Tiefling Aristocrat",
      "Elven Emissary"
    ],
    "physicalTraits": [
      "Graceful posture, flowing silk velvet dress/doublet in midnight blue, silver domino mask concealing emerald eyes."
    ],
    "hooks": [
      {
        "hook": "Venetian gondolas glide along the Grand Canal. You hold an engraved invitation to the Palais de L'Amour.",
        "actions": [
          "Present invite",
          "Mingle",
          "Terrace walk"
        ],
        "gear": [
          {
            "name": "Dagger",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Mask",
            "type": "misc"
          }
        ],
        "spells": [
          "Charm Person"
        ],
        "hp": 10
      },
      {
        "hook": "The Duke’s ball is in full swing. You spot your rival dancing with the person you’re meant to protect.",
        "actions": [
          "Cut in",
          "Observe from the balcony",
          "Check for spies"
        ],
        "gear": [
          {
            "name": "Fan",
            "type": "misc",
            "isEquipped": true
          }
        ],
        "spells": [
          "Disguise Self"
        ],
        "hp": 11
      },
      {
        "hook": "You wait in the moonlit rose garden for your secret correspondent. A letter is tucked inside your silk bodice.",
        "actions": [
          "Wait for signal",
          "Hide message",
          "Check shadows"
        ],
        "gear": [
          {
            "name": "Signet Ring",
            "type": "relic",
            "isEquipped": true
          }
        ],
        "spells": [
          "Guidance"
        ],
        "hp": 12
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Engraved Silver Compact",
      "type": "relic",
      "quantity": 1,
      "isEquipped": false,
      "description": "A keepsake whose inscription you cannot quite remember."
    },
    {
      "name": "Elegant Evening Attire",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Hand-written Letter",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "A waltz drifts faintly from the ballroom below.",
    "The candle between you trembles in a draft no one can feel.",
    "A servant passes silently outside, glancing at neither of you.",
    "Moonlight shifts across the parquet floor as a cloud thins."
  ]
} satisfies CategoryContent;
