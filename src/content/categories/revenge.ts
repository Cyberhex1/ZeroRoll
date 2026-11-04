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
      "tagline": "Your mentor was poisoned at the council dinner — you have the antidote vial.",
      "premise": "At the high council banquet, your revered master collapsed clutching his throat from nightshade poison. In the ensuing panic, you spotted the city magistrate slipping an empty glass vial into his velvet sleeve. You slip out into the rainy courtyard to intercept him.",
      "hero": {
        "name": "Cassian Graves",
        "role": "Shadow Avenger",
        "origin": "Exiled Blade"
      },
      "actions": [
        "Corner the magistrate near the carriage mews with your dagger drawn.",
        "Search the banquet pantry for the remaining poison bottle to secure hard evidence.",
        "Administer your universal charcoal antidote to your mentor before time runs out."
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
      "id": "seed_rev_02",
      "title": "The Syndicate Ledger",
      "tagline": "Seven corrupt barons signed the order for your execution. You have the book.",
      "premise": "Five years in the salt mines gave you time to plan. You have broken into the syndicate's iron vault and retrieved the blood-stained ledger listing the seven city officials who framed you and slaughtered your guild. The first name on the list is dining at the Black Boar Tavern tonight.",
      "hero": {
        "name": "Rowan Blackwood",
        "role": "Vengeful Rogue",
        "origin": "Mine Survivor"
      },
      "actions": [
        "Take a shadowy booth in the Black Boar Tavern to observe the target's bodyguard rotation.",
        "Bribe the tavern scullery boy to slip truth-serum into the baron's spiced wine.",
        "Climb to the tavern rafters to prepare a silent assassination strike from above."
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
      "id": "seed_rev_03",
      "title": "The Burned Homestead",
      "tagline": "The mercenary captain who burned your village just rode into the garrison.",
      "premise": "You survived the raid by hiding inside the stone grain silo. Ten years later, after mastering the broadsword in the northern legion, you recognize the skull-engraved armor of the warlord riding through the border garrison gate with an imperial convoy.",
      "hero": {
        "name": "Theron Vane",
        "role": "Garrison Swordsman",
        "origin": "Ashen Survivor"
      },
      "actions": [
        "Challenge the warlord to an honorable duel in the garrison practice ring.",
        "Follow the convoy to discover which corrupt commander granted him imperial pardon.",
        "Sabotage the convoy's saddle girths and weapon racks before nightfall."
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
    },
    {
      "id": "seed_rev_04",
      "title": "The False Oath",
      "tagline": "Betrayed at the bridge and left for dead in the river.",
      "premise": "Your battle-brother swore a sacred blood oath to protect your flank, then severed your horse's reins and pushed you off the stone bridge to claim the royal bounty for himself. You washed ashore downstream with cracked ribs, your bow still intact.",
      "hero": {
        "name": "Kaelen Thorne",
        "role": "Guerilla Scout",
        "origin": "River Born"
      },
      "actions": [
        "Track his horse tracks along the muddy river road toward the royal outpost.",
        "Set an archer's deadfall ambush in the narrow willow ravine ahead of him.",
        "Seek refuge in the river hermit's hut to dress your wounds and fletch poisoned arrows."
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
      "id": "seed_rev_05",
      "title": "The Frame-Up in Cell 4",
      "tagline": "Framed for high treason by the grand inquisitor.",
      "premise": "The grand inquisitor fabricated a letter in your handwriting to accuse you of plotting against the throne, taking your family estate as confiscation. As the dungeon guards change shift during a lightning storm, a sympathetic turnkey unlocks your iron shackles.",
      "hero": {
        "name": "Damian Cross",
        "role": "Escaped Knight",
        "origin": "Noble Inmate"
      },
      "actions": [
        "Knock out the drunken relief guard and seize his keyring and crossbow.",
        "Infiltrate the inquisitor's scriptorium to recover the forged parchment letter.",
        "Escape through the castle sewer flume into the fog-covered moat."
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
      "id": "seed_rev_06",
      "title": "The Iron Vault Heist",
      "tagline": "Reclaiming the ancestral seal stolen by the merchant cartel.",
      "premise": "The Goldcrest Cartel bankrupted your merchant house through counterfeit promissory notes and locked your family's ancestral signet seal inside their clockwork vault. Tonight, during their annual solstice masquerade, you infiltrate the counting house.",
      "hero": {
        "name": "Valerie Vance",
        "role": "Master Infiltrator",
        "origin": "Bankrupt Noble"
      },
      "actions": [
        "Pick the twin lever locks on the counting house ventilation shaft.",
        "Disguise yourself as a cartel wine steward to slip into the private vault corridor.",
        "Place smoke canisters in the ballroom to trigger a controlled evacuation."
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
    },
    {
      "id": "seed_rev_07",
      "title": "The Stolen Credit",
      "tagline": "The court alchemist stole your cure and let the prince name him savior.",
      "premise": "You spent seven years in isolation distilling the panacea for the king's wasting plague. Your apprentice stole the crystal flask, presented it at court, and received a barony. You have arrived at the capital just as the king awards him the royal seal.",
      "hero": {
        "name": "Orlaith Mor",
        "role": "Apothecary Master",
        "origin": "Wildwood-born human"
      },
      "actions": [
        "Step before the royal dais and state the exact missing reagent that will cause the fake panacea to spoil in three days.",
        "Slip into the apprentice alchemist's laboratory to seize your original research journals.",
        "Confront your former apprentice in the palace garden under moonlight."
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
      "id": "seed_rev_08",
      "title": "The Blood-Stained Banner",
      "tagline": "The commander who gave the order to retreat into the slaughter.",
      "premise": "At the Battle of Red Ridge, your captain blew the retreat horn prematurely, locking the fortress gates from the inside and trapping your entire vanguard outside the walls. You survived under the pile of fallen banners and have walked three weeks to reach the captain's victory banquet.",
      "hero": {
        "name": "Garrick Stone",
        "role": "Vanguard Veteran",
        "origin": "Frontier Warrior"
      },
      "actions": [
        "Toss the blood-stained vanguard banner onto the center of the captain's feast table.",
        "Call upon the surviving common soldiers in the garrison to witness his cowardice.",
        "Draw your sidearm and demand a court-martial by combat."
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
