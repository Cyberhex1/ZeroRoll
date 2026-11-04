import type { CategoryContent } from '../types';

// Zombie Outbreak. Openers, tropes and media are checked by scripts/validate-content.ts.
export const zombie = {
  "card": {
    "name": "Zombie Outbreak",
    "tagline": "The Walking Dead Survival, Highway Gridlocks & Stealth Scavenging",
    "description": "Loosely inspired by The Walking Dead: abandoned highway car graveyards, morning mist walker herds, rural farmstead barricades, and tense stealth pharmacy supply runs.",
    "iconName": "Skull",
    "gradient": "from-green-900/40 via-stone-950 to-slate-950",
    "accentColor": "#22c55e",
    "bgTheme": "cyber",
    "defaultCharacter": {
      "name": "Dr. Marcus Drake",
      "roleClass": "Outbreak Specialist",
      "raceOrigin": "Human",
      "level": 1,
      "hp": 11,
      "maxHp": 11,
      "armorClass": 13,
      "initiativeBonus": 2,
      "stats": {
        "str": 11,
        "dex": 14,
        "con": 13,
        "int": 16,
        "wis": 13,
        "cha": 11
      },
      "inventory": [
        {
          "id": "z1",
          "name": "Heavy Steel Flashlight & Scalpel",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "z2",
          "name": "Trauma First Aid Kit",
          "type": "potion",
          "quantity": 2
        },
        {
          "id": "z3",
          "name": "Hospital Master Keycard & Comm Radio",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A dedicated physician determined to understand the mysterious outbreak and protect patients."
    },
    "samplePrompts": [
      "I log into the hospital terminal to review the emergency triage intake logs with an Investigation check.",
      "I gather my emergency first-aid kit and secure the laboratory keycard access.",
      "I look through the reinforced hallway observation window to assess the situation."
    ]
  },
  "profile": {
    "seedSource": "The Walking Dead, 28 Days Later & Survival Outbreak Tropes",
    "voice": "Urgent, clinical, suspenseful, grounded. Captures the sudden transition from calm routine to catastrophic lockdown protocols.",
    "atmosphere": "Humming fluorescent hospital corridors, sudden Code Silver intercom alerts, magnetic keycards, rubber glove snaps, emergency backup lighting, barricaded triage doors.",
    "sceneStructure": "1. Routine laboratory/clinic shift -> 2. Sudden quarantine broadcast and sealed doors -> 3. Gathering emergency supplies and assessing window -> 4. Immediate survival action.",
    "storyBeats": "Epidemic containment and survival: recognizing initial infection symptoms, securing keycard-locked zones, gathering medical gear, cooperating with terrified survivors, planning escape routes.",
    "characterDynamics": "Virology researchers, triage nurses, emergency first responders, frightened clinic patients, security personnel.",
    "encounterPatterns": "Reviewing emergency triage clipboards, securing magnetic doors, checking tactical flashlight batteries, assessing quarantine observation windows.",
    "sensoryMotifs": [
      "The steady fluorescent hum dropping abruptly into flashing red emergency lights",
      "The sharp crackle of the hospital intercom broadcasting an urgent Code Silver quarantine",
      "The heavy mechanical thud of magnetic blast doors sealing the triage corridor",
      "The cold plastic feel of an emergency trauma kit clutched in trembling hands"
    ],
    "avoid": "Magical fireballs, comedic cartoon zombies, invulnerable action-movie heroics that ignore infection danger.",
    "avoidKeywords": [
      "fireball",
      "spell",
      "wizard"
    ]
  },
  "media": [
    {
      "title": "The Walking Dead",
      "medium": "Comics/TV/Telltale"
    },
    {
      "title": "The Last of Us",
      "medium": "Game/TV"
    },
    {
      "title": "Dawn of the Dead (2004)",
      "medium": "Film"
    },
    {
      "title": "28 Days Later",
      "medium": "Film"
    },
    {
      "title": "Train to Busan",
      "medium": "Film"
    },
    {
      "title": "World War Z",
      "medium": "Book"
    },
    {
      "title": "Resident Evil 2 Remake",
      "medium": "Game"
    },
    {
      "title": "State of Decay 2",
      "medium": "Game"
    },
    {
      "title": "Project Zomboid",
      "medium": "Game"
    },
    {
      "title": "Dying Light",
      "medium": "Game"
    },
    {
      "title": "Shaun of the Dead",
      "medium": "Film"
    },
    {
      "title": "Zombieland",
      "medium": "Film"
    },
    {
      "title": "Days Gone",
      "medium": "Game"
    },
    {
      "title": "Left 4 Dead 2",
      "medium": "Game"
    },
    {
      "title": "I Am a Hero",
      "medium": "Manga"
    },
    {
      "title": "Black Summer",
      "medium": "Netflix"
    },
    {
      "title": "Highschool of the Dead",
      "medium": "Anime"
    },
    {
      "title": "The Girl with All the Gifts",
      "medium": "Film/Book"
    },
    {
      "title": "Dead Rising",
      "medium": "Game"
    },
    {
      "title": "The Return of the Living Dead",
      "medium": "Film"
    }
  ],
  "openers": [
    {
      "id": "seed_zom_01",
      "title": "Code Silver in the ICU",
      "tagline": "The quarantine sirens blare as the emergency doors seal from the outside.",
      "premise": "You are on duty in the trauma wing when the emergency intercom screeches: \"Code Silver. Facility lockdown activated. All staff remain in place.\" Through the reinforced glass doors, patients in the triage hall begin collapsing and convulsing.",
      "hero": {
        "name": "Dr. Rebecca Shaw",
        "role": "Trauma Surgeon",
        "origin": "Medical First Responder"
      },
      "actions": [
        "Lock and barricade the heavy double doors to the operating theater.",
        "Gather emergency trauma kits, scalpel sets, and antibiotic syringes.",
        "Check the rooftop helipad security monitor to see if evacuation is possible."
      ],
      "gear": [
        {
          "name": "Flashlight",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "First Aid",
          "type": "potion"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_zom_02",
      "title": "The Last Radio Transmission",
      "tagline": "The broadcast tower is surrounded — and your battery is at 12%.",
      "premise": "Huddled in the third-floor control booth of downtown WKRN Radio, you have guided surviving civilians across the city for forty-eight hours. The station front doors have just buckled under the horde, and your emergency generator reads 12% battery remaining.",
      "hero": {
        "name": "Lucas Miller",
        "role": "Radio DJ",
        "origin": "Broadcaster"
      },
      "actions": [
        "Broadcast the final safe evacuation coordinates to all listening survivors.",
        "Barricade the stairwell access door with metal equipment racks.",
        "Prepare your fire axe and rooftop zip-line toward the adjacent parking garage."
      ],
      "gear": [
        {
          "name": "Service Pistol",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Radio",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_zom_03",
      "title": "The Substation Quarantine Line",
      "tagline": "The power grid failure plunges the electrified fence into darkness.",
      "premise": "You are manning the security checkpoint at the edge of the safe zone when the city power grid explodes in blue sparks. The high-voltage perimeter fence goes cold, and hundreds of silhouettes at the tree line begin surging forward.",
      "hero": {
        "name": "Sergeant Thomas Vance",
        "role": "National Guard",
        "origin": "Veteran Soldier"
      },
      "actions": [
        "Fire warning flares into the night sky to illuminate the perimeter breach.",
        "Rush to the backup diesel generator shed to manually pull the ignition cord.",
        "Rally the checkpoint guards to establish a disciplined three-rank firing line."
      ],
      "gear": [
        {
          "name": "Bat",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Rope",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 9
    },
    {
      "id": "seed_zom_04",
      "title": "The Supermarket Barricade",
      "tagline": "Trapped inside the grocery store with six strangers and dwindling canned goods.",
      "premise": "Day 14 of the outbreak. You are holed up in a reinforced supermarket with six survivors. At midnight, someone accidentally knocks over a tower of soup cans near the loading dock, and scratching hands begin tearing through the roll-up door seams.",
      "hero": {
        "name": "Morgan Kelly",
        "role": "Barricade Leader",
        "origin": "Civilian Survivor"
      },
      "actions": [
        "Reinforce the loading dock door with heavy pallets of mineral water.",
        "Quietly herd the panic-stricken survivors into the steel walk-in freezer.",
        "Climb to the roof access ladder with your hunting crossbow to scout the perimeter."
      ],
      "gear": [
        {
          "name": "Flashlight",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "First Aid",
          "type": "potion"
        }
      ],
      "spells": [],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "The pharmacy shelves are mostly stripped bare, but as you reach for the last bottle of antibiotics, a decayed hand grabs your wrist from the shadows."
    },
    {
      "premise": "A massive horde of walkers blocks the highway, forcing you to silently weave between abandoned cars without making a sound."
    },
    {
      "premise": "You barricade the doors of the rural farmhouse, but the moans outside are growing louder, and the wood is beginning to splinter."
    },
    {
      "premise": "The military quarantine zone has fallen, and you must sneak past both the infected and the panicked, trigger-happy soldiers."
    },
    {
      "premise": "A survivor in your group hides a bite mark, but their sudden fever and erratic behavior threaten the safety of the entire camp."
    },
    {
      "premise": "You trigger a car alarm while scavenging a suburban neighborhood, drawing every infected within a mile to your location."
    },
    {
      "premise": "The rooftop extraction helicopter flies overhead, completely ignoring your flares and leaving you stranded in the infested city."
    },
    {
      "premise": "You discover a fortified mall, but the survivors inside are a ruthless gang that demands a steep price for entry."
    },
    {
      "premise": "A fast, mutated infected chases you through the dark corridors of a hospital, easily vaulting over the obstacles you pull down in its path."
    },
    {
      "premise": "You run out of ammunition during a tense standoff in a grocery store, forcing you to rely on a baseball bat and sheer desperation."
    },
    {
      "premise": "The radio crackles to life, transmitting a loop of a survivor begging for rescue from a high-rise apartment building downtown."
    },
    {
      "premise": "You must cross a bridge jammed with abandoned vehicles and crawling with infected to reach the supposed safe zone on the other side."
    },
    {
      "premise": "A sudden thunderstorm washes out the roads, trapping you in a flooded gas station with a dozen waterlogged walkers."
    },
    {
      "premise": "The charismatic leader of a rival settlement offers an alliance, but you discover they have been feeding dissenters to a pit of zombies."
    },
    {
      "premise": "You attempt to hotwire a truck in the middle of a deserted intersection, desperately trying to start the engine as the horde closes in."
    },
    {
      "premise": "A child is trapped on the roof of a school bus surrounded by infected, forcing you to risk your own life to distract the swarm."
    },
    {
      "premise": "You uncover a military laboratory where scientists were experimenting on the infected, and the test subjects have broken loose."
    },
    {
      "premise": "The power grid finally fails, plunging the city into total darkness just as you hear the heavy, dragging footsteps approaching your hideout."
    },
    {
      "premise": "You must silently dispatch a room full of sleeping infected to reach the only exit from the overrun police station."
    },
    {
      "premise": "A bitten survivor begs you to end their suffering before they turn, handing you their weapon and forcing a terrible choice."
    }
  ],
  "procedural": {
    "titles": [
      "Outbreak Protocol: Chapter I",
      "Quarantine Zone 7: Chapter I",
      "The Morning of Day Zero: Chapter I",
      "St. Jude Memorial Code Silver: Chapter I",
      "The Highway Barricade: Chapter I"
    ],
    "firstNames": [
      "Marcus",
      "Dr. Evelyn",
      "Officer Ramos",
      "Chloe",
      "David",
      "Sam",
      "Sarah"
    ],
    "lastNames": [
      "Reid",
      "Chen",
      "Vance",
      "Mercer",
      "Hayes",
      "Walker",
      "Torres"
    ],
    "roles": [
      "Virology Specialist",
      "First Responder Officer",
      "Trauma Surgeon",
      "Logistics Coordinator",
      "Field Medic"
    ],
    "origins": [
      "Human Specialist",
      "Hospital Staff Survivor",
      "Tactical Officer"
    ],
    "physicalTraits": [
      "Focused gaze, sterile white lab coat with an emergency hospital ID badge clipped to the chest, rubber-gripped tactical flashlight."
    ],
    "hooks": [
      {
        "hook": "Code Silver alert at St. Jude’s. The East Wing is locked down.",
        "actions": [
          "Check logs",
          "Gather kit",
          "Look out window"
        ],
        "gear": [
          {
            "name": "Flashlight",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "First Aid",
            "type": "potion"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "The police barricade has fallen. You are in the last patrol car, and the radio is filled with screaming.",
        "actions": [
          "Start engine",
          "Check weapon",
          "Find route"
        ],
        "gear": [
          {
            "name": "Service Pistol",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Radio",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 11
      },
      {
        "hook": "Your apartment building stairs are blocked by something groaning. The fire escape is your only way down.",
        "actions": [
          "Check rope",
          "Grab bag",
          "Climb out"
        ],
        "gear": [
          {
            "name": "Bat",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Rope",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 9
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Crowbar",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Antibiotics & Bandages",
      "type": "potion",
      "quantity": 1
    },
    {
      "name": "Hand-crank Radio",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "Something groans two streets over, then falls silent.",
    "A car alarm chirps and dies. No one responds.",
    "A curtain flutters in an empty apartment across the way.",
    "You hear a faint dragging sound, then nothing."
  ]
} satisfies CategoryContent;
