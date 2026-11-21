import type { CategoryContent } from '../types';

// Short Drama. Openers, tropes and media are checked by scripts/validate-content.ts.
export const tiktokDrama = {
  "card": {
    "name": "Short Drama",
    "tagline": "ReelShot, DramaBox & GoodNovel: Secret Heiress, $50B Slap & Arrogant CEOs",
    "description": "High-octane viral drama inspired by ReelShot, DramaBox, GoodNovel, ActDrama, and PrimeDrama tropes: undercover billionaires, shocking banquet reveals, public confrontations, and dramatic contract marriages.",
    "iconName": "Clapperboard",
    "gradient": "from-pink-600/30 via-purple-900/40 to-slate-950",
    "accentColor": "#f43f5e",
    "bgTheme": "cozy",
    "defaultCharacter": {
      "name": "Sienna Sterling",
      "roleClass": "Undercover Heiress",
      "raceOrigin": "Undercover Heiress",
      "level": 1,
      "hp": 10,
      "maxHp": 10,
      "armorClass": 12,
      "initiativeBonus": 2,
      "stats": {
        "str": 10,
        "dex": 14,
        "con": 12,
        "int": 15,
        "wis": 14,
        "cha": 16
      },
      "inventory": [
        {
          "id": "tk1",
          "name": "Sterling Family Crest Signet Ring (Concealed)",
          "type": "relic",
          "quantity": 1
        },
        {
          "id": "tk2",
          "name": "Grand Mirage Hotel Staff ID Lanyard",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "tk3",
          "name": "Encrypted Phone with Private Bank App",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [
        "Insightful Observation",
        "Graceful Composure",
        "Authoritative Presence"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "Completing the final day of a 3-year humble trial before stepping into the family chairman role."
    },
    "samplePrompts": [
      "I review the VIP banquet seating chart to see who is attending the evening gala.",
      "I speak with the friendly head chef in the kitchen to prepare the banquet room.",
      "I check my encrypted phone for the arrival confirmation from my family's security team."
    ]
  },
  "profile": {
    "seedSource": "GoodNovel, ReelShot, DramaBox, ActDrama & PrimeDrama Top Tropes",
    "voice": "Snappy, high-tension, dramatic, emotionally charged. Balances quiet, supreme inner composure against the blatant arrogance and condescension of high-society rivals.",
    "atmosphere": "Glittering five-star hotel ballrooms, gilded chandelier atriums, rain-slick black executive sedans, quiet luxury concealed beneath simple uniforms, antique heirloom jewelry tucked in tote bags.",
    "sceneStructure": "1. Arrival in humble attire/disguise -> 2. Confrontation with arrogant socialite, manager, or ex -> 3. Secret financial or familial asset held in reserve -> 4. Immediate high-stakes social/diplomatic choice fork.",
    "storyBeats": "Paced for thrilling momentum: begins with an arrogant slight, escalates through public friction, teases impending reveal of immense status/wealth, and delivers crisp dramatic payoffs.",
    "characterDynamics": "Undercover billionaires, secret heiresses, contract spouses, proud matriarchs, haughty socialites, loyal executive security waiting on standby.",
    "encounterPatterns": "Boutique entry denials, banquet seating challenges, snide comments from in-laws, discrete phone notifications (\"Transfer of $50B approved, Chairman\"), surprise VIP arrivals.",
    "sensoryMotifs": [
      "Gilded crystal chandeliers reflecting off polished marble floors",
      "The quiet buzz of an encrypted phone receiving a multi-billion dollar wire confirmation",
      "The smooth, cold weight of a family crest signet ring hidden in a pocket",
      "The sharp click of designer high heels and haughty laughter at the VIP reception"
    ],
    "avoid": "Medieval fantasy magic, archaic high-fantasy speech, slow meandering exposition, passive protagonist submission without internal leverage.",
    "avoidKeywords": [
      "wizard",
      "spell",
      "sword",
      "dragon",
      "sorcer*",
      "elf",
      "medieval",
      "knight"
    ]
  },
  "media": [
    {
      "title": "The Secret Heiress",
      "medium": "GoodNovel"
    },
    {
      "title": "The Billionaire's Surrogate",
      "medium": "Wattpad"
    },
    {
      "title": "The CEO's Contract Wife",
      "medium": "ReelShort"
    },
    {
      "title": "Alpha's Rejected Mate",
      "medium": "GoodNovel"
    },
    {
      "title": "My Husband's Double Life",
      "medium": "ReelShort"
    },
    {
      "title": "The $50 Billion Slap",
      "medium": "DramaBox"
    },
    {
      "title": "Married to the Enemy",
      "medium": "Wattpad"
    },
    {
      "title": "The True Daughter Returns",
      "medium": "GoodNovel"
    },
    {
      "title": "His Secret Billionaire Wife",
      "medium": "ReelShort"
    },
    {
      "title": "The Alpha's Hidden Heir",
      "medium": "GoodNovel"
    },
    {
      "title": "Divorce Me, CEO!",
      "medium": "Wattpad"
    },
    {
      "title": "Reborn as the Villainess",
      "medium": "GoodNovel"
    },
    {
      "title": "The Undercover Tycoon's Vengeance",
      "medium": "DramaBox"
    },
    {
      "title": "Pregnant with the Mafia Boss's Baby",
      "medium": "Wattpad"
    },
    {
      "title": "The CEO's Hidden Triplet Sons",
      "medium": "ReelShort"
    },
    {
      "title": "Betrayed but Rising",
      "medium": "GoodNovel"
    },
    {
      "title": "The Escort's Secret Billionaire",
      "medium": "Wattpad"
    },
    {
      "title": "Revenge of the Ex-Wife",
      "medium": "ReelShort"
    },
    {
      "title": "The Masked Heiress",
      "medium": "GoodNovel"
    },
    {
      "title": "The Billionaire's Accidental Bride",
      "medium": "DramaBox"
    }
  ],
  "openers": [
    {
      "id": "seed_sd_01",
      "title": "The Stolen Inheritance",
      "tagline": "Your grandmother's will is read today, and your brother has brought his own lawyer.",
      "premise": "Your grandmother built the Vance hotel empire from one boarding house, and this morning her will is read in the Grand Mirage boardroom. Your brother Julian arrives with a lawyer you have never met and a fresh smile, and the family attorney keeps glancing at a sealed envelope he has not opened. You are the only one who visited her every Sunday.",
      "hero": {
        "name": "Victoria Vance",
        "role": "Hotel Empire Heiress",
        "origin": "Old-money family"
      },
      "actions": [
        "Ask the family attorney what is in the sealed envelope.",
        "Find out who Julian's new lawyer has worked for.",
        "Sit beside your grandmother's assistant and listen."
      ],
      "gear": [
        {
          "name": "Grandmother's Signet Ring",
          "type": "relic",
          "isEquipped": true
        },
        {
          "name": "Grand Mirage Staff Pass",
          "type": "misc"
        },
        {
          "name": "Sunday Visit Notebook",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 1: Julian quietly moves your inheritance into his own name and turns the family against you. The unrevoked family charter is your way back.",
      "hp": 10
    },
    {
      "id": "seed_sd_02",
      "title": "The Intercepted Letters",
      "tagline": "Everyone thinks you abandoned your fiancé — someone hid every letter.",
      "premise": "Everyone in high society believes you abandoned your billionaire fiancé three years ago without a word. The truth is that his ambitious stepmother intercepted every single letter and wire transfer you sent. You have just walked into his charity auction to bid on your mother's stolen necklace.",
      "hero": {
        "name": "Julian Mercer",
        "role": "Secret Benefactor",
        "origin": "Exiled Tycoon"
      },
      "actions": [
        "Raise your auction paddle to outbid the stepmother on the heirloom necklace.",
        "Catch your ex-fiancé's eye across the chandelier ballroom and signal for a private word.",
        "Show the original postal receipts and stamped carbon copies to his personal secretary."
      ],
      "gear": [
        {
          "name": "Tablet",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Authoritative Presence"
      ],
      "hp": 11
    },
    {
      "id": "seed_sd_03",
      "title": "The Partner's Signature",
      "tagline": "Your business partner keeps asking you to sign without reading.",
      "premise": "You and your oldest friend Damon built Sterling & Pike from a garage into the city's most trusted consultancy. Lately he has been rushing contracts across your desk at midnight, a client from the port has started paying in cash, and the auditors are due in three weeks. Tonight Damon brings champagne and one more document for your signature.",
      "hero": {
        "name": "Alexander Sterling",
        "role": "Business Strategist",
        "origin": "Self-made city family"
      },
      "actions": [
        "Read the document line by line in front of him.",
        "Look up the port client's company registration.",
        "Make a private copy of every contract you signed this year."
      ],
      "gear": [
        {
          "name": "Fountain Pen",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Encrypted Laptop",
          "type": "misc"
        },
        {
          "name": "Copy of the Partnership Deed",
          "type": "relic"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: Damon frames you for the fraud and you lose your credentials. Years later he comes back, begging for your help.",
      "hp": 12
    },
    {
      "id": "seed_sd_04",
      "title": "The Contract Marriage",
      "tagline": "Three years married to a stranger, on paper only. His family has other plans.",
      "premise": "Today you sign a three-year contract to marry Adrian Lowe, a reclusive CEO who needs a wife to keep his scheming board at bay. His mother calls you a gold digger before the ink is dry, and his cousin is already counting the days. Nobody in the room knows that the offshore trust funding Adrian's company quietly belongs to you.",
      "hero": {
        "name": "Serena DuPont",
        "role": "Contract Heiress",
        "origin": "Quiet old-money family"
      },
      "actions": [
        "Read the contract's exit clause twice before you sign.",
        "Ask Adrian why he chose you.",
        "Smile at his mother and ask about her charity board."
      ],
      "gear": [
        {
          "name": "Marriage Contract",
          "type": "relic"
        },
        {
          "name": "Wedding Ring",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Trust Account Card",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "long_road",
      "turningPoint": "Final chapter: on the contract's last day his family tries to throw you out penniless, and your ownership of the trust comes out.",
      "hp": 10
    },
    {
      "id": "seed_sd_05",
      "title": "The Substitute Bride",
      "tagline": "Forced to take your sister's place at the altar of the ruthless billionaire.",
      "premise": "When your favored twin sister fled town to avoid marrying the scarred and ruthless CEO Damien Cross, your adoptive parents forced you into the bridal gown. As the wedding bells toll, you stand at the cathedral altar, locking eyes with a man who already knows you are the wrong daughter.",
      "hero": {
        "name": "Chloe Sinclair",
        "role": "Substitute Bride",
        "origin": "Secret dynasty bloodline"
      },
      "actions": [
        "Whisper the truth to Damien before saying the vows and propose a secret alliance.",
        "Maintain your composure and proceed with the ceremony while observing his bodyguards.",
        "Turn toward your adoptive parents and expose their debt scheme in front of the congregation."
      ],
      "gear": [
        {
          "name": "Tablet",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [
        "Authoritative Presence"
      ],
      "hp": 11
    },
    {
      "id": "seed_sd_06",
      "title": "The Secret Patent",
      "tagline": "The board is sidelining you weeks before the launch you built.",
      "premise": "Your encryption engine is the heart of NovaCore's flagship launch, and the patent is registered to you personally because the founders once insisted. Now the new CEO has moved your team to a basement floor, cut you from the launch rehearsals and started calling your work legacy. The board meets Friday to review your contract.",
      "hero": {
        "name": "Marcus Fairfax",
        "role": "Lead Architect",
        "origin": "Silicon Valley new money"
      },
      "actions": [
        "Ask the founders why they stopped answering your messages.",
        "Check who changed the launch rehearsal schedule.",
        "Review your patent filing with your own lawyer."
      ],
      "gear": [
        {
          "name": "Personal Patent Filing",
          "type": "relic"
        },
        {
          "name": "Biometric Access Badge",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Packed Desk Box",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: the board fires you for failure, and their launch crashes because the key is tied to your biometric signature.",
      "hp": 12
    },
    {
      "id": "seed_sd_07",
      "title": "The Barista Test",
      "tagline": "Three years behind an espresso counter, and nobody may know who you are.",
      "premise": "Your grandfather's will has one condition: work three years at the Grand Mirage espresso counter under a false name before you inherit anything. Today is your first shift. Within an hour, your ex-fiancé's family sits at your counter, mocks your apron and doesn't recognize you.",
      "hero": {
        "name": "Sienna Sterling",
        "role": "Undercover Heiress",
        "origin": "Billionaire family"
      },
      "actions": [
        "Serve them flawlessly and say nothing.",
        "Ask your new manager which regulars to watch.",
        "Write down every name at their table for later."
      ],
      "gear": [
        {
          "name": "Barista Apron and Name Tag",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Grandfather's Sealed Letter",
          "type": "relic"
        },
        {
          "name": "Notebook of Names",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "hidden_return",
      "turningPoint": "Final chapter: three years in, who you really are comes out in front of everyone who mocked you.",
      "hp": 10
    },
    {
      "id": "seed_sd_08",
      "title": "The Missing Brooch",
      "tagline": "Your mother's heirloom brooch vanishes the week your stepsister moves in.",
      "premise": "Your father has just remarried, and your stepmother and stepsister have moved into the Romanov estate with twelve suitcases and a lot of opinions. On the night of the engagement dinner, your late mother's heirloom brooch disappears from the jewelry safe, and only three people know the combination. Your stepsister is already asking where you were all evening.",
      "hero": {
        "name": "Elena Romanov",
        "role": "Romanov Estate Daughter",
        "origin": "Landed gentry family"
      },
      "actions": [
        "Check the jewelry safe for signs of tampering.",
        "Ask the butler who went upstairs during dinner.",
        "Tell your father the truth before your stepsister reaches him."
      ],
      "gear": [
        {
          "name": "Mother's Photograph Locket",
          "type": "relic",
          "isEquipped": true
        },
        {
          "name": "Phone with Dinner Photos",
          "type": "misc"
        },
        {
          "name": "Jewelry Safe Code Card",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "before",
      "turningPoint": "Chapter 1: you are framed for stealing the brooch and thrown out into the winter rain with ten dollars. The return comes years later.",
      "hp": 11
    },
    {
      "id": "seed_sd_09",
      "title": "The False Paternity Trap",
      "tagline": "Your mother-in-law has ordered a DNA test on your newborn.",
      "premise": "Your son is two weeks old, and the Zhao shipping dynasty has finally welcomed you to the family table. Then your mother-in-law announces that the patriarch wants a routine DNA test, done by her own private clinic. Your husband shrugs it off, but the nurse who took the sample would not meet your eyes.",
      "hero": {
        "name": "Vivian Zhao",
        "role": "Dynasty Daughter-in-law",
        "origin": "Shipping-dynasty family"
      },
      "actions": [
        "Ask the clinic for the sample's chain of custody.",
        "Request a second test through the state lab.",
        "Talk to the nurse alone after her shift."
      ],
      "gear": [
        {
          "name": "Hospital Birth Records",
          "type": "relic"
        },
        {
          "name": "Wedding Ring",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Baby Monitor",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: the forged test brands your son illegitimate and you are expelled from the dynasty. The true results surface only at the end.",
      "hp": 12
    },
    {
      "id": "seed_sd_10",
      "title": "The Undercover Chairman",
      "tagline": "Inspecting your newly acquired conglomerate as an entry-level intern.",
      "premise": "Having quietly purchased 60% of the bankrupt Vanguard Media Group, you disguise yourself as an entry-level copywriter on day one. Within ten minutes, the arrogant branch manager steals your proposal, takes credit in the executive elevator, and threatens to fire you.",
      "hero": {
        "name": "Sebastian Cole",
        "role": "Secret Chairman",
        "origin": "Vanguard Owner"
      },
      "actions": [
        "Let him present your pitch to the boardroom, then ask the technical questions only the author knows.",
        "Pull out your personal platinum executive keycard and unlock the Chairman suite door.",
        "Send a discreet memo to the chief auditor to freeze the branch manager's corporate accounts."
      ],
      "gear": [
        {
          "name": "Signet Ring",
          "type": "relic",
          "isEquipped": true
        },
        {
          "name": "ID",
          "type": "armor"
        }
      ],
      "spells": [
        "Insightful Observation"
      ],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "The billionaire CEO throws the divorce contract on the table, unaware that the \"useless\" wife he's discarding is the hidden founder of the rival mega-corporation."
    },
    {
      "premise": "The arrogant heiress slaps you across the face at the luxury banquet, just as the doors open and your real family—the wealthiest dynasty in the country—arrives."
    },
    {
      "premise": "You sign the contract marriage agreement with the cold, calculating mafia boss, strictly for business, but his protective fury when a rival threatens you suggests otherwise."
    },
    {
      "premise": "The alpha of the pack rejects you for a more powerful mate, completely oblivious to the fact that you possess a rare, ancient wolf bloodline."
    },
    {
      "premise": "Your cheating husband brings his mistress to your supposedly humble apartment, only to discover you own the entire luxury building."
    },
    {
      "premise": "You return to the high-society gala five years after being banished in disgrace, stunning the crowd as you enter on the arm of the city's most feared tycoon."
    },
    {
      "premise": "The spoiled true daughter returns to claim her place, attempting to frame you for theft, but the evidence you calmly present destroys her reputation instantly."
    },
    {
      "premise": "The cold CEO refuses to acknowledge your presence, until he accidentally discovers you are the mysterious elite hacker he's been desperately trying to hire."
    },
    {
      "premise": "You are forced to attend the wedding of your ex-fiancé, but you arrive dripping in diamonds, accompanied by a billionaire who publicly declares his obsession with you."
    },
    {
      "premise": "The scheming mother-in-law attempts to bribe you to leave her son, and you laugh, sliding a check for ten times the amount across the table to buy her silence."
    },
    {
      "premise": "You conceal your pregnancy and flee from the possessive alpha, only to bump into him three years later with a child who possesses his exact golden eyes."
    },
    {
      "premise": "The arrogant young master demands you apologize on your knees, just as his own grandfather rushes in and bows respectfully to you."
    },
    {
      "premise": "You endure three years of humiliation as the \"trash\" son-in-law, waiting for the exact moment the restriction lifts on your fifty-billion-dollar trust fund."
    },
    {
      "premise": "The villainous stepsister tries to ruin your fashion show by destroying the lead dress, forcing you to step onto the runway in a masterpiece you designed overnight."
    },
    {
      "premise": "A misunderstanding leads the ruthless billionaire to believe you are a spy, trapping you in a tense, claustrophobic game of cat-and-mouse in his penthouse."
    },
    {
      "premise": "You wake up reincarnated as the doomed villainess of a romance novel, and you immediately resolve to avoid the male lead—which only makes him obsessed with you."
    },
    {
      "premise": "The paparazzi leak a scandalous photo of you with the notoriously private billionaire, forcing you into a fake engagement to protect both your reputations."
    },
    {
      "premise": "The rival CEO attempts a hostile takeover of your supposedly struggling company, only to realize you laid a financial trap that bankrupts him instead."
    },
    {
      "premise": "Your supposedly poor, ordinary husband casually makes a phone call that grounds a fleet of private jets, revealing his true identity to your stunned family."
    },
    {
      "premise": "The grand banquet falls silent as you reveal the DNA test results, proving the pampered heir is an imposter and you are the true ruler of the estate."
    }
  ],
  "procedural": {
    "titles": [
      "The Secret Heiress's 3-Year Test: Chapter I",
      "The $50 Billion Signet Ring: Chapter I",
      "Undercover Chairman's Morning Shift: Chapter I",
      "The Grand Mirage Hotel Gala: Chapter I",
      "The Billionaire's Silent Return: Chapter I"
    ],
    "firstNames": [
      "Victoria",
      "Alexander",
      "Chloe",
      "Sebastian",
      "Serena",
      "Lucas",
      "Julian",
      "Vivian"
    ],
    "lastNames": [
      "Sterling",
      "Vance",
      "DuPont",
      "Rothschild",
      "Sinclair",
      "Fairfax",
      "Montgomery"
    ],
    "roles": [
      "Undercover Heiress",
      "Disguised Chairman",
      "Corporate Strategist",
      "Secret Tycoon",
      "Executive Envoy"
    ],
    "origins": [
      "Billionaire Heiress",
      "Disguised Tycoon",
      "Executive Sovereign"
    ],
    "physicalTraits": [
      "Dressed in simple hotel staff attire but with impeccable regal posture and piercing sapphire eyes, carrying an antique heirloom ring hidden inside a tote bag."
    ],
    "hooks": [
      {
        "hook": "Morning at the Grand Mirage. You have your grandmother’s signet ring in your tote.",
        "actions": [
          "Check seating",
          "Talk to chef",
          "Check phone"
        ],
        "gear": [
          {
            "name": "Signet Ring",
            "type": "relic",
            "isEquipped": true
          },
          {
            "name": "ID",
            "type": "armor"
          }
        ],
        "spells": [
          "Insightful Observation"
        ],
        "hp": 10
      },
      {
        "hook": "The $50B deal is today. You wear a cheap suit, but you hold the power.",
        "actions": [
          "Review contract",
          "Scan guests",
          "Check accounts"
        ],
        "gear": [
          {
            "name": "Tablet",
            "type": "misc",
            "isEquipped": true
          }
        ],
        "spells": [
          "Authoritative Presence"
        ],
        "hp": 11
      },
      {
        "hook": "The gala host just accused you of being a fraud. Everyone is watching.",
        "actions": [
          "Show ring",
          "Laugh",
          "Walk away"
        ],
        "gear": [
          {
            "name": "Ring",
            "type": "relic",
            "isEquipped": true
          }
        ],
        "spells": [
          "Graceful Composure"
        ],
        "hp": 12
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Antique Signet Ring",
      "type": "relic",
      "quantity": 1,
      "isEquipped": false,
      "description": "Hidden inside your jacket pocket. Bears an unfamiliar crest."
    },
    {
      "name": "Impeccably Tailored Plain Suit",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Encrypted Smartphone",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "A waiter pauses, then pretends not to have seen the ring on your finger.",
    "Your phone lights up with a news alert you choose not to read.",
    "A distant camera flash goes off somewhere across the banquet hall.",
    "The executive across the room glances your way twice, then looks away."
  ]
} satisfies CategoryContent;
