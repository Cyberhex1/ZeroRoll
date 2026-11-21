import type { CategoryContent } from '../types';

// Real Life Experiences. Openers, tropes and media are checked by scripts/validate-content.ts.
export const realLife = {
  "card": {
    "name": "Real Life Experiences",
    "tagline": "Reddit Everyday Dilemmas: FAANG Panels, 2 AM Bodegas & HOA Disputes",
    "description": "Drawn from Reddit everyday experiences (r/AskReddit, r/TalesFromTechSupport, r/talesfromthefrontdesk, r/antiwork): grueling FAANG whiteboard interviews, 2 AM convenience store shifts, and HOA crises.",
    "iconName": "Briefcase",
    "gradient": "from-sky-700/30 via-slate-900 to-slate-950",
    "accentColor": "#0284c7",
    "bgTheme": "cyber",
    "defaultCharacter": {
      "name": "Alex Rivera",
      "roleClass": "Office Coordinator",
      "raceOrigin": "City-born",
      "level": 1,
      "hp": 11,
      "maxHp": 11,
      "armorClass": 13,
      "initiativeBonus": 2,
      "stats": {
        "str": 10,
        "dex": 12,
        "con": 12,
        "int": 14,
        "wis": 14,
        "cha": 13
      },
      "inventory": [
        {
          "id": "rl1",
          "name": "Work Laptop",
          "type": "misc",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "rl2",
          "name": "Office Lanyard and Keycard",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "rl3",
          "name": "Phone with Too Many Group Chats",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "Keeps the office running and gets thanked by nobody; something at work has started to shift."
    },
    "samplePrompts": [
      "I get to my desk early and read the email my manager sent at midnight.",
      "I grab a coffee in the break room and listen to who's talking about the reorg.",
      "I call my sister on my lunch break."
    ]
  },
  "profile": {
    "seedSource": "Contemporary Urban & Professional Life Simulations",
    "pattern": {
      "hero": "A regular person with a job, rent and people they care about.",
      "start": "A normal week with one pressure growing: a hostile manager, a big interview, an HOA dispute, a family secret.",
      "turn": "It comes to a head, and they lose something real.",
      "payoff": "They handle it believably, and the win feels earned."
    },
    "voice": "Grounded, sharp, relatable, keenly observant. Emphasizes realistic human stakes, contemporary workplace dynamics, and vibrant city atmosphere.",
    "atmosphere": "Fluorescent offices, break rooms with burnt coffee, crowded commutes, small apartments, family kitchens, autumn city mornings.",
    "sceneStructure": "1. An ordinary morning at work or at home -> 2. The pressure shows up (an email, a schedule change, a family call) -> 3. A conversation with a coworker, friend or family member -> 4. A choice about how to handle it.",
    "storyBeats": "Grounded human drama: a normal week with one pressure growing, small choices that add up, the pressure coming to a head and costing something real, then a believable, earned way through.",
    "characterDynamics": "Regular people with jobs, rent and families: shift workers, nurses, office staff, teachers, tenants; difficult managers, resentful coworkers, relatives with old grudges, and a friend who shows up.",
    "encounterPatterns": "Team meetings, shift handovers, awkward break-room conversations, landlord letters, family group chats, emails from HR, lunch with a friend.",
    "sensoryMotifs": [
      "The hum of the office printer during a tense meeting",
      "Burnt break-room coffee and a phone buzzing face-down on the table",
      "Rain on the bus window on the ride home",
      "The quiet of your apartment after a long shift"
    ],
    "avoid": "Supernatural magic spells, mythical monsters, apocalyptic explosions, immersion-breaking fantasy tropes, internet in-jokes and memes, heists and infiltration jobs, heroes who are secretly experts at everything.",
    "avoidKeywords": [
      "spell",
      "dragon",
      "wizard",
      "monster",
      "zombie",
      "magic",
      "sorcer*",
      "demon",
      "ghost",
      "apocalypse"
    ]
  },
  "media": [
    {
      "title": "Office Space",
      "medium": "Film"
    },
    {
      "title": "Silicon Valley",
      "medium": "TV Show"
    },
    {
      "title": "The Office",
      "medium": "TV Show"
    },
    {
      "title": "Severance",
      "medium": "TV Show"
    },
    {
      "title": "Clerks",
      "medium": "Film"
    },
    {
      "title": "Waiting...",
      "medium": "Film"
    },
    {
      "title": "Superstore",
      "medium": "TV Show"
    },
    {
      "title": "The IT Crowd",
      "medium": "TV Show"
    },
    {
      "title": "High Maintenance",
      "medium": "TV Show"
    },
    {
      "title": "Uncut Gems",
      "medium": "Film"
    },
    {
      "title": "\"The Poop Knife\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"I also choose this guy's dead wife\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"Kevin\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"Swamps of Dagobah\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"Streetlamp Le Moose\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"The Carbon Monoxide Post\"",
      "medium": "r/legaladvice"
    },
    {
      "title": "\"Two Broken Arms\"",
      "medium": "r/IAmA"
    },
    {
      "title": "\"Today You, Tomorrow Me\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"The Ulysses Bucket List\"",
      "medium": "r/AskReddit"
    },
    {
      "title": "\"Rome Sweet Rome\"",
      "medium": "r/AskReddit"
    }
  ],
  "openers": [
    {
      "id": "seed_rl_01",
      "title": "The Corporate Whistleblower Audit",
      "tagline": "Finding $40M in hidden offshore payments thirty minutes before the board meeting.",
      "premise": "As a senior forensic auditor at a Fortune 500 tech firm, you run a final automated reconciliation at 7:30 AM and discover $40M routed to a shell company owned by the Chief Financial Officer. His secretary just knocked on your glass office door with a conference invite.",
      "hero": {
        "name": "Sarah Lin",
        "role": "Forensic Financial Auditor",
        "origin": "Corporate Professional"
      },
      "actions": [
        "Back up the raw database queries onto an encrypted offline thumb drive.",
        "Walk into the CFO's conference room with your audit file tucked in your briefcase.",
        "Call the independent SEC whistleblower tip line from your private cell."
      ],
      "gear": [
        {
          "name": "Audit Laptop",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Reconciliation Printouts",
          "type": "scroll"
        },
        {
          "name": "Office Keycard",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_rl_02",
      "title": "The Hostile Takeover Defense",
      "tagline": "The rival private equity firm bought 49% of your family's architectural studio.",
      "premise": "You run your grandfather's architecture studio, the one with the creaky stairs and the drafting tables older than you. Your uncle has been quiet about the books since spring, and this morning a man in a very good suit arrived asking to see the building's floor plans for \"a new owner.\" Your team is waiting for you to tell them it's nothing. Is it?",
      "hero": {
        "name": "Marcus Bennett",
        "role": "Principal Architect",
        "origin": "Studio Owner"
      },
      "actions": [
        "Review the founding partnership bylaws for the first-refusal family buyout clause.",
        "Confront your uncle on the phone to demand an explanation for the secret share sale.",
        "Rally your design team to prepare the sovereign landmark preservation filing."
      ],
      "gear": [
        {
          "name": "Drafting Tablet",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Studio Keys",
          "type": "misc"
        },
        {
          "name": "Grandfather's First Blueprint",
          "type": "relic"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_rl_03",
      "title": "The Investigative Journalist's Lead",
      "tagline": "An encrypted drop-box notification containing the mayor's private emails.",
      "premise": "Your encrypted signal app chimes at 2:00 AM from an anonymous source labeled \"Deep Harbor.\" It contains five gigabytes of internal municipal emails approving the demolition of the historic waterfront district for an illegal casino development.",
      "hero": {
        "name": "Rachel Torres",
        "role": "Investigative Reporter",
        "origin": "City Journalist"
      },
      "actions": [
        "Verify the cryptographic digital signatures on the mayor's email headers.",
        "Contact your trusted city editor to request immediate legal protection and front-page layout.",
        "Meet the anonymous source at the 24-hour diner near the harbor docks."
      ],
      "gear": [
        {
          "name": "Reporter's Notebook",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Encrypted Phone",
          "type": "misc"
        },
        {
          "name": "Press Badge",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 9
    },
    {
      "id": "seed_rl_04",
      "title": "The High-Stakes Tech Demo",
      "tagline": "Your venture capital demo crashes 10 minutes before the $20M pitch.",
      "premise": "You are backstage at the Silicon Valley Demo Day with three hundred angel investors in the auditorium. Your lead engineer accidentally deployed a faulty database patch that wiped the live demonstration data. You have ten minutes before your name is called to the stage.",
      "hero": {
        "name": "Alex Chen",
        "role": "Startup Founder & CEO",
        "origin": "Tech Entrepreneur"
      },
      "actions": [
        "Roll back the production server deployment to the stable staging build via terminal.",
        "Pivot your pitch deck to focus on the live architecture and customer traction numbers.",
        "Step onto the stage with supreme confidence and deliver an unforgettable live pitch."
      ],
      "gear": [
        {
          "name": "Demo Laptop",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Pitch Deck Clicker",
          "type": "misc"
        },
        {
          "name": "Backup Drive",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 11
    },
    {
      "id": "seed_rl_05",
      "title": "The Art Gallery Heist Discovery",
      "tagline": "The masterpiece scheduled for auction is an immaculate forgery you painted in college.",
      "premise": "Working as the head curator at the Metropolitan Gallery, you inspect the $15M Renaissance oil painting arriving for the evening gala. Under ultraviolet examination, you spot your own private student signature beneath the varnish — it's the exact practice forgery you sold for art school tuition ten years ago.",
      "hero": {
        "name": "Elena Rostova",
        "role": "Chief Art Curator",
        "origin": "Brooklyn-raised"
      },
      "actions": [
        "Document the UV signature flaws in your confidential appraisal report.",
        "Trace which private collector consigned the painting for tonight's auction.",
        "Speak privately with the gallery director before the billionaire collectors arrive."
      ],
      "gear": [
        {
          "name": "UV Inspection Lamp",
          "type": "misc",
          "isEquipped": true
        },
        {
          "name": "Gallery Keycard",
          "type": "misc"
        },
        {
          "name": "Condition Report Folder",
          "type": "scroll"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_rl_06",
      "title": "The Shift Nobody Claimed",
      "tagline": "Two tired coworkers were promised the same morning.",
      "premise": "You unlock a station cafe before rush hour and find the rota changed overnight while two exhausted coworkers each insist the opening shift was promised to the other.",
      "hero": {
        "name": "Naomi Serrano",
        "role": "Cafe Shift Lead",
        "origin": "Queens-raised human"
      },
      "actions": [
        "Compare the changed rota with the shift messages.",
        "Ask both coworkers which hours they can actually cover.",
        "Call the owner before opening the busiest service window."
      ],
      "gear": [
        {
          "name": "Cafe Utility Tool",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Shift Notebook",
          "type": "misc"
        },
        {
          "name": "Apron",
          "type": "armor"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_rl_07",
      "title": "The Ramp Before the Opening",
      "tagline": "The opening cannot be welcoming until the entrance works.",
      "premise": "You reach a small exhibition venue and discover the hired access ramp does not fit as the first invited guests arrive outside its stepped entrance.",
      "hero": {
        "name": "Devika Rao",
        "role": "Exhibition Producer",
        "origin": "City-born human"
      },
      "actions": [
        "Measure the doorway and the ramp before moving equipment.",
        "Ask the venue team to open the accessible side entrance.",
        "Tell the arriving guests plainly what is being fixed."
      ],
      "gear": [
        {
          "name": "Exhibition Multitool",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Tape Measure",
          "type": "misc"
        },
        {
          "name": "Venue Contact List",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_rl_08",
      "title": "The Interview Without a Room",
      "tagline": "One panel, one slot, two people trying to stay composed.",
      "premise": "You arrive for a final interview and find another candidate assigned the same panel and time while the receptionist asks which of you will go first.",
      "hero": {
        "name": "Elliot Brooks",
        "role": "Job Applicant",
        "origin": "Commuter-town human"
      },
      "actions": [
        "Show the receptionist your confirmation without blaming the other candidate.",
        "Ask the panel coordinator to explain the duplicated booking.",
        "Compare availability with the other candidate for a fair adjustment."
      ],
      "gear": [
        {
          "name": "Key-Ring Multitool",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Interview Folder",
          "type": "misc"
        },
        {
          "name": "Travel Bottle",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 9
    },
    {
      "id": "seed_rl_09",
      "title": "The Deposit on Table Four",
      "tagline": "Two anniversaries have arrived for one carefully set table.",
      "premise": "You check an evening booking at a neighborhood restaurant and discover two families paid deposits for the same anniversary table as both parties enter together.",
      "hero": {
        "name": "Ines Duarte",
        "role": "Restaurant Bookings Coordinator",
        "origin": "Riverside-raised human"
      },
      "actions": [
        "Check both deposit receipts against the booking history.",
        "Ask each family which part of the evening matters most.",
        "Offer the private alcove after confirming it is truly available."
      ],
      "gear": [
        {
          "name": "Service Corkscrew",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Booking Tablet",
          "type": "misc"
        },
        {
          "name": "Receipt Folder",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    },
    {
      "id": "seed_rl_10",
      "title": "The Last Box in the Lift",
      "tagline": "Ten minutes of lift access will not move everybody's day.",
      "premise": "You meet neighbors at a moving-day lift and learn its maintenance shutdown starts in ten minutes while an older resident's essential belongings remain upstairs.",
      "hero": {
        "name": "Kareem Bell",
        "role": "Tenant Organizer",
        "origin": "Estate-raised human"
      },
      "actions": [
        "Ask the maintenance crew whether a safe brief delay is possible.",
        "Identify the resident's essential boxes before moving anything else.",
        "Organize neighbors to clear the lift's waiting area."
      ],
      "gear": [
        {
          "name": "Pocket Multitool",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Building Contact Sheet",
          "type": "misc"
        },
        {
          "name": "Moving Straps",
          "type": "misc"
        }
      ],
      "spells": [],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "Your manager has started copying HR on every email to you, and the coworker who wanted your job has been very friendly lately."
    },
    {
      "premise": "The chaotic customer at the 2 AM bodega demands to buy a single cigarette with a handful of sticky pennies, holding up a massive line."
    },
    {
      "premise": "You discover mysterious post-it notes appearing in your apartment, leading you to suspect either a stalker or a carbon monoxide leak."
    },
    {
      "premise": "The Homeowners Association president issues a citation for your mailbox being the wrong shade of beige, threatening to place a lien on your house."
    },
    {
      "premise": "You are two weeks into a new hospital as a surgical tech, and the scrub nurse who trained you keeps leaving you off the cases that count toward your certification."
    },
    {
      "premise": "The coworker who sits next to you keeps taking credit for your work in standups, and your annual review is in three weeks."
    },
    {
      "premise": "Your car breaks down in a torrential downpour, and a stranded immigrant family stops to help you, living by the motto \"Today You, Tomorrow Me.\""
    },
    {
      "premise": "The IT department is in shambles as a catastrophic server failure occurs on Black Friday, and the lead engineer is nowhere to be found."
    },
    {
      "premise": "Your landlord has sold the building, and the new owners keep sending letters to every tenant that say \"renovation\" and never say \"eviction.\""
    },
    {
      "premise": "The Michelin-star kitchen is in the weeds, tickets are printing non-stop, and the head chef is screaming at you for a missing garnish."
    },
    {
      "premise": "You must confront the unbearable awkwardness of sharing an elevator with the CEO after accidentally sending a highly inappropriate meme to the company Slack."
    },
    {
      "premise": "Your younger brother wants you to co-sign his first apartment lease, and your parents say you owe him after everything they did for you."
    },
    {
      "premise": "You've been offered a promotion that means managing your closest friend at work, and she found out before you could tell her."
    },
    {
      "premise": "You endure the grueling, six-round whiteboard interview at a tech giant, desperately trying to remember how to reverse a binary tree."
    },
    {
      "premise": "The chaotic energy of a busy call center reaches a boiling point when a customer threatens legal action over a five-dollar late fee."
    },
    {
      "premise": "You have looked after your grandmother every weekend for a year, and your aunt has started asking, carefully, whether Grandma has \"updated anything\" lately."
    },
    {
      "premise": "The dreaded family Thanksgiving dinner erupts into chaos when a long-held secret is casually dropped during the main course."
    },
    {
      "premise": "You try to mediate a petty dispute between two roommates over dirty dishes that has somehow escalated into a full-blown cold war."
    },
    {
      "premise": "The gig-economy delivery driver gets hopelessly lost in a massive, labyrinthine apartment complex with a rapidly cooling pizza."
    },
    {
      "premise": "You realize the \"great investment opportunity\" your old high school friend pitched you at a coffee shop is actually a massive pyramid scheme."
    }
  ],
  "procedural": {
    "titles": [
      "The Monday Reorg: Chapter I",
      "The 42nd Floor Panel Interview: Chapter I",
      "Night Shift at the 24/7 Terminal: Chapter I",
      "The Emergency HOA Board Meeting: Chapter I",
      "The Airport Connection Sprint: Chapter I"
    ],
    "firstNames": [
      "Alex",
      "Morgan",
      "Taylor",
      "Jordan",
      "Sam",
      "Riley",
      "Casey",
      "Jesse"
    ],
    "lastNames": [
      "Rivera",
      "Kovacs",
      "Tanaka",
      "Chen",
      "Vance",
      "Patel",
      "Hayes",
      "Morrison"
    ],
    "roles": [
      "Office Coordinator",
      "Night Shift Nurse",
      "Line Cook",
      "Call Center Agent",
      "IT Support Technician"
    ],
    "origins": [
      "City-born",
      "Small-town transplant",
      "Suburban-raised"
    ],
    "physicalTraits": [
      "Clean tailored dark navy suit, polished Oxford shoes, dark rimmed glasses, carrying an encrypted leather briefcase."
    ],
    "hooks": [
      {
        "hook": "Monday morning at the office. Your manager has moved your one-on-one to Friday and copied HR on the invite, and the coworker who wanted your job is suddenly very friendly.",
        "actions": [
          "Ask your manager what the meeting is about",
          "Have coffee with the friendly coworker",
          "Quietly save copies of your work"
        ],
        "gear": [
          {
            "name": "Work Laptop",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Office Lanyard",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 11
      },
      {
        "hook": "Final interview day. The panel is running late, and the other candidate in the lobby used to be your coworker; he's telling the receptionist a story about you.",
        "actions": [
          "Say hello to him",
          "Go over your notes",
          "Ask the receptionist how long the wait is"
        ],
        "gear": [
          {
            "name": "Interview Folder",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Phone",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 10
      },
      {
        "hook": "Night shift. Terminal 4 is empty, but your server alert is flashing red.",
        "actions": [
          "Login",
          "Check power",
          "Call boss"
        ],
        "gear": [
          {
            "name": "Work Phone",
            "type": "misc",
            "isEquipped": true
          },
          {
            "name": "Server Room Badge",
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
      "name": "Work Bag",
      "type": "misc"
    },
    {
      "name": "Everyday Clothes",
      "type": "armor",
      "isEquipped": true
    },
    {
      "name": "Smartphone & Charger",
      "type": "misc"
    }
  ],
  "ambient": [
    "A vending machine hums in the empty corridor.",
    "Your phone buzzes with a calendar reminder you forgot to cancel.",
    "An elevator dings, but the doors do not open.",
    "A cleaning cart squeaks past, then the hallway is empty again."
  ]
} satisfies CategoryContent;
