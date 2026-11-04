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
      "tagline": "Your brother stole everything — today you arrive at the family gala.",
      "premise": "Your brother secretly transferred your rightful inheritance into his own name and spent three years treating you as disposable. This morning, you arrive at the Grand Mirage Hotel banquet where he plans to announce himself as chairman — unaware you hold the unrevoked family charter.",
      "hero": {
        "name": "Victoria Vance",
        "role": "Disowned Heiress",
        "origin": "Old-money family"
      },
      "actions": [
        "Present your old staff pass to slip past the VIP security turnstiles.",
        "Confront your brother in the private banquet prep room before speeches begin.",
        "Contact your grandmother's loyal attorney to confirm the charter's legal hold."
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
      "title": "The Ruined Reputation",
      "tagline": "The rival who destroyed your career is now begging for your help.",
      "premise": "Two years ago, your corrupt business partner framed you for fraud and watched you get stripped of your credentials. This morning, he stands in the doorway of your modest repair boutique, pale and desperate, begging you to decode an encrypted ledger before the cartel arrives.",
      "hero": {
        "name": "Alexander Sterling",
        "role": "Disgraced Strategist",
        "origin": "Undercover Billionaire"
      },
      "actions": [
        "Demand he sign a written public confession before you even look at the ledger.",
        "Inspect the encrypted flash drive to see who is hunting him.",
        "Call hotel security to have him removed and alert the financial task force."
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
    },
    {
      "id": "seed_sd_04",
      "title": "The 3-Year Contract Divorce",
      "tagline": "The contract marriage ends at midnight — and his family tries to throw you out penniless.",
      "premise": "You signed a 3-year contract marriage to shield a reclusive CEO from his scheming board. Today is the final day. His arrogant family gathers in the penthouse to serve you divorce papers and offer a measly $5,000 severance, unaware that you own the offshore trust funding his entire enterprise.",
      "hero": {
        "name": "Serena DuPont",
        "role": "Contract Heiress",
        "origin": "Secret Chairwoman"
      },
      "actions": [
        "Quietly sign the divorce papers while sliding your offshore trust termination notice across the mahogany desk.",
        "Look directly at your stoic husband and demand he speak for himself.",
        "Instruct your private bodyguard to wheel in the audited financial binders."
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
      "tagline": "They fired you for incompetence — but your patent powers their entire IPO.",
      "premise": "The board voted to terminate you from your chief research post, claiming your project was a complete failure. As you pack your cardboard box, the emergency fire alarms chime: their flagship product launch just crashed because the proprietary encryption key is registered under your personal biometric signature.",
      "hero": {
        "name": "Marcus Fairfax",
        "role": "Lead Architect",
        "origin": "Silicon Valley new money"
      },
      "actions": [
        "Continue walking out the glass lobby doors while executive phones start ringing frantically.",
        "Turn back to the board room and state your new terms: 51% controlling equity.",
        "Log into your secure laptop terminal to monitor the crashing server logs."
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
    },
    {
      "id": "seed_sd_07",
      "title": "The Morning Shift Reveal",
      "tagline": "Working the hotel espresso counter when your condescending in-laws walk in.",
      "premise": "To fulfill your grandfather's final test of humility, you have worked three years as a barista at the Grand Mirage. This morning, your ex-fiancé's family enters, mocking your uniform and demanding table service — moments before a convoy of black mayoral limousines pulls up to salute you.",
      "hero": {
        "name": "Sienna Sterling",
        "role": "Undercover Heiress",
        "origin": "Billionaire family"
      },
      "actions": [
        "Serve their espressos with cold, flawless professional grace.",
        "Discreetly tap your encrypted earpiece to authorize the convoy's arrival.",
        "Hand your ex-fiancé a napkin inscribed with his father's overdue loan balance."
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
      "id": "seed_sd_08",
      "title": "The Disowned Daughter's Return",
      "tagline": "Thrown out of the family mansion in the rain — returning five years later.",
      "premise": "Five years ago, you were framed for stealing the family heirloom brooch and cast out into the winter rain with ten dollars. Today, you step out of a chauffeured Maybach at the estate gates, holding the foreclosed deed to the entire property.",
      "hero": {
        "name": "Elena Romanov",
        "role": "Avenging Heiress",
        "origin": "Landed gentry family"
      },
      "actions": [
        "Hand the foreclosure eviction notice to the stunned estate butler.",
        "Walk past the gatekeeper straight into the dining room where the family is having breakfast.",
        "Inspect the vintage brooch now worn proudly by your scheming stepsister."
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
      "id": "seed_sd_09",
      "title": "The False Paternity Trap",
      "tagline": "Falsified DNA tests stripped your child of their birthright.",
      "premise": "Four years ago, your corrupt mother-in-law forged a DNA test to brand your newborn illegitimate and expel you from the dynasty. This morning, the state forensic lab director personally delivers the unsealed original test results directly to the patriarch's hospital bedside in your presence.",
      "hero": {
        "name": "Vivian Zhao",
        "role": "Dynasty Matriarch",
        "origin": "Shipping-dynasty family"
      },
      "actions": [
        "Place the unsealed state forensic report onto the patriarch's bedside table.",
        "Block the mother-in-law from entering the private ICU suite.",
        "Demand an immediate public press conference to restore your child's legal rights."
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
