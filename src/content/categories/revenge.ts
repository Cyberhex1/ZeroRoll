import type { CategoryContent } from '../types';

// Revenge. Openers, tropes and media are checked by scripts/validate-content.ts.
export const revenge = {
  "card": {
    "name": "Revenge",
    "tagline": "GoodNovel / PrimeDrama Vendettas & The 5-Betrayer Hitlist",
    "description": "Inspired by anti-hero vengeance sagas: the 5-traitor hit list, returning disgraced dragon lords, dismantling corrupt syndicate empires, and cold, calculated retribution.",
    "iconName": "Flame",
    "gradient": "from-orange-700/30 via-red-950 to-slate-950",
    "accentColor": "#f97316",
    "bgTheme": "dungeon",
    "defaultCharacter": {
      "name": "Kaelen Thorne",
      "roleClass": "Shadow Avenger",
      "raceOrigin": "Tiefling",
      "level": 1,
      "hp": 12,
      "maxHp": 12,
      "armorClass": 14,
      "initiativeBonus": 3,
      "stats": {
        "str": 14,
        "dex": 16,
        "con": 14,
        "int": 12,
        "wis": 12,
        "cha": 10
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Concealed Shadow Daggers",
          "type": "weapon",
          "quantity": 2,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Reinforced Leather Trench Coat",
          "type": "armor",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i3",
          "name": "Untouched List of the Five Betrayers",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [
        "Hunter's Mark",
        "Pass Without Trace",
        "Thaumaturgy"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A disciplined avenger returning to the city to methodically dismantle the corrupt syndicate."
    },
    "samplePrompts": [
      "I cross the station plaza to meet my informant Jax at the corner diner.",
      "I check my concealed blades and survey the platform for syndicate watchers with a Perception check.",
      "I review my map of the city's five merchant districts to plan my route."
    ]
  },
  "profile": {
    "seedSource": "GoodNovel, DramaBox & PrimeDrama Anti-Hero Sagas",
    "voice": "Cold, calculating, methodical, noir-tinted prose with restrained fury. Observant and deliberate, emphasizing patience over rash anger.",
    "atmosphere": "Rain-slicked cobblestones, midnight locomotive platforms, flickering yellow streetlamps in smoke-filled alleys, quiet corner diners, unrolled parchment hit-lists.",
    "sceneStructure": "1. Return from exile into enemy territory -> 2. Surveillance & environmental reconnaissance -> 3. Contact with underground informant -> 4. Assessing the first corrupt target on the ledger.",
    "storyBeats": "Strategic patience: establishing the list of betrayers, gathering hard intel, exposing vulnerabilities, and executing calculated counter-moves.",
    "characterDynamics": "Exiled avengers, corrupt syndicate barons, nervous informants, crooked city officials, loyal shadow allies.",
    "encounterPatterns": "Toll gate shakedowns, back-alley informant drop-offs, shadow surveillance, testing blade edges, deciphering syndicate ledgers.",
    "sensoryMotifs": [
      "Steam hissing from the midnight train onto rain-soaked iron tracks",
      "The crisp scrape of a fountain pen crossing a name off an aged parchment ledger",
      "Yellow streetlamp glow shimmering across wet pavement and dark trench coats",
      "The cold balance of a concealed blade tested against a gloved palm"
    ],
    "avoid": "Mindless chaotic brawling, slapstick humor, unearned sentimental mercy, loud boastful villain speeches without tactical substance.",
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
        "role": "Shadow Avenger",
        "origin": "Street-raised human"
      },
      "actions": [
        "Show the anonymous warning to the banquet's head steward.",
        "Check the wine casks in the cellar before service.",
        "Shadow the magistrate as he arrives at the council hall."
      ],
      "gear": [
        {
          "name": "Paired Daggers",
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
          "name": "Dark Servant's Livery",
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
        "role": "Vengeful Rogue",
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
        "role": "Farm-raised Swordsman",
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
        "role": "Guerilla Scout",
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
        "role": "Merchant House Infiltrator",
        "origin": "River-merchant family"
      },
      "actions": [
        "Compare the cartel's notes with a genuine one under a lens.",
        "Ask a rival house why it turned the cartel down.",
        "Beg your father to delay the signing by one week."
      ],
      "gear": [
        {
          "name": "Sleeve Dagger",
          "type": "weapon",
          "isEquipped": true
        },
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
        "role": "Syndicate Infiltrator",
        "origin": "Harbor-born human"
      },
      "actions": [
        "Trace the three buyer names through the harbor registry.",
        "Buy the dock clerk a drink and ask what he saw.",
        "Ask Merrin directly why your family's debts are moving."
      ],
      "gear": [
        {
          "name": "Concealed Stiletto",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Copy of Merrin's Ledger",
          "type": "scroll"
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
          "name": "Weighted Cane",
          "type": "weapon",
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
      "premise": "You stand over the first betrayer on your list. The rain washes the blood from your blade as they beg for the mercy they denied your family."
    },
    {
      "premise": "The corrupt baron toasts to his success at the banquet, unaware that you have infiltrated the kitchens and poisoned the wine."
    },
    {
      "premise": "You strike a match and drop it onto the trail of oil leading to the syndicate's warehouse, watching your past go up in flames."
    },
    {
      "premise": "The mob boss realizes too late that his new, highly trusted bodyguard is the child of the rival leader he assassinated ten years ago."
    },
    {
      "premise": "You systematically dismantle the corrupt guard captain's life, stripping his wealth, reputation, and allies before ever drawing a weapon."
    },
    {
      "premise": "The second name on your list runs a heavily fortified fighting arena, and the only way to reach them is to enter the tournament."
    },
    {
      "premise": "You corner the traitor in a dead-end alley. They draw their weapon, terrified, realizing you survived the ambush they orchestrated."
    },
    {
      "premise": "The explosive charge detonates, collapsing the bridge and trapping the escaping convoy of the noble who ruined your life."
    },
    {
      "premise": "You leave a single, blood-stained calling card on the pillow of the sleeping magistrate, a promise that you are coming for them next."
    },
    {
      "premise": "The assassin sent to kill you gasps for air as you turn their own weapon against them, demanding the name of their employer."
    },
    {
      "premise": "You crash the high-society gala, revealing the damning evidence that destroys the reputation of the aristocrat who framed you."
    },
    {
      "premise": "The third betrayer has sought refuge in a heavily guarded monastery, forcing you to infiltrate as a silent monk to get close."
    },
    {
      "premise": "You methodically pick off the bandit camp's sentries one by one from the shadows, leaving the leader isolated and terrified."
    },
    {
      "premise": "The corrupt judge screams as you reveal the exact ledger of bribes he took to condemn your innocent sibling to the gallows."
    },
    {
      "premise": "You confront your former mentor on the edge of the cliff, swords drawn, demanding to know why they sold out the guild."
    },
    {
      "premise": "The crime lord's heavily armored enforcer blocks your path, cracking his knuckles as you check the ammo in your hand crossbow."
    },
    {
      "premise": "You orchestrate a complex heist not to steal gold, but to plant irrefutable evidence of treason in the chambers of your enemy."
    },
    {
      "premise": "The fourth name on your list is a paranoid recluse. You bypass his intricate traps and sit waiting in the dark of his study."
    },
    {
      "premise": "You hijack the public execution of your ally, turning the tables on the executioner and inciting a riot against the corrupt lord."
    },
    {
      "premise": "The mastermind behind the conspiracy finally turns around in their high-backed chair, realizing you have slaughtered every guard outside."
    }
  ],
  "procedural": {
    "titles": [
      "The Red Vow of Iron Cross: Chapter I",
      "The Five Names of Vengeance: Chapter I",
      "Shadow of the Exiled Dragon: Chapter I",
      "The Debt of Crimson Gold: Chapter I",
      "Vendetta of the Forgotten Lord: Chapter I"
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
      "Shadow Avenger",
      "Exiled Commander",
      "Contract Hitman",
      "Disowned Scion",
      "Infiltration Hunter"
    ],
    "origins": [
      "Tiefling",
      "Human Exiled Noble",
      "Dark Elf Rogue",
      "Revenant Outcast"
    ],
    "physicalTraits": [
      "Grim determination in dark hazel eyes, long reinforced trench coat worn over dark armor, twin concealed blades resting at the wrists."
    ],
    "hooks": [
      {
        "hook": "Train steam hisses at Iron Cross Station. You have a list of five names in your pocket.",
        "actions": [
          "Meet informant",
          "Survey platform",
          "Review map"
        ],
        "gear": [
          {
            "name": "Daggers",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "List",
            "type": "relic"
          }
        ],
        "spells": [
          "Hunter's Mark"
        ],
        "hp": 12
      },
      {
        "hook": "Rain pours over the docks. The syndicate leader is departing on the midnight ship.",
        "actions": [
          "Infiltrate boat",
          "Cut lines",
          "Wait in shadow"
        ],
        "gear": [
          {
            "name": "Grapple",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Blade",
            "type": "weapon"
          }
        ],
        "spells": [
          "Pass Without Trace"
        ],
        "hp": 11
      },
      {
        "hook": "The mansion party is loud. You know the safe is behind the painting in the study.",
        "actions": [
          "Pick lock",
          "Knock out guard",
          "Find safe"
        ],
        "gear": [
          {
            "name": "Lockpicks",
            "type": "misc",
            "isEquipped": true
          }
        ],
        "spells": [
          "Thaumaturgy"
        ],
        "hp": 10
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Concealed Blade",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "Hidden along the forearm."
    },
    {
      "name": "Dark Reinforced Trench Coat",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Worn List of Names",
      "type": "relic",
      "quantity": 1
    }
  ],
  "ambient": [
    "A car passes in the alley below, slowing — then accelerating away.",
    "Your phone vibrates once with a number you do not recognize.",
    "A match flares and dies in a window three buildings over.",
    "Distant sirens count off two blocks, then fall silent."
  ]
} satisfies CategoryContent;
