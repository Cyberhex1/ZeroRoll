import type { CategoryContent } from '../types';

// Short Drama. Openers, tropes and media are checked by scripts/validate-content.ts.
export const tiktokDrama = {
  "card": {
    "name": "Short Drama",
    "tagline": "Secret Heiresses, Contract Marriages & the Perfect Comeback",
    "description": "High-tension viral drama inspired by ReelShot, DramaBox, GoodNovel, ActDrama and PrimeDrama: underestimated heroes who are mocked, dismissed and thrown out, until the right moment comes to show everyone who they really are.",
    "iconName": "Clapperboard",
    "gradient": "from-pink-600/30 via-purple-900/40 to-slate-950",
    "accentColor": "#f43f5e",
    "bgTheme": "cozy",
    "defaultCharacter": {
      "name": "Sienna Hartley",
      "roleClass": "Hotel Front Desk Clerk",
      "raceOrigin": "Old-money family",
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
          "name": "Grandmother's Signet Ring (kept out of sight)",
          "type": "relic",
          "quantity": 1
        },
        {
          "id": "tk2",
          "name": "Grand Mirage Staff ID Lanyard",
          "type": "misc",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "tk3",
          "name": "Phone with a Private Bank App",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "Working the front desk under her mother's maiden name, keeping a family secret nobody at work suspects."
    },
    "samplePrompts": [
      "I start my shift at the front desk and check today's VIP arrivals.",
      "I ask the head chef what the events manager has planned for tonight.",
      "I keep my head down and do the job nobody else wants."
    ]
  },
  "profile": {
    "seedSource": "GoodNovel, ReelShot, DramaBox, ActDrama & PrimeDrama Top Tropes",
    "pattern": {
      "hero": "Someone underestimated, like a new hire, a quiet spouse, a waitress or a returning daughter, with a hidden status, skill or past nobody around them knows.",
      "start": "A normal day where the slights pile up: mocked, dismissed, made to serve.",
      "turn": "The humiliation escalates in public until it breaks: fired, dumped, accused, thrown out.",
      "payoff": "The reveal lands at the right moment, and the people who mocked them have to face it. The secret stays hidden until then."
    },
    "voice": "Snappy, high-tension, dramatic, emotionally charged. Balances quiet, supreme inner composure against the blatant arrogance and condescension of high-society rivals.",
    "atmosphere": "Glittering five-star hotel ballrooms, gilded chandelier atriums, rain-slick black executive sedans, quiet luxury concealed beneath simple uniforms, antique heirloom jewelry tucked in tote bags.",
    "sceneStructure": "1. The hero's ordinary job or family life, in plain clothes -> 2. A slight from a snob, a boss, an in-law or an ex -> 3. A small private sign of what they could do if they chose to -> 4. A choice: endure it, push back, or keep the secret one more day.",
    "storyBeats": "Built for a satisfying reveal: slights pile up in public, the humiliation escalates until it breaks (fired, dumped, accused, thrown out), and only then does the hidden status, skill or past come out, at the right moment, in front of the people who mocked them.",
    "characterDynamics": "Underestimated new hires, quiet spouses, waitresses, interns and returning daughters; snobbish in-laws, arrogant managers, scheming step-siblings and exes; one or two loyal friends who see the hero clearly.",
    "encounterPatterns": "Being sent for coffee, seated at the far end of the table, blamed for someone else's mistake, mocked for cheap clothes; small private moments where the hero's real skill or standing shows.",
    "sensoryMotifs": [
      "Gilded crystal chandeliers reflecting off polished marble floors",
      "The buzz of a phone the hero chooses not to answer in front of everyone",
      "The smooth, cold weight of a family crest signet ring hidden in a pocket",
      "The sharp click of designer high heels and haughty laughter at the VIP reception"
    ],
    "avoid": "Medieval fantasy magic, archaic high-fantasy speech, slow meandering exposition, passive protagonist submission without internal leverage, revealing the hero's secret in the premise or the first chapters, starting at the reveal or the slap.",
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
      "premise": "Three years ago you left your fiancé without a word, and everyone in high society still says you ran off with his money. You know his stepmother stopped every letter and transfer you sent, but you can't prove it yet. Tonight you're at his charity auction in a borrowed dress, bidding on your mother's necklace, and he has just walked in.",
      "hero": {
        "name": "Julian Mercer",
        "role": "Former Fiancée",
        "origin": "Old-money family"
      },
      "actions": [
        "Raise your auction paddle to outbid the stepmother on the heirloom necklace.",
        "Catch your ex-fiancé's eye across the chandelier ballroom and signal for a private word.",
        "Show the original postal receipts and stamped carbon copies to his personal secretary."
      ],
      "gear": [
        {
          "name": "Borrowed Evening Dress",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Auction Paddle",
          "type": "misc"
        },
        {
          "name": "Copies of Your Old Letters",
          "type": "scroll"
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
          "name": "Borrowed Wedding Gown",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Your Sister's Note",
          "type": "scroll"
        },
        {
          "name": "Phone",
          "type": "misc"
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
        "origin": "Self-made city family"
      },
      "actions": [
        "Let him present your pitch to the boardroom, then ask the technical questions only the author knows.",
        "Pull out your personal platinum executive keycard and unlock the Chairman suite door.",
        "Send a discreet memo to the chief auditor to freeze the branch manager's corporate accounts."
      ],
      "gear": [
        {
          "name": "Company Ownership Papers (locked away)",
          "type": "scroll"
        },
        {
          "name": "Junior Staff ID",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Notebook",
          "type": "misc"
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
      "premise": "You have worked the front desk at the Grand Mirage for two years under your mother's maiden name, and the new events manager has decided you are the one who fetches her coffee, carries her bags and takes the blame."
    },
    {
      "premise": "Your husband's family calls you \"the country girl\" at every Sunday lunch, and this week your mother-in-law started leaving a divorce lawyer's card on the hall table."
    },
    {
      "premise": "You are the quiet intern in the design department, and the creative director keeps presenting your sketches as his own while telling everyone you're only there as a favor."
    },
    {
      "premise": "Your fiancé's sister booked the engagement dinner at the most expensive restaurant in the city, and she keeps asking, sweetly, whether you'll manage your share of the bill."
    },
    {
      "premise": "You moved back to your hometown to look after your father, and your old classmates at the reunion want to know why the girl voted most likely to succeed is waiting tables."
    },
    {
      "premise": "You are the new cleaner on the executive floor, and the finance director's assistant makes you redo the boardroom three times a night while the others watch."
    },
    {
      "premise": "You have always been the plain one in a family of stars, and your stepsister has invited half the city to hear you play piano at her birthday, a piece she knows you haven't touched in years."
    },
    {
      "premise": "You joined the bottom of the sales team last week, and your team lead handed you the oldest, angriest client list \"to see how long you last.\""
    },
    {
      "premise": "Your in-laws gave you the smallest room in the family house and a list of chores, and your husband says it's only until his mother calms down."
    },
    {
      "premise": "You run a tiny repair shop under the railway arch, and the property developer's son keeps dropping by to tell you the rent is about to triple."
    },
    {
      "premise": "You are the substitute teacher the rich parents have decided to get fired, and the head of the parents' committee has started recording your lessons."
    },
    {
      "premise": "You agreed to a quiet contract marriage with a cold CEO, and his family makes it clear at every dinner that you are temporary."
    },
    {
      "premise": "You play piano in the hotel lounge on the night shift, and the owner's daughter has started requesting songs just to send them back."
    },
    {
      "premise": "Your ex-fiancé's new partner booked your small catering company for their engagement party, and the deposit came with a list of demands built for you to fail."
    },
    {
      "premise": "You are the only woman on the factory's maintenance crew, and the new supervisor keeps giving you the jobs that make you late for the safety inspection."
    },
    {
      "premise": "You came home after seven years abroad, and your relatives have already decided you came back broke and are dividing your grandmother's house without you."
    },
    {
      "premise": "You are the junior translator at the embassy, and the deputy ambassador keeps sending you out for sandwiches during the meetings held in your languages."
    },
    {
      "premise": "Your boyfriend's friends call you his \"charity project,\" and tonight they are hosting a wine tasting where they plan to make you name every bottle."
    },
    {
      "premise": "You were adopted into the Han family as a child, and now that their birth daughter has come home, the household staff have started serving you last."
    },
    {
      "premise": "You work weekends at a luxury boutique, and the regular who mocks your shoes has just asked your manager to fire you before her next visit."
    }
  ],
  "procedural": {
    "titles": [
      "The Front Desk Heiress: Chapter I",
      "Three Years Under Another Name: Chapter I",
      "The Quiet Wife at Sunday Lunch: Chapter I",
      "The Intern Nobody Noticed: Chapter I",
      "The Daughter Who Came Home: Chapter I"
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
      "Lau",
      "Kwon",
      "DuPont",
      "Rothschild",
      "Ashworth",
      "Fairfax",
      "Montgomery"
    ],
    "roles": [
      "Hotel Front Desk Clerk",
      "Junior Copywriter",
      "Quiet Daughter-in-law",
      "Restaurant Server",
      "Design Intern"
    ],
    "origins": [
      "Old-money family",
      "Small-town family",
      "Shipping-dynasty family"
    ],
    "physicalTraits": [
      "Dressed in simple hotel staff attire but with impeccable regal posture and piercing sapphire eyes, carrying an antique heirloom ring hidden inside a tote bag."
    ],
    "hooks": [
      {
        "hook": "Morning shift at the Grand Mirage front desk. The events manager has already sent you for coffee twice, and she wants the ballroom set by noon with half the staff.",
        "actions": [
          "Start setting the ballroom",
          "Ask the head chef for help",
          "Bring her the coffee and say nothing"
        ],
        "gear": [
          {
            "name": "Staff ID Lanyard",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Grandmother's Signet Ring",
            "type": "relic"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "Sunday lunch with your husband's family. His mother has seated you at the children's table again, and his sister is asking, loudly, what you paid for your dress.",
        "actions": [
          "Smile and answer her",
          "Help in the kitchen instead",
          "Ask your husband to step outside"
        ],
        "gear": [
          {
            "name": "Wedding Ring",
            "type": "relic",
            "isEquipped": true
          },
          {
            "name": "Phone",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 11
      },
      {
        "hook": "Your first week at Vanguard Media. The branch manager has put your desk by the copier and your proposal in his own folder.",
        "actions": [
          "Ask for your proposal back",
          "Rewrite it better tonight",
          "Make friends with the copy room"
        ],
        "gear": [
          {
            "name": "Notebook",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Company Badge",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 10
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Antique Signet Ring",
      "type": "relic"
    },
    {
      "name": "Plain Work Clothes",
      "type": "armor",
      "isEquipped": true
    },
    {
      "name": "Phone",
      "type": "misc"
    }
  ],
  "ambient": [
    "A waiter pauses, then pretends not to have seen the ring on your finger.",
    "Your phone lights up with a news alert you choose not to read.",
    "A distant camera flash goes off somewhere across the banquet hall.",
    "The executive across the room glances your way twice, then looks away."
  ]
} satisfies CategoryContent;
