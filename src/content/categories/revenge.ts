import type { CategoryContent } from '../types';

// Revenge. Openers, tropes and media are checked by scripts/validate-content.ts.
export const revenge = {
  "card": {
    "name": "Revenge",
    "tagline": "Wronged, Written Off & Taking Back What's Yours",
    "description": "Inspired by GoodNovel and DramaBox revenge sagas: ordinary people who are trusted, overworked and overlooked, then set up and thrown out, and who use everything they knew to bring the people who wronged them down.",
    "iconName": "Flame",
    "gradient": "from-orange-700/30 via-red-950 to-slate-950",
    "accentColor": "#f97316",
    "bgTheme": "dungeon",
    "defaultCharacter": {
      "name": "Odile Marchetti",
      "roleClass": "Guild Bookkeeper",
      "raceOrigin": "Harbor-born human",
      "level": 1,
      "hp": 10,
      "maxHp": 10,
      "armorClass": 11,
      "initiativeBonus": 1,
      "stats": {
        "str": 8,
        "dex": 12,
        "con": 12,
        "int": 15,
        "wis": 14,
        "cha": 13
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Guild Account Ledger",
          "type": "misc",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Brass Counting-House Key",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "i3",
          "name": "Reading Spectacles",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "i4",
          "name": "Plain Wool Coat",
          "type": "armor",
          "quantity": 1,
          "isEquipped": true
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A trusted, overworked bookkeeper whose coworkers have started treating them as disposable."
    },
    "samplePrompts": [
      "I finish the month's accounts and check who else has been writing in my ledger.",
      "I ask the porter what the partners were arguing about this morning.",
      "I eat lunch with the one coworker who still talks to me."
    ]
  },
  "profile": {
    "seedSource": "GoodNovel, DramaBox & PrimeDrama Anti-Hero Sagas",
    "pattern": {
      "hero": "An ordinary, likeable person with a real life and something to lose: a job, a family, a partner, a place they earned. Often trusted with something (the books, the keys, a secret) and overlooked anyway.",
      "start": "Everyday life with pressure building: a coworker who resents them, a boss who piles on work, a relative who wants what they have. The premise ends on a question like \"What would you do if they turned on you?\"",
      "turn": "Over a chapter or two they are devalued and set up, then betrayed or thrown out for something they didn't do.",
      "payoff": "They use what they already had (what they know, who still trusts them, the skills they were mocked for) to take back what's theirs and bring the people who wronged them down."
    },
    "voice": "Grounded and close to the hero, with tension that builds quietly. Early chapters feel like ordinary life with something wrong at the edges; cold resolve and restrained fury come only after the wrong has landed on screen.",
    "atmosphere": "Counting houses and busy kitchens, ledger-lined offices, rain on familiar streets, the polite smiles of people who want what you have; later, back rooms, old records and quiet meetings.",
    "sceneStructure": "1. The hero's everyday work or home, and the people who rely on them -> 2. A small slight or a detail that doesn't add up -> 3. A conversation with an ally, a rival or the person they trust -> 4. A choice about how far to trust, dig or speak up.",
    "storyBeats": "A slow-building wrong, then the answer to it: an ordinary life under growing pressure, being devalued and set up, the wrong landing on screen (fired, framed, thrown out), then patient, clever payback using what the hero already knew.",
    "characterDynamics": "Trusted employees, loyal servants, family members and partners with something to lose; resentful coworkers, ambitious relatives, smiling bosses; a few people who still believe in the hero.",
    "encounterPatterns": "Extra work dropped on the desk, meetings the hero isn't invited to, ledgers that don't match, overheard conversations, quiet favors from allies, and later the records and witnesses that prove the truth.",
    "sensoryMotifs": [
      "The scratch of a pen in a ledger someone else has been writing in",
      "An office that goes quiet when you walk in",
      "Rain on the windows of a place you used to feel safe",
      "The weight of a key you were trusted with"
    ],
    "avoid": "Starting at the revenge, hit-lists, avengers back from exile, a brooding or vengeful hero before anything has happened to them, mindless brawling, slapstick, loud villain speeches without substance.",
    "avoidKeywords": [
      "slapstick",
      "clown"
    ]
  },
  "media": [
    {
      "title": "John Wick",
      "medium": "Film"
    },
    {
      "title": "Kill Bill",
      "medium": "Film"
    },
    {
      "title": "The Count of Monte Cristo",
      "medium": "Book"
    },
    {
      "title": "Oldboy",
      "medium": "Film"
    },
    {
      "title": "V for Vendetta",
      "medium": "Film/Comic"
    },
    {
      "title": "Dishonored",
      "medium": "Game"
    },
    {
      "title": "The Punisher",
      "medium": "Comics/TV"
    },
    {
      "title": "The Crow",
      "medium": "Film/Comic"
    },
    {
      "title": "Sweeney Todd",
      "medium": "Musical/Film"
    },
    {
      "title": "The Last of Us Part II",
      "medium": "Game"
    },
    {
      "title": "Taken",
      "medium": "Film"
    },
    {
      "title": "Man on Fire",
      "medium": "Film"
    },
    {
      "title": "Django Unchained",
      "medium": "Film"
    },
    {
      "title": "Peaky Blinders",
      "medium": "TV Show"
    },
    {
      "title": "The Girl with the Dragon Tattoo",
      "medium": "Book/Film"
    },
    {
      "title": "Carrie",
      "medium": "Book/Film"
    },
    {
      "title": "Revenge",
      "medium": "TV Series"
    },
    {
      "title": "Sifu",
      "medium": "Game"
    }
  ],
  "openers": [
    {
      "id": "seed_rev_01",
      "title": "The Poisoned Cup",
      "tagline": "Someone at the council banquet means your master harm, and you are his only guard.",
      "premise": "You have served Master Corvin since you were a street orphan, and tonight he finally takes his seat on the high council. He laughs off the anonymous warning slipped under his door, but you saw the city magistrate watching him across the market all week. The banquet starts at the eighth bell, and you will be standing behind his chair.",
      "hero": {
        "name": "Cassian Graves",
        "role": "Household Servant",
        "origin": "Street-raised human"
      },
      "actions": [
        "Show the anonymous warning to the banquet's head steward.",
        "Check the wine casks in the cellar before service.",
        "Shadow the magistrate as he arrives at the council hall."
      ],
      "gear": [
        {
          "name": "Carving Knife",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Anonymous Warning Note",
          "type": "scroll"
        },
        {
          "name": "Charcoal Antidote Pouch",
          "type": "potion"
        },
        {
          "name": "Servant's Livery",
          "type": "armor",
          "isEquipped": true
        }
      ],
      "spells": [],
      "shape": "before",
      "turningPoint": "Chapter 1: Master Corvin collapses from nightshade at the banquet, and you see the magistrate hide an empty vial in his sleeve.",
      "hp": 12
    },
    {
      "id": "seed_rev_02",
      "title": "The Syndicate Ledger",
      "tagline": "One job big enough to retire on, and one ledger nobody will explain.",
      "premise": "Your thieves' guild runs the docks of Saltmere on one rule: never rob the city council. Tonight the guildmaster takes a job anyway, a quiet burglary of a syndicate vault that pays enough to retire on. You have the blueprints and the crew's trust, and nobody has explained why the client wants only one blood-red ledger from inside.",
      "hero": {
        "name": "Rowan Blackwood",
        "role": "Guild Burglar",
        "origin": "Saltmere dockside human"
      },
      "actions": [
        "Ask the guildmaster who the client really is.",
        "Scout the syndicate vault's guard rotation from the rooftops.",
        "Read the job contract for the clause about the ledger."
      ],
      "gear": [
        {
          "name": "Short Blade",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Grappling Line",
          "type": "misc"
        },
        {
          "name": "Vault Blueprints",
          "type": "scroll"
        },
        {
          "name": "Set of Lockpicks",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "before",
      "turningPoint": "Chapter 2: the job is a trap. The seven officials in the ledger frame you, slaughter your guild and send you to the salt mines.",
      "hp": 11
    },
    {
      "id": "seed_rev_03",
      "title": "The Burned Homestead",
      "tagline": "Riders in skull-engraved armor are asking about your family's farm.",
      "premise": "You are sixteen, and the harvest on your family's hill farm is the best in years. This week, riders in skull-engraved armor have been buying grain in the valley and asking which farms keep their own wells. Your father says they are only mercenaries passing through, but your older sister has started sleeping with the wood axe beside her bed.",
      "hero": {
        "name": "Theron Vane",
        "role": "Farmer's Son",
        "origin": "Hill-country human"
      },
      "actions": [
        "Follow the riders back to their camp and count them.",
        "Ask your father why he sold them grain at half price.",
        "Show your sister the hiding place inside the stone grain silo."
      ],
      "gear": [
        {
          "name": "Wood Axe",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Father's Old Broadsword",
          "type": "weapon"
        },
        {
          "name": "Flint and Lantern",
          "type": "misc"
        },
        {
          "name": "Harvest Ledger",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "before",
      "turningPoint": "Chapter 1: the warlord's riders burn the homestead. You survive inside the stone grain silo, and the rest of the story is the long road back to him.",
      "hp": 10
    },
    {
      "id": "seed_rev_04",
      "title": "The False Oath",
      "tagline": "Six years at your side, and a bounty big enough to buy a knighthood.",
      "premise": "You and Brannoc have scouted the border together for six years, and you once swore a blood oath on a stone bridge to guard each other's flank. Now the crown has posted a bounty on the bandit lord you are both hunting, big enough to buy a knighthood. Brannoc has been quiet since he read the notice, and tomorrow your trail leads over the high bridge at Ashford.",
      "hero": {
        "name": "Kaelen Thorne",
        "role": "Border Scout",
        "origin": "Borderland human"
      },
      "actions": [
        "Ask Brannoc what he would do with the bounty money.",
        "Scout another ford in case the bridge is watched.",
        "Check your horse's tack yourself before you ride."
      ],
      "gear": [
        {
          "name": "Yew Longbow",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Quiver of Fletched Arrows",
          "type": "weapon"
        },
        {
          "name": "Scout's Leather Jerkin",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Royal Bounty Notice",
          "type": "scroll"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: on the Ashford bridge Brannoc cuts your horse's reins and pushes you into the river to claim the bounty alone.",
      "hp": 12
    },
    {
      "id": "seed_rev_05",
      "title": "The Inquisitor's Borrowed Letters",
      "tagline": "The grand inquisitor has been studying your handwriting.",
      "premise": "You are a knight of the royal household, trusted to carry the king's private letters. Lately the grand inquisitor has been borrowing your old correspondence for the archives, and your steward reports strangers measuring the boundaries of your family estate. The king's council meets tomorrow, and you have been asked to attend without your sword.",
      "hero": {
        "name": "Damian Cross",
        "role": "Household Knight",
        "origin": "Highborn human of the capital"
      },
      "actions": [
        "Ask the archive clerk which of your letters the inquisitor took.",
        "Send your steward to warn your family tonight.",
        "Attend the council with a blade hidden in your boot."
      ],
      "gear": [
        {
          "name": "Knight's Longsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Chainmail Hauberk",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Household Signet",
          "type": "relic"
        },
        {
          "name": "Bundle of Your Old Letters",
          "type": "scroll"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: the inquisitor produces a treason letter forged in your hand. You lose your estate and wake in Cell 4.",
      "hp": 11
    },
    {
      "id": "seed_rev_06",
      "title": "The Cartel's Generous Offer",
      "tagline": "The Goldcrest Cartel wants to lend to your family's merchant house.",
      "premise": "Your merchant house has traded spice on the river for six generations, and its ancestral signet still seals every contract. This season the Goldcrest Cartel has offered to lend against your cargoes at half the usual rate, and your father is ready to sign. Their promissory notes look perfect, which is exactly what bothers you.",
      "hero": {
        "name": "Valerie Vance",
        "role": "Merchant House Heir",
        "origin": "River-merchant family"
      },
      "actions": [
        "Compare the cartel's notes with a genuine one under a lens.",
        "Ask a rival house why it turned the cartel down.",
        "Beg your father to delay the signing by one week."
      ],
      "gear": [
        {
          "name": "Ancestral Signet Seal",
          "type": "relic"
        },
        {
          "name": "Jeweler's Lens",
          "type": "misc"
        },
        {
          "name": "Cartel Promissory Note",
          "type": "scroll"
        },
        {
          "name": "Cargo Manifests",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: the cartel's counterfeit notes bankrupt your house, and the ancestral signet disappears into their clockwork vault.",
      "hp": 10
    },
    {
      "id": "seed_rev_07",
      "title": "The Stolen Credit",
      "tagline": "Your cure for the king's plague is one night from finished, and your apprentice is too helpful.",
      "premise": "Seven years of work in your mountain distillery come down to tonight: the panacea for the king's wasting plague finishes its last distillation at dawn. Your apprentice Fennick has been unusually eager to carry messages to the capital, and a royal courier is already waiting on the road. Only the two of you know the formula.",
      "hero": {
        "name": "Orlaith Mor",
        "role": "Apothecary Master",
        "origin": "Wildwood-born human"
      },
      "actions": [
        "Copy your formula into a hidden second journal.",
        "Ask Fennick what he has been telling the royal courier.",
        "Seal the distillery door and keep the final watch yourself."
      ],
      "gear": [
        {
          "name": "Pruning Knife",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Crystal Distillation Flask",
          "type": "relic"
        },
        {
          "name": "Research Journals",
          "type": "scroll"
        },
        {
          "name": "Herbal Remedy Satchel",
          "type": "potion"
        }
      ],
      "spells": [],
      "shape": "before",
      "turningPoint": "Chapter 1: Fennick steals the crystal flask and presents your cure at court as his own, and the king makes him a baron.",
      "hp": 12
    },
    {
      "id": "seed_rev_08",
      "title": "The Blood-Stained Banner",
      "tagline": "Your captain has a new signal plan for tomorrow's battle, and nobody has seen it.",
      "premise": "Dawn at Red Ridge: your vanguard leads the charge, and the fortress gates behind you are your only retreat. Captain Holt spent last night drinking with the enemy's envoy under a flag of truce, and the horn-bearer swears the captain changed the signal plan. You carry the vanguard's banner, and the drums have started.",
      "hero": {
        "name": "Garrick Stone",
        "role": "Vanguard Veteran",
        "origin": "Frontier-born human"
      },
      "actions": [
        "Ask the horn-bearer to show you the new signal plan.",
        "Warn your sergeants to keep a second way out.",
        "Confront Captain Holt about the envoy before the charge."
      ],
      "gear": [
        {
          "name": "Iron Shortsword",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Battered Round Shield",
          "type": "armor",
          "isEquipped": true
        },
        {
          "name": "Vanguard Banner",
          "type": "relic"
        },
        {
          "name": "Signal Whistle",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "before",
      "turningPoint": "Chapter 1: Holt blows the retreat early and locks the gates, trapping the vanguard. You survive under the fallen banners.",
      "hp": 11
    },
    {
      "id": "seed_rev_09",
      "title": "The Broker's Bookkeeper",
      "tagline": "You keep the books for the broker who is quietly buying up your family's debts.",
      "premise": "You keep the books for Aldo Merrin, the most respected debt broker on the harbor, and he trusts you like a son. Lately his ledgers show your own family's loans being bought through three different names, and the only man who could explain it is a nervous dock clerk who will not meet your eyes. Merrin wants you at his side for the harbor board vote tonight.",
      "hero": {
        "name": "Sevran Locke",
        "role": "Broker's Bookkeeper",
        "origin": "Harbor-born human"
      },
      "actions": [
        "Trace the three buyer names through the harbor registry.",
        "Buy the dock clerk a drink and ask what he saw.",
        "Ask Merrin directly why your family's debts are moving."
      ],
      "gear": [
        {
          "name": "Merrin's Account Ledger",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Brass Ledger-Room Key",
          "type": "misc"
        },
        {
          "name": "Bookkeeper's Spectacles",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "long_road",
      "turningPoint": "Chapter 3: Merrin sells your family to the syndicate. The dock clerk is the last witness, and the reckoning comes at Merrin's funeral.",
      "hp": 12
    },
    {
      "id": "seed_rev_10",
      "title": "The Quarry Payroll",
      "tagline": "The foreman is skimming the quarry wages, and you are the one who noticed.",
      "premise": "You run the tally shed at the Greystone quarry, counting every cart of stone and every wage packet that goes out. For three months the numbers have not matched: the payroll courier brings less than the books claim, and men who complain get sent to the deep pit. Foreman Krell has started asking who keeps the duplicate tallies.",
      "hero": {
        "name": "Mirel Dusk",
        "role": "Quarry Tally Keeper",
        "origin": "Quarry-camp human"
      },
      "actions": [
        "Hide the duplicate tallies where Krell can't reach them.",
        "Ask the payroll courier who counts the money before you.",
        "Talk to the men who were sent to the deep pit."
      ],
      "gear": [
        {
          "name": "Tally Shed Lantern",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Duplicate Tally Book",
          "type": "relic"
        },
        {
          "name": "Tally Shed Key",
          "type": "misc"
        }
      ],
      "spells": [],
      "shape": "brewing",
      "turningPoint": "Chapter 2: Krell bribes a magistrate to convict you of his theft. The payroll proof and one witness are your way back.",
      "hp": 12
    }
  ],
  "tropes": [
    {
      "premise": "You keep the books for a guild that has started paying you less and blaming you more, and the new clerk your manager hired keeps asking for your keys."
    },
    {
      "premise": "You have cooked for Baron Aldric's household for eleven years, and his new steward has started tasting every dish before it leaves your kitchen, then writing something down."
    },
    {
      "premise": "Your older brother runs the family vineyard now that your father is ill, and lately he takes his meetings with the neighboring estate behind closed doors and stops talking when you walk in."
    },
    {
      "premise": "You are the night nurse the senior surgeon trusts with his charts, and twice this month a dosage in those charts changed after you signed them."
    },
    {
      "premise": "You trained the new hire yourself, and now she presents your reports in the Monday meeting while your manager asks why your numbers are late."
    },
    {
      "premise": "Your best friend from the orphanage just made captain of the city watch, and she has asked you to sign as witness to an arrest you did not see."
    },
    {
      "premise": "You have been the duke's scribe for nine years; this winter he began dictating his private letters to his nephew instead, and the nephew keeps asking what you remember of the old ones."
    },
    {
      "premise": "You and your husband built the bakery on Tanner Street together, and the man who visits him after closing says he is \"just an investor.\""
    },
    {
      "premise": "You are the youngest partner at the shipping firm, and the founder's son has been moving your best clients to himself one by one while smiling at you in the hallway."
    },
    {
      "premise": "The village chose you to keep the grain tally through a hard winter, and the headman's cousin has started saying at the well that your numbers don't add up."
    },
    {
      "premise": "You sing every night at the Lantern Room, and the owner's new partner has started counting the till himself and asking the band where you go after your set."
    },
    {
      "premise": "You are the household knight who holds the treasury keys, and the lord's new advisor keeps asking for a second set \"for safekeeping.\""
    },
    {
      "premise": "Your mentor at the assay office retires next month and has promised you his seat, but his favorite student has started arriving early and staying late, always near your desk."
    },
    {
      "premise": "You manage the ranch for an old widow who calls you her right hand, and her grandson has just arrived from the city with a lawyer and a lot of questions about the deeds."
    },
    {
      "premise": "You are the only engineer who understands the old pumping station, and the new director keeps telling the council it could run itself."
    },
    {
      "premise": "Your sister married into the richest family on the hill; since the wedding her letters have gotten shorter, and her in-laws want to meet you about \"the family land.\""
    },
    {
      "premise": "You have run the night desk at the Hotel Meridian for six years, and the new day manager has started writing you up for things that happened on her shift."
    },
    {
      "premise": "You are the court physician's apprentice, and the queen's ladies have started asking you, not him, for the sleeping draught he says you must never give without him."
    },
    {
      "premise": "You carry the post between the mine and the company town, and the foreman has started asking which letters you've noticed going to the newspaper."
    },
    {
      "premise": "You have captained the team for four seasons, and the coach's new favorite has started telling the owners your knee isn't what it was."
    }
  ],
  "procedural": {
    "titles": [
      "The Ledger Keeper: Chapter I",
      "The Last Honest Clerk: Chapter I",
      "Below the Salt: Chapter I",
      "The Night Desk: Chapter I",
      "What the Books Remember: Chapter I"
    ],
    "firstNames": [
      "Kaelen",
      "Vesper",
      "Marcus",
      "Damian",
      "Riven",
      "Thalia",
      "Corin",
      "Zane"
    ],
    "lastNames": [
      "Thorne",
      "Vance",
      "Grimm",
      "Blackwell",
      "Vane",
      "Rook",
      "Mordecai"
    ],
    "roles": [
      "Guild Bookkeeper",
      "Household Steward",
      "Night Desk Clerk",
      "Junior Partner",
      "Estate Manager"
    ],
    "origins": [
      "Harbor-born human",
      "Mill-town human",
      "Half-elf of the river quarter",
      "Hill-country human"
    ],
    "physicalTraits": [
      "Grim determination in dark hazel eyes, long reinforced trench coat worn over dark armor, twin concealed blades resting at the wrists."
    ],
    "hooks": [
      {
        "hook": "Rain on the counting-house windows. Your manager has left another stack of accounts on your desk with a note that says 'by morning', and the new clerk is reading over your shoulder again.",
        "actions": [
          "Start on the accounts",
          "Ask the new clerk what he needs",
          "Catch your manager before he leaves"
        ],
        "gear": [
          {
            "name": "Guild Ledger",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Brass Office Key",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "Breakfast service at the Meridian. The new day manager has written you up for a complaint from a guest you never met, and the owner wants to see you at noon.",
        "actions": [
          "Look up the guest's booking",
          "Ask the night porter what happened",
          "Go to the owner early"
        ],
        "gear": [
          {
            "name": "Front Desk Keyring",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Guest Register",
            "type": "scroll"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "Harvest week on your family's farm. Your brother has started meeting the neighbor's lawyer in town, and today he asked where Father keeps the deeds.",
        "actions": [
          "Check that the deeds are safe",
          "Ask your brother straight out",
          "Sit with your father"
        ],
        "gear": [
          {
            "name": "Pruning Knife",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Farm Account Book",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 12
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Work Ledger",
      "type": "misc",
      "isEquipped": true
    },
    {
      "name": "Brass Door Key",
      "type": "misc"
    },
    {
      "name": "Plain Wool Coat",
      "type": "armor",
      "isEquipped": true
    }
  ],
  "ambient": [
    "A door down the hall closes a little too firmly.",
    "Someone has moved the papers on your desk.",
    "Laughter in the partners' office stops as you pass.",
    "A coworker who used to wave doesn't look up."
  ]
} satisfies CategoryContent;
