import type { CategoryContent } from '../types';

// Horror. Openers, tropes and media are checked by scripts/validate-content.ts.
export const horror = {
  "card": {
    "name": "Horror",
    "tagline": "r/nosleep Rules, Radio Tower Mimics & Survival Horror",
    "description": "Drawing inspiration from r/nosleep, classic creepypastas, and psychological horror games: eerie station rulebooks, mountain radio mimic broadcasts, and fog-drenched ghost towns.",
    "iconName": "Ghost",
    "gradient": "from-red-900/40 via-stone-950 to-slate-950",
    "accentColor": "#ef4444",
    "bgTheme": "eldritch",
    "defaultCharacter": {
      "name": "Father Silas Vane",
      "roleClass": "Inquisitor Hunter",
      "raceOrigin": "Human",
      "level": 1,
      "hp": 10,
      "maxHp": 10,
      "armorClass": 13,
      "initiativeBonus": 1,
      "stats": {
        "str": 10,
        "dex": 12,
        "con": 12,
        "int": 14,
        "wis": 16,
        "cha": 12
      },
      "inventory": [
        {
          "id": "i1",
          "name": "Silver Heavy Crossbow & 15 Bolts",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "i2",
          "name": "Brass Oil Lantern",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "i3",
          "name": "Vials of Blessed Holy Water",
          "type": "potion",
          "quantity": 2
        },
        {
          "id": "i4",
          "name": "Silver Inquisitor Rosary & Journal",
          "type": "relic",
          "quantity": 1
        }
      ],
      "spells": [
        "Detect Evil",
        "Light",
        "Bless",
        "Sanctuary"
      ],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "Called to investigate the sudden disappearance of the Blackwood forestry survey team."
    },
    "samplePrompts": [
      "I read the handwritten note pinned to the cabin door with an Investigation check.",
      "I light my brass lantern and unlock the cabin to set up my baseline camp.",
      "I scan the surrounding forest tree line with my silver rosary in hand."
    ]
  },
  "profile": {
    "seedSource": "r/nosleep, Classic Creepypastas & Psychological Survival Horror",
    "voice": "Tense, claustrophobic, sensory, creeping dread. Focuses on unsettling absences, rules that must not be broken, and the uncanny silence of isolated places.",
    "atmosphere": "Dense pine forests at dusk, brass oil lanterns casting long amber shadows, handwritten caretaker rulebooks pinned to cabin doors, complete absence of birdsong, cold mountain fog.",
    "sceneStructure": "1. Arrival at secluded lodge/outpost at twilight -> 2. Finding an ominous caretaker note or missing person trace -> 3. Securing baseline shelter & light -> 4. First eerie anomaly choice.",
    "storyBeats": "Pacing the slow-burn horror: establishing mundane procedures, discovering the first bizarre inconsistency, realizing isolation, navigating escalating threats while managing resources.",
    "characterDynamics": "Forestry survey rangers, night-shift radio technicians, lone investigators, missing predecessors, watchful unseen presences.",
    "encounterPatterns": "Reading handwritten station rulebooks, lighting oil lanterns with matches, inspecting abandoned vehicles with keys left behind, checking perimeter locks.",
    "sensoryMotifs": [
      "The dry crunch of autumn leaves beneath boots in a completely silent pine forest",
      "The sharp sulfur smell of a struck match lighting an amber lantern wick",
      "The unsettling, total silence where no insects or birds can be heard",
      "A yellowed handwritten note pinned to peeling timber with a brass thumbtack"
    ],
    "avoid": "Instant cheesy jump-scares without atmosphere, comedic quips, overpowered heroic action that destroys vulnerability, goofy tropes.",
    "avoidKeywords": [
      "lol",
      "joke"
    ]
  },
  "media": [
    {
      "title": "Silent Hill 2",
      "medium": "Game"
    },
    {
      "title": "Resident Evil 7: Biohazard",
      "medium": "Game"
    },
    {
      "title": "The Blair Witch Project",
      "medium": "Film"
    },
    {
      "title": "Amnesia: The Dark Descent",
      "medium": "Game"
    },
    {
      "title": "Alan Wake",
      "medium": "Game"
    },
    {
      "title": "Outlast",
      "medium": "Game"
    },
    {
      "title": "Channel Zero",
      "medium": "TV Show"
    },
    {
      "title": "Hereditary",
      "medium": "Film"
    },
    {
      "title": "The Babadook",
      "medium": "Film"
    },
    {
      "title": "Stranger Things",
      "medium": "TV Show"
    },
    {
      "title": "The Left/Right Game",
      "medium": "r/nosleep"
    },
    {
      "title": "Penpal",
      "medium": "r/nosleep"
    },
    {
      "title": "Borrasca",
      "medium": "r/nosleep"
    },
    {
      "title": "Search and Rescue Woods / I'm a Search and Rescue Officer",
      "medium": "r/nosleep"
    },
    {
      "title": "The Spire in the Woods",
      "medium": "r/nosleep"
    },
    {
      "title": "Tommy Taffy / The Third Parent",
      "medium": "r/nosleep"
    },
    {
      "title": "I Dared My Best Friend to Ruin My Life",
      "medium": "r/nosleep"
    },
    {
      "title": "Tales from the Gas Station",
      "medium": "r/nosleep"
    },
    {
      "title": "My Property Isn't Normal",
      "medium": "r/nosleep"
    },
    {
      "title": "Accounts from a Lonely Broadcast Station",
      "medium": "r/nosleep"
    }
  ],
  "openers": [
    {
      "id": "seed_hor_01",
      "title": "The Fire Lookout Rules",
      "tagline": "A handwritten list of 7 rules pinned to the ranger cabin door.",
      "premise": "You take up the lone night shift at Tower 9 deep in Blackwood Forest. Pinned to the timber door with a brass thumbtack is a handwritten note from the missing ranger: \"Rule 1: If the radio plays a waltz, cut the power. Rule 2: Never answer the knock after 2:14 AM.\" The clock strikes 2:13 AM.",
      "hero": {
        "name": "Jack Miller",
        "role": "Fire Lookout Ranger",
        "origin": "Human Survivor"
      },
      "actions": [
        "Check the generator fuel level and locate the main breaker switch.",
        "Look out the panoramic tower windows into the pitch-black pine treeline with binoculars.",
        "Arm yourself with the station flare gun and double-bolt the reinforced trapdoor."
      ],
      "gear": [
        {
          "name": "Crossbow",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Lantern",
          "type": "misc"
        }
      ],
      "spells": [
        "Detect Evil"
      ],
      "hp": 10
    },
    {
      "id": "seed_hor_02",
      "title": "The Midnight Radio Frequency",
      "tagline": "An amateur radio picking up broadcasts from ten minutes into the future.",
      "premise": "While tuning an antique ham radio in your storm cellar, you find a broadcast on 104.7 MHz that describes your exact movements ten minutes in advance. The announcer just stated: \"At 11:42 PM, the cellar bulkhead was violently torn open from the outside.\"",
      "hero": {
        "name": "Sarah Jenkins",
        "role": "Radio Technician",
        "origin": "Civilian Survivor"
      },
      "actions": [
        "Brace the cellar storm doors with heavy wooden beams and iron chains.",
        "Speak directly into the microphone on 104.7 MHz to see if the voice responds.",
        "Grab your emergency flashlight, shotgun, and escape through the hidden coal chute."
      ],
      "gear": [
        {
          "name": "Flashlight",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Crowbar",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 9
    },
    {
      "id": "seed_hor_03",
      "title": "The Unopened Cellar",
      "tagline": "The inheritance deed forbade opening the basement under any circumstance.",
      "premise": "You inherited your great-aunt's Victorian estate with one legal condition: the basement iron door must never be unlocked. On your first night, you discover the iron padlock has been cut from the inside, and wet footprints lead up the carpeted hallway toward your bedroom.",
      "hero": {
        "name": "Claire Redgrave",
        "role": "Estate Heir",
        "origin": "Investigator"
      },
      "actions": [
        "Follow the wet footprints down the hallway with your heavy brass flashlight.",
        "Check the locks on your bedroom door and prepare a defensive weapon.",
        "Descend the cellar stairs to discover what broke out of the subterranean chamber."
      ],
      "gear": [
        {
          "name": "Radio",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Knife",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_hor_04",
      "title": "The Submerged Village",
      "tagline": "A reservoir drought exposes the church steeple and ringing bell.",
      "premise": "A summer heatwave drains the mountain reservoir, revealing the sunken roofs of Ravenstone village, flooded sixty years ago. At dusk, the drowned church bell begins tolling across the mud flats, and lanterns flicker in the mud-caked windows beneath the waterline.",
      "hero": {
        "name": "Dr. Martin Cross",
        "role": "Hydrologist",
        "origin": "Academic"
      },
      "actions": [
        "Walk across the cracked mud flats toward the exposed church steeple.",
        "Inspect the historical municipal flood map to check who remained behind in 1964.",
        "Listen to the acoustic echoes with your directional microphone gear."
      ],
      "gear": [
        {
          "name": "Crossbow",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Lantern",
          "type": "misc"
        }
      ],
      "spells": [
        "Detect Evil"
      ],
      "hp": 10
    },
    {
      "id": "seed_hor_05",
      "title": "The Doppelganger at the Station",
      "tagline": "Your identical double walks off the midnight train wearing your jacket.",
      "premise": "Waiting on the fog-drenched platform for your train, you watch a passenger step off wearing your exact coat, carrying your leather briefcase, and greeting your coworkers by name. As they walk away together, the double turns and winks at you from across the tracks.",
      "hero": {
        "name": "David Mercer",
        "role": "Commuter",
        "origin": "Investigator"
      },
      "actions": [
        "Follow the double silently through the fog-covered station arcade.",
        "Check your briefcase contents to see what identical items you still possess.",
        "Call your partner's cell phone to see who answers on the other end."
      ],
      "gear": [
        {
          "name": "Flashlight",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Crowbar",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 9
    },
    {
      "id": "seed_hor_06",
      "title": "The Highway That Never Ends",
      "tagline": "Mile Marker 47 keeps reappearing every five minutes.",
      "premise": "Driving through the desert at 3:00 AM, your car passes Mile Marker 47 for the fourth time. The GPS reads \"Recalculating... 0 miles to destination,\" and the only roadside building is a diner where every patron is staring motionless at the front door.",
      "hero": {
        "name": "Emily Vance",
        "role": "Courier",
        "origin": "Night Driver"
      },
      "actions": [
        "Pull into the diner parking lot with your engine idling and doors locked.",
        "Turn the car around and drive in reverse to test the boundary physics.",
        "Step inside the diner with your tire iron and address the stationary patrons."
      ],
      "gear": [
        {
          "name": "Radio",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Knife",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_hor_07",
      "title": "The Hospital Ward 4B",
      "tagline": "The elevator opens on a floor that was demolished in 1988.",
      "premise": "Taking the service elevator to the ICU on night shift, the buttons short out and the doors slide open to Ward 4B — smelling of carbolic acid and lit by flickering yellow incandescent bulbs. Old charts on the nurses' desk list patients admitted today.",
      "hero": {
        "name": "Nurse Rachel Cole",
        "role": "Night Shift Nurse",
        "origin": "Medical Staff"
      },
      "actions": [
        "Press the emergency alarm button inside the elevator cab.",
        "Read the first patient clipboard on the wooden nurses' station desk.",
        "Use your penlight to follow the linoleum corridor toward the red exit sign."
      ],
      "gear": [
        {
          "name": "Crossbow",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Lantern",
          "type": "misc"
        }
      ],
      "spells": [
        "Detect Evil"
      ],
      "hp": 10
    },
    {
      "id": "seed_hor_08",
      "title": "The Taxidermist's Ledger",
      "tagline": "Animals in the display cases are breathing in sync with your pulse.",
      "premise": "Seeking shelter from a torrential thunderstorm in an eccentric taxidermist's antique shop, you notice the mounted wolves and ravens in the glass cases are subtly expanding and contracting their chests in perfect rhythm with your own heartbeat.",
      "hero": {
        "name": "Liam O'Connor",
        "role": "Antique Appraiser",
        "origin": "Survivor"
      },
      "actions": [
        "Hold your breath to see if the mounted wolf's breathing stops.",
        "Search the taxidermist's desk for the workshop cellar key.",
        "Sprint for the front door before the display case latches click open."
      ],
      "gear": [
        {
          "name": "Flashlight",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Crowbar",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 9
    },
    {
      "id": "seed_hor_09",
      "title": "The Flesh-Sculptor's Doll",
      "tagline": "The porcelain doll on your nightstand has real human teeth.",
      "premise": "You bought an antique Victorian doll at an estate sale for thirty dollars. While cleaning the porcelain face under your desk lamp, you notice the teeth inside its parted porcelain lips are genuine human teeth with silver fillings.",
      "hero": {
        "name": "Hannah Abbott",
        "role": "Restorer",
        "origin": "Antiquarian"
      },
      "actions": [
        "Inspect the doll's maker mark stamped under the porcelain neckline.",
        "Wrap the doll in heavy burlap and lock it inside the iron footlocker.",
        "Contact the estate executor to demand the history of the previous owner."
      ],
      "gear": [
        {
          "name": "Radio",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Knife",
          "type": "weapon"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_hor_10",
      "title": "The Silent Fog Outpost",
      "tagline": "Total radio silence across 40 miles of coastline.",
      "premise": "You arrive at the coastal research station after a 12-hour patrol. Every light is on, hot meals sit untouched on the mess hall tables, and all bird and insect sounds have completely ceased across the entire peninsula.",
      "hero": {
        "name": "Officer Ethan Ray",
        "role": "Coast Guard Patrol",
        "origin": "First Responder"
      },
      "actions": [
        "Check the radar room logs to see what vessel was detected before the silence.",
        "Inspect the generator room to ensure defensive floodlights stay on.",
        "Draw your sidearm and sweep the dormitory bunks room by room."
      ],
      "gear": [
        {
          "name": "Crossbow",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Lantern",
          "type": "misc"
        }
      ],
      "spells": [
        "Detect Evil"
      ],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "You hear your own voice call out for help from the dark tree line, despite being entirely alone at the campsite."
    },
    {
      "premise": "The rules left by the previous night shift guard state: \"If the static on monitor 4 sounds like weeping, do not look at the screen.\" Monitor 4 just started weeping."
    },
    {
      "premise": "You find a staircase standing perfectly intact in the middle of the deep woods. A colleague warns you never to climb it."
    },
    {
      "premise": "The radio tower broadcasts a distress signal, but the voice is speaking in a language made entirely of grinding metal and static."
    },
    {
      "premise": "You lock the door of the rural cabin, only to realize the muddy footprints leading inside don't match your boots."
    },
    {
      "premise": "The creature mimicking your mother's voice outside the bedroom door knows things only she would know, but its silhouette is far too tall."
    },
    {
      "premise": "You realize the \"fog\" rolling into town isn't water vapor; it's a dense cloud of microscopic, writhing insects."
    },
    {
      "premise": "The basement stairs seem to stretch infinitely downward, and the bulb above you begins to violently flicker and dim."
    },
    {
      "premise": "You pull a loose thread from a tear in the wallpaper, and the wall bleeds thick, black ichor onto your fingers."
    },
    {
      "premise": "The local gas station attendant casually mentions that the man standing by the ice machine hasn't blinked in four hours."
    },
    {
      "premise": "You find a series of polaroid photos hidden in the attic, all depicting you sleeping in your bed last night."
    },
    {
      "premise": "The emergency broadcast system warns residents not to look at the moon. The moonlight streaming through your window turns crimson."
    },
    {
      "premise": "You realize the mannequins in the abandoned department store have changed positions every time you turn your flashlight away."
    },
    {
      "premise": "A tall, smiling man in a pristine suit knocks on your door, refusing to leave and insisting he is your \"third parent.\""
    },
    {
      "premise": "You drive down the dirt road, but the GPS insists you are driving through the middle of a lake that dried up fifty years ago."
    },
    {
      "premise": "The search and rescue team finds a camper's tent suspended sixty feet in the canopy of a pine tree, zipped shut from the inside."
    },
    {
      "premise": "A frantic knocking comes from the inside of the locked closet door in your otherwise empty apartment."
    },
    {
      "premise": "The tape recorder you left running overnight captured an hour of heavy breathing and someone whispering your name."
    },
    {
      "premise": "You look in the bathroom mirror and realize your reflection's eyes are staring at a spot slightly behind you."
    },
    {
      "premise": "The abandoned asylum is completely silent, except for the rhythmic bouncing of a rubber ball echoing from the end of the hall."
    }
  ],
  "procedural": {
    "titles": [
      "The Mystery of Blackwood Ridge: Chapter I",
      "The Whispering Pines Motel: Chapter I",
      "Night Shift at Tower 9: Chapter I",
      "The Sanatorium on Ash Hill: Chapter I",
      "The Cold Fog of Raven's Hollow: Chapter I"
    ],
    "firstNames": [
      "Silas",
      "Elena",
      "Julian",
      "Clara",
      "Arthur",
      "Vera",
      "Roland",
      "Evelyn"
    ],
    "lastNames": [
      "Vane",
      "Crane",
      "Holloway",
      "Blackwood",
      "Cross",
      "Morrow",
      "Sinclair"
    ],
    "roles": [
      "Inquisitor Hunter",
      "Forestry Survey Specialist",
      "Paranormal Investigator",
      "Night Shift Fire Watcher",
      "Antique Appraiser"
    ],
    "origins": [
      "Human",
      "Haunted Wanderer",
      "Grimbound Scholar"
    ],
    "physicalTraits": [
      "Pale features, tired but razor-sharp gray eyes, dark woolen overcoat with collar turned up against the cold wind, clutching a brass lantern.",
      "Sturdy hiking gear, tactical flashlight clipped to the chest strap, cautious gait and attentive posture."
    ],
    "hooks": [
      {
        "hook": "Dusk settles over Blackwood Ridge. A handwritten note pinned to the cabin door bears your name.",
        "actions": [
          "Read note",
          "Light lantern",
          "Scan forest"
        ],
        "gear": [
          {
            "name": "Crossbow",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Lantern",
            "type": "misc"
          }
        ],
        "spells": [
          "Detect Evil"
        ],
        "hp": 10
      },
      {
        "hook": "You pull into the Whispering Pines Motel. The neon sign hums with a sickly flicker, and room 13 appears to be open despite the lobby being locked.",
        "actions": [
          "Check room 13",
          "Search lobby",
          "Inspect your car"
        ],
        "gear": [
          {
            "name": "Flashlight",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Crowbar",
            "type": "weapon"
          }
        ],
        "spells": [],
        "hp": 9
      },
      {
        "hook": "Tower 9 is silent. The radio crackles with static, and you see movement in the trees beneath the fire watch platform.",
        "actions": [
          "Check binoculars",
          "Call headquarters",
          "Lock the tower hatch"
        ],
        "gear": [
          {
            "name": "Radio",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Knife",
            "type": "weapon"
          }
        ],
        "spells": [],
        "hp": 11
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Heavy Flashlight",
      "type": "weapon",
      "quantity": 1,
      "isEquipped": true,
      "description": "A heavy rubber-gripped tactical flashlight."
    },
    {
      "name": "Voice Recorder",
      "type": "misc",
      "quantity": 1
    },
    {
      "name": "First Aid Kit",
      "type": "potion",
      "quantity": 1
    }
  ],
  "ambient": [
    "The lights in the hallway flicker once, then hold.",
    "Somewhere below, a door clicks shut. You did not open it.",
    "The radio emits a long wash of static, then returns to silence.",
    "A floorboard creaks in the room you just left."
  ]
} satisfies CategoryContent;
