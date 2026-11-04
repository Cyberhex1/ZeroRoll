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
      "roleClass": "Infiltration Specialist",
      "raceOrigin": "Human",
      "level": 1,
      "hp": 11,
      "maxHp": 11,
      "armorClass": 13,
      "initiativeBonus": 2,
      "stats": {
        "str": 11,
        "dex": 15,
        "con": 12,
        "int": 16,
        "wis": 13,
        "cha": 14
      },
      "inventory": [
        {
          "id": "rl1",
          "name": "Encrypted Security Tablet & Bypass Deck",
          "type": "misc",
          "quantity": 1
        },
        {
          "id": "rl2",
          "name": "Tactical Pen & Multi-Tool",
          "type": "weapon",
          "quantity": 1,
          "isEquipped": true
        },
        {
          "id": "rl3",
          "name": "Nexus Corp Visitor Appointment Letter",
          "type": "misc",
          "quantity": 1
        }
      ],
      "spells": [],
      "statusEffects": [
        "Well-Rested"
      ],
      "backgroundNotes": "A professional security specialist brought in to evaluate corporate network and physical access."
    },
    "samplePrompts": [
      "I check in at the ground-floor security reception desk to obtain my visitor badge.",
      "I grab a coffee at the atrium espresso bar while reviewing the building floor plans.",
      "I observe the staff security turnstiles and badge readers with an Investigation check."
    ]
  },
  "profile": {
    "seedSource": "Contemporary Urban & Professional Life Simulations",
    "voice": "Grounded, sharp, relatable, keenly observant. Emphasizes realistic human stakes, contemporary workplace dynamics, and vibrant city atmosphere.",
    "atmosphere": "Bustling Shibuya crosswalks, barista coffee grinders, tailored business suits, encrypted laptop organizers, glass skyscraper lobbies, autumn city mornings.",
    "sceneStructure": "1. Morning arrival at modern workplace/venue -> 2. Setting up gear/organizer and reviewing the day's agenda -> 3. Key conversation with client, colleague, or rival -> 4. Decisive professional/personal choice.",
    "storyBeats": "Realistic triumph and human drama: navigating high-stakes corporate audits, solving intricate architectural or logistical puzzles, building relationships, career turning points.",
    "characterDynamics": "Security consultants, investigative journalists, corporate strategists, creative designers, seasoned mentors.",
    "encounterPatterns": "Checking in at skyscraper security desks, reviewing building floor plans over espresso, observing security turnstiles, presenting strategic proposals.",
    "sensoryMotifs": [
      "Morning commuters streaming across the Shibuya crosswalk beneath towering digital billboards",
      "The rich, sharp aroma of freshly ground espresso at a busy atrium coffee bar",
      "The tactile click of a stainless steel pen on a leather-bound planner",
      "The cool polished glass and marble acoustics of a corporate headquarters lobby"
    ],
    "avoid": "Supernatural magic spells, mythical monsters, apocalyptic explosions, immersion-breaking fantasy tropes.",
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
          "name": "Multi-Tool",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Letter",
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
      "premise": "At 8:00 AM on Monday, a convoy of black sedans arrives at your family's third-generation architectural firm. A ruthless corporate raider walks into the atrium with proof he bought out your uncle's shares and plans to liquidate the studio by 5:00 PM.",
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
          "name": "Tablet",
          "type": "misc",
          "isEquipped": true
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
          "name": "Pen",
          "type": "weapon",
          "isEquipped": true
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
          "name": "Multi-Tool",
          "type": "weapon",
          "isEquipped": true
        },
        {
          "name": "Letter",
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
          "name": "Tablet",
          "type": "misc",
          "isEquipped": true
        }
      ],
      "spells": [],
      "hp": 10
    }
  ],
  "tropes": [
    {
      "premise": "The HR manager stares at you blankly after you explain the 'poop knife' incident, and your FAANG interview hinges entirely on your next sentence."
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
      "premise": "You must navigate the horrific, unsanitary disaster of the \"Swamps of Dagobah\" operating room without breaking down in front of the surgical team."
    },
    {
      "premise": "A coworker named Kevin attempts a task so fundamentally stupid that it endangers the entire office, and you are the only one who can stop him."
    },
    {
      "premise": "Your car breaks down in a torrential downpour, and a stranded immigrant family stops to help you, living by the motto \"Today You, Tomorrow Me.\""
    },
    {
      "premise": "The IT department is in shambles as a catastrophic server failure occurs on Black Friday, and the lead engineer is nowhere to be found."
    },
    {
      "premise": "You attempt to explain a complex, sensitive family dynamic in a Reddit post, only to have the entire internet brutally judge your life choices."
    },
    {
      "premise": "The Michelin-star kitchen is in the weeds, tickets are printing non-stop, and the head chef is screaming at you for a missing garnish."
    },
    {
      "premise": "You must confront the unbearable awkwardness of sharing an elevator with the CEO after accidentally sending a highly inappropriate meme to the company Slack."
    },
    {
      "premise": "The legend of Streetlamp Le Moose inspires you to navigate a complex social situation with unparalleled, effortless suave."
    },
    {
      "premise": "A modern military unit is inexplicably transported back to ancient Rome, forcing a terrifying clash between modern firepower and Roman legions."
    },
    {
      "premise": "You endure the grueling, six-round whiteboard interview at a tech giant, desperately trying to remember how to reverse a binary tree."
    },
    {
      "premise": "The chaotic energy of a busy call center reaches a boiling point when a customer threatens legal action over a five-dollar late fee."
    },
    {
      "premise": "You complete an emotional challenge from the Ulysses Bucket List, honoring a stranger's memory and profoundly changing your perspective on life."
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
      "The Shibuya Nexus Assignment: Chapter I",
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
      "Infiltration Security Consultant",
      "Senior Systems Architect",
      "Crisis Resolution Specialist",
      "Logistics Coordinator",
      "Investigative Journalist"
    ],
    "origins": [
      "Human",
      "Corporate Strategist",
      "Field Specialist"
    ],
    "physicalTraits": [
      "Clean tailored dark navy suit, polished Oxford shoes, dark rimmed glasses, carrying an encrypted leather briefcase."
    ],
    "hooks": [
      {
        "hook": "Shibuya crosswalk. You have your briefcase for the Nexus Corporation job.",
        "actions": [
          "Check in",
          "Grab coffee",
          "Observe gates"
        ],
        "gear": [
          {
            "name": "Multi-Tool",
            "type": "weapon",
            "isEquipped": true
          },
          {
            "name": "Letter",
            "type": "misc"
          }
        ],
        "spells": [],
        "hp": 11
      },
      {
        "hook": "42nd-floor panel interview. You are overqualified, but they don’t know that.",
        "actions": [
          "Fix tie",
          "Review resume",
          "Check notes"
        ],
        "gear": [
          {
            "name": "Tablet",
            "type": "misc",
            "isEquipped": true
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
            "name": "Pen",
            "type": "weapon",
            "isEquipped": true
          }
        ],
        "spells": [],
        "hp": 9
      }
    ]
  },
  "starterInventory": [
    {
      "name": "Encrypted Leather Briefcase",
      "type": "misc",
      "quantity": 1,
      "isEquipped": false
    },
    {
      "name": "Tailored Business Suit",
      "type": "armor",
      "quantity": 1,
      "isEquipped": true
    },
    {
      "name": "Smartphone & Charger",
      "type": "misc",
      "quantity": 1
    }
  ],
  "ambient": [
    "A vending machine hums in the empty corridor.",
    "Your phone buzzes with a calendar reminder you forgot to cancel.",
    "An elevator dings, but the doors do not open.",
    "A cleaning cart squeaks past, then the hallway is empty again."
  ]
} satisfies CategoryContent;
