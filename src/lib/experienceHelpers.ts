// src/lib/experienceHelpers.ts
// Helpers for adding variety and category-aware generation to the experience creation
// flow. Replaces the static "1 hook per category" dispatcher with shuffled procedural
// content + category-grounded fallback suggested actions and inventory.

import { ExperienceCategory, InventoryItem, MapData } from '../types';
import { CATEGORY_SEEDLISTS } from './seedlists';

// ---------------------------------------------------------------------------
// Issue #13: Vary fog-of-war initial reveal radius and hero starting position
// ---------------------------------------------------------------------------
export function createVariedInitialMap(
  category: string,
  categoryBgTheme: MapData['bgTheme'],
  heroName: string,
  heroHp: number,
  heroMaxHp: number
): MapData {
  // Vary grid size slightly: 10-14 on each axis
  const gridWidth = 10 + Math.floor(Math.random() * 5); // 10..14
  const gridHeight = 10 + Math.floor(Math.random() * 5); // 10..14

  // Vary hero starting position: somewhere on the lower half
  const heroX = 1 + Math.floor(Math.random() * Math.max(1, gridWidth - 2));
  const heroY = Math.max(2, gridHeight - 2 - Math.floor(Math.random() * 3));

  // Vary reveal radius: 2-4 cell radius
  const revealRadius = 2 + Math.floor(Math.random() * 3);

  const fogMatrix: boolean[][] = [];
  for (let r = 0; r < gridHeight; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < gridWidth; c++) {
      const dist = Math.max(Math.abs(r - heroY), Math.abs(c - heroX));
      // true = foggy (hidden), false = revealed
      row.push(dist > revealRadius);
    }
    fogMatrix.push(row);
  }

  return {
    gridWidth,
    gridHeight,
    bgTheme: categoryBgTheme || 'dungeon',
    showGrid: true,
    fogOfWarEnabled: true,
    fogMatrix,
    tokens: [
      {
        id: 'hero_tok',
        name: heroName,
        type: 'hero',
        x: heroX,
        y: heroY,
        hp: heroHp,
        maxHp: heroMaxHp,
        color: '#2563eb',
        icon: 'shield'
      }
    ],
    terrainMarkers: []
  };
}

// ---------------------------------------------------------------------------
// Issue #8: Category-aware default inventory
// Returns a coherent starter kit appropriate for the category and role.
// ---------------------------------------------------------------------------
type CategoryInventoryPool = Record<ExperienceCategory, InventoryItem[]>;

const FANTASY_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Worn Longsword', type: 'weapon', quantity: 1, isEquipped: true, description: 'A serviceable steel blade that has seen better days.' },
  { id: 'inv_armor', name: 'Leather Armor', type: 'armor', quantity: 1, isEquipped: true, description: 'A boiled-hide cuirass offering modest protection.' },
  { id: 'inv_potion', name: 'Healing Potion', type: 'potion', quantity: 2 },
  { id: 'inv_gold', name: 'Pouch of 15 Gold Coins', type: 'misc', quantity: 1 },
  { id: 'inv_pack', name: 'Explorer\'s Pack & Rations', type: 'misc', quantity: 1 }
];

const ADVENTURE_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Polished Brass Cutlass', type: 'weapon', quantity: 1, isEquipped: true, description: 'A well-balanced naval blade.' },
  { id: 'inv_armor', name: 'Salt-stained Leather Coat', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_relic', name: 'Obsidian Compass', type: 'relic', quantity: 1, isEquipped: false, description: 'A needle that points to something other than magnetic north.' },
  { id: 'inv_misc', name: 'Rolled Nautical Chart', type: 'misc', quantity: 1 }
];

const HISTORICAL_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Worn Saber', type: 'weapon', quantity: 1, isEquipped: true, description: 'A serviceable cavalry blade.' },
  { id: 'inv_armor', name: 'Field Coat & Bandolier', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_misc', name: 'Encrypted Dispatch', type: 'misc', quantity: 1, isEquipped: false, description: 'Sealed letter bearing an unfamiliar wax sigil.' },
  { id: 'inv_potion', name: 'Field Bandage Kit', type: 'potion', quantity: 1 }
];

const HORROR_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Heavy Flashlight', type: 'weapon', quantity: 1, isEquipped: true, description: 'A heavy rubber-gripped tactical flashlight.' },
  { id: 'inv_misc', name: 'Voice Recorder', type: 'misc', quantity: 1 },
  { id: 'inv_potion', name: 'First Aid Kit', type: 'potion', quantity: 1 }
];

const COZY_INVENTORY: InventoryItem[] = [
  { id: 'inv_misc', name: 'Worn Leather Journal', type: 'misc', quantity: 1, isEquipped: false, description: 'Half-filled with pressed wildflowers and recipes.' },
  { id: 'inv_potion', name: 'Bundle of Dried Lavender', type: 'potion', quantity: 1 },
  { id: 'inv_misc', name: 'Battered Kettle', type: 'misc', quantity: 1 }
];

const ROMANTIC_INVENTORY: InventoryItem[] = [
  { id: 'inv_misc', name: 'Engraved Silver Compact', type: 'relic', quantity: 1, isEquipped: false, description: 'A keepsake whose inscription you cannot quite remember.' },
  { id: 'inv_armor', name: 'Elegant Evening Attire', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_misc', name: 'Hand-written Letter', type: 'misc', quantity: 1 }
];

const REVENGE_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Concealed Blade', type: 'weapon', quantity: 1, isEquipped: true, description: 'Hidden along the forearm.' },
  { id: 'inv_armor', name: 'Dark Reinforced Trench Coat', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_relic', name: 'Worn List of Names', type: 'relic', quantity: 1 }
];

const APOCALYPSE_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Improvised Pipe Rifle', type: 'weapon', quantity: 1, isEquipped: true, description: 'Scavenged. Loud. Reliable enough.' },
  { id: 'inv_armor', name: 'Patchwork Leather Duster', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_misc', name: 'Geiger Counter', type: 'misc', quantity: 1, isEquipped: false },
  { id: 'inv_potion', name: 'Stimpak (Field Medic)', type: 'potion', quantity: 2 }
];

const ZOMBIE_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Crowbar', type: 'weapon', quantity: 1, isEquipped: true },
  { id: 'inv_potion', name: 'Antibiotics & Bandages', type: 'potion', quantity: 1 },
  { id: 'inv_misc', name: 'Hand-crank Radio', type: 'misc', quantity: 1 }
];

const COSMIC_HORROR_INVENTORY: InventoryItem[] = [
  { id: 'inv_misc', name: 'Hand-bound Leather Journal', type: 'misc', quantity: 1, isEquipped: false, description: 'Filled with cramped handwritten Greek and Babylonian.' },
  { id: 'inv_weapon', name: 'Brass-handled Walking Cane', type: 'weapon', quantity: 1, isEquipped: true },
  { id: 'inv_relic', name: 'Tarnished Silver Compass', type: 'relic', quantity: 1 }
];

const PSYCHEDELIC_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Resonant Crystal Chime Staff', type: 'weapon', quantity: 1, isEquipped: true, description: 'Hums in harmony with nearby thoughts.' },
  { id: 'inv_potion', name: 'Vial of Liquid Starlight', type: 'potion', quantity: 1, isEquipped: false },
  { id: 'inv_armor', name: 'Iridescent Robes', type: 'armor', quantity: 1, isEquipped: true }
];

const TIKTOK_DRAMA_INVENTORY: InventoryItem[] = [
  { id: 'inv_relic', name: 'Antique Signet Ring', type: 'relic', quantity: 1, isEquipped: false, description: 'Hidden inside your jacket pocket. Bears an unfamiliar crest.' },
  { id: 'inv_armor', name: 'Impeccably Tailored Plain Suit', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_misc', name: 'Encrypted Smartphone', type: 'misc', quantity: 1 }
];

const GREEK_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Iron-tipped Dory Spear', type: 'weapon', quantity: 1, isEquipped: true },
  { id: 'inv_armor', name: 'Polished Bronze Aspis', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_relic', name: 'Laurel of Apollo', type: 'relic', quantity: 1 }
];

const MYTHOLOGY_INVENTORY: InventoryItem[] = [
  { id: 'inv_weapon', name: 'Runic Silver Spear', type: 'weapon', quantity: 1, isEquipped: true },
  { id: 'inv_armor', name: 'Engraved Aegis', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_relic', name: 'Whispering Rune-stone', type: 'relic', quantity: 1 }
];

const REAL_LIFE_INVENTORY: InventoryItem[] = [
  { id: 'inv_misc', name: 'Encrypted Leather Briefcase', type: 'misc', quantity: 1, isEquipped: false },
  { id: 'inv_armor', name: 'Tailored Business Suit', type: 'armor', quantity: 1, isEquipped: true },
  { id: 'inv_misc', name: 'Smartphone & Charger', type: 'misc', quantity: 1 }
];

const CATEGORY_INVENTORY_POOL: CategoryInventoryPool = {
  fantasy: FANTASY_INVENTORY,
  adventure: ADVENTURE_INVENTORY,
  historical_adventure: HISTORICAL_INVENTORY,
  horror: HORROR_INVENTORY,
  cozy_ghibli: COZY_INVENTORY,
  romantic: ROMANTIC_INVENTORY,
  revenge: REVENGE_INVENTORY,
  apocalypse: APOCALYPSE_INVENTORY,
  zombie: ZOMBIE_INVENTORY,
  cosmic_horror: COSMIC_HORROR_INVENTORY,
  psychedelic_trip: PSYCHEDELIC_INVENTORY,
  tiktok_drama: TIKTOK_DRAMA_INVENTORY,
  ancient_greek: GREEK_INVENTORY,
  mythology: MYTHOLOGY_INVENTORY,
  real_life: REAL_LIFE_INVENTORY
};

export function getCategoryDefaultInventory(category: ExperienceCategory): InventoryItem[] {
  const base = CATEGORY_INVENTORY_POOL[category] || FANTASY_INVENTORY;
  // Clone with new IDs so each experience has its own items
  return base.map((item, i) => ({
    ...item,
    id: `inv_${category}_${Date.now()}_${i}`
  }));
}

// Merge user-provided inventory with category default; user items take priority.
// Issue #4: Make AI scenario inventory additive to user-provided gear.
export function mergeInventoryAdditive(
  userInventory: InventoryItem[] | undefined,
  categoryDefault: InventoryItem[]
): InventoryItem[] {
  if (!userInventory || userInventory.length === 0) return categoryDefault;
  // Keep all user items, append any default items not already represented
  const userNamesLower = new Set(userInventory.map(i => (i.name || '').toLowerCase().trim()));
  const extras = categoryDefault.filter(d => !userNamesLower.has((d.name || '').toLowerCase().trim()));
  return [...userInventory, ...extras];
}

// ---------------------------------------------------------------------------
// Issue #3: Category-aware fallback suggested actions (when AI doesn't provide any)
// Uses the seedlist's narrativeTropes / brainstormHooks for variety.
// ---------------------------------------------------------------------------
export function getCategoryFallbackActions(category: ExperienceCategory, count = 3): string[] {
  const seed = CATEGORY_SEEDLISTS[category];
  const genericFailsafe = [
    'Cautiously observe the immediate surroundings.',
    'Approach the nearest focal point or person.',
    'Steady yourself and assess your available resources.'
  ];

  if (!seed) return genericFailsafe.slice(0, count);

  // Build candidate pool from various trope-like sources
  const candidates: string[] = [];
  if (Array.isArray(seed.brainstormHooks)) {
    for (const h of seed.brainstormHooks) {
      candidates.push(h);
    }
  }
  if (Array.isArray(seed.narrativeTropes)) {
    for (const t of seed.narrativeTropes) {
      candidates.push(t);
    }
  }
  if (Array.isArray(seed.encounterSeeds)) {
    for (const e of seed.encounterSeeds) {
      candidates.push(e);
    }
  }
  if (Array.isArray(seed.openingHooks)) {
    for (const oh of seed.openingHooks) {
      if (Array.isArray(oh.suggestedActions)) {
        for (const sa of oh.suggestedActions) candidates.push(sa);
      }
    }
  }
  if (Array.isArray(seed.popularTropes)) {
    for (const t of seed.popularTropes) {
      // TropeCategory is an object; surface its tagline/premise as candidate action text
      if (t?.tagline) candidates.push(t.tagline);
      if (t?.premise) candidates.push(t.premise);
    }
  }

  // Shuffle deterministically using the category id length + turn count would be
  // nicer, but Math.random is fine here — these run once per creation.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Dedupe and trim
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of candidates) {
    const key = c.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
    if (out.length >= count) break;
  }
  if (out.length < count) {
    for (const g of genericFailsafe) {
      if (!seen.has(g.toLowerCase().trim())) {
        out.push(g);
        if (out.length >= count) break;
      }
    }
  }
  return out.slice(0, count);
}

// ---------------------------------------------------------------------------
// Issue #11: Time-of-day progression
// Cycles the time of day forward in 1-2 step increments.
// ---------------------------------------------------------------------------
const TIME_OF_DAY_SEQUENCE = [
  'Daybreak',
  'Early Morning',
  'Morning',
  'Late Morning',
  'Midday',
  'Afternoon',
  'Late Afternoon',
  'Evening',
  'Dusk',
  'Night',
  'Late Night',
  'Small Hours',
  'Pre-Dawn'
];

export function advanceTimeOfDay(current: string | undefined, steps = 1): string {
  if (!current) return TIME_OF_DAY_SEQUENCE[0];
  const idx = TIME_OF_DAY_SEQUENCE.findIndex(t => t.toLowerCase() === (current || '').toLowerCase());
  if (idx < 0) return TIME_OF_DAY_SEQUENCE[0];
  const next = (idx + steps) % TIME_OF_DAY_SEQUENCE.length;
  return TIME_OF_DAY_SEQUENCE[next];
}

// ---------------------------------------------------------------------------
// Issue #10: Ambient world events — short category-flavored filler messages
// shown when the player has been idle for a while.
// ---------------------------------------------------------------------------
const AMBIENT_TEMPLATES: Record<ExperienceCategory, string[]> = {
  fantasy: [
    'A cold breeze rustles through the high grass. Somewhere, a crow calls twice.',
    'The torch at your belt gutters in a sudden draft, then steadies.',
    'Footsteps echo briefly in the distance, then fade.',
    'Distant bells chime the quarter-hour from a town you cannot yet see.'
  ],
  adventure: [
    'A gull cries overhead and wheels back toward the harbor.',
    'The rope at your belt creaks gently as the ship lists to starboard.',
    'A warm salt wind presses against the canvas of your coat.',
    'Planks beneath your feet groan with the slow rhythm of the sea.'
  ],
  historical_adventure: [
    'A street vendor calls out the morning price of persimmons.',
    'Distant temple bells ring, marking the quarter-hour.',
    'A clerk in a stiff indigo haori brushes past without looking up.',
    'The smell of woodsmoke and steamed rice drifts from a nearby stall.'
  ],
  horror: [
    'The lights in the hallway flicker once, then hold.',
    'Somewhere below, a door clicks shut. You did not open it.',
    'The radio emits a long wash of static, then returns to silence.',
    'A floorboard creaks in the room you just left.'
  ],
  cozy_ghibli: [
    'A small breeze lifts the petals from the teacup on the table.',
    'Somewhere a kettle begins to sing, even though no one lit a fire.',
    'A soot spirit bumps apologetically against your ankle and dashes away.',
    'Cloud shadows drift slowly across the kitchen floor.'
  ],
  romantic: [
    'A waltz drifts faintly from the ballroom below.',
    'The candle between you trembles in a draft no one can feel.',
    'A servant passes silently outside, glancing at neither of you.',
    'Moonlight shifts across the parquet floor as a cloud thins.'
  ],
  revenge: [
    'A car passes in the alley below, slowing — then accelerating away.',
    'Your phone vibrates once with a number you do not recognize.',
    'A match flares and dies in a window three buildings over.',
    'Distant sirens count off two blocks, then fall silent.'
  ],
  apocalypse: [
    'A dry wind kicks a scrap of old newspaper against your boot.',
    'Your Geiger counter clicks twice, then settles.',
    'Somewhere far off, a metal sign bangs in a hot gust.',
    'The low hum of a dormant protectron drifts from the rubble.'
  ],
  zombie: [
    'Something groans two streets over, then falls silent.',
    'A car alarm chirps and dies. No one responds.',
    'A curtain flutters in an empty apartment across the way.',
    'You hear a faint dragging sound, then nothing.'
  ],
  cosmic_horror: [
    'The angle of the corner of the room seems, briefly, to be wrong.',
    'Your notebook hums faintly when you set it down.',
    'Outside, the stars rearrange themselves in a pattern you cannot recall seeing before.',
    'A page of your translation turns of its own accord.'
  ],
  psychedelic_trip: [
    'The color of the air shifts, slowly, from teal to amber.',
    'A sound like distant bells resolves into a taste like mint.',
    'The floor breathes once, then holds still.',
    'Your shadow points a half-second after you do.'
  ],
  tiktok_drama: [
    'A waiter pauses, then pretends not to have seen the ring on your finger.',
    'Your phone lights up with a news alert you choose not to read.',
    'A distant camera flash goes off somewhere across the banquet hall.',
    'The executive across the room glances your way twice, then looks away.'
  ],
  ancient_greek: [
    'A column of incense smoke rises straight up in the still air.',
    'Distant bronze bowls ring out the noon offering.',
    'A laurel leaf falls from a wreath you did not notice you were wearing.',
    'The oracle\'s veil trembles though there is no wind.'
  ],
  mythology: [
    'The runes on your forearm glow briefly, then dim.',
    'A raven lands on the fence post and regards you with one eye.',
    'Somewhere, a horn sounds across a valley that was empty an hour ago.',
    'The wind smells of iron and cold starlight.'
  ],
  real_life: [
    'A vending machine hums in the empty corridor.',
    'Your phone buzzes with a calendar reminder you forgot to cancel.',
    'An elevator dings, but the doors do not open.',
    'A cleaning cart squeaks past, then the hallway is empty again.'
  ]
};

export function getAmbientEvent(category: ExperienceCategory): string {
  const pool = AMBIENT_TEMPLATES[category] || AMBIENT_TEMPLATES.fantasy;
  return pool[Math.floor(Math.random() * pool.length)];
}
