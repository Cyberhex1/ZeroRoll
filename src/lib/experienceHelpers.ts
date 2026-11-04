// src/lib/experienceHelpers.ts
// Map and inventory helpers for campaign creation. Per-category content (starter
// inventory, fallback actions, ambient lines) lives in src/content.

import { InventoryItem, MapData } from '../types';

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

// Merge user-provided inventory with category default; user items take priority.
// Issue #4: Make AI scenario inventory additive to user-provided gear.
export function mergeInventoryAdditive(
  userInventory: InventoryItem[] | undefined,
  categoryDefault: InventoryItem[]
): InventoryItem[] {
  if (!userInventory || userInventory.length === 0) return categoryDefault;
  // A hero who already has a weapon or armour does not get a second set from the category
  // defaults (PS7); other defaults are added when nothing of that name is carried.
  const userNamesLower = new Set(userInventory.map(i => (i.name || '').toLowerCase().trim()));
  const userTypes = new Set(userInventory.map(i => i.type));
  const extras = categoryDefault
    .filter(d => !userNamesLower.has((d.name || '').toLowerCase().trim()))
    .filter(d => !((d.type === 'weapon' || d.type === 'armor' || d.type === 'potion') && userTypes.has(d.type)));
  return [...userInventory, ...extras];
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
