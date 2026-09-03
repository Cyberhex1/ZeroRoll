export type ExperienceCategory =
  | 'fantasy'
  | 'adventure'
  | 'historical_adventure'
  | 'horror'
  | 'cozy_ghibli'
  | 'romantic'
  | 'revenge'
  | 'apocalypse'
  | 'zombie'
  | 'cosmic_horror'
  | 'psychedelic_trip'
  | 'tiktok_drama'
  | 'ancient_greek'
  | 'mythology'
  | 'real_life';

export interface CategoryInfo {
  id: ExperienceCategory;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  gradient: string;
  accentColor: string;
  bgTheme: 'dungeon' | 'forest' | 'cyber' | 'ghibli' | 'eldritch' | 'cozy' | 'desert' | 'snow';
  defaultCharacter: Partial<CharacterSheet>;
  samplePrompts: string[];
}

export interface StatBlock {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'relic' | 'misc';
  quantity: number;
  description?: string;
  isEquipped?: boolean;
}

export interface CharacterSheet {
  id: string;
  name: string;
  gender?: string; // 'she/her' | 'he/him' | 'they/them' | custom
  roleClass: string; // e.g. Paladin, Rogue, Cyber-Hacker, Ghibli Baker, Detective
  raceOrigin: string; // e.g. Elf, Human, Android, Spirit
  level: number;
  hp: number;
  maxHp: number;
  tempHp?: number;
  armorClass: number;
  initiativeBonus: number;
  stats: StatBlock;
  inventory: InventoryItem[];
  spells: string[];
  statusEffects: string[];
  backgroundNotes: string;
  avatarUrl?: string;
  physicalDescription?: string;
}

export interface StateDelta {
  hpDelta?: number;
  itemsGained?: string[];
  itemsLost?: string[];
  conditionsAdded?: string[];
  conditionsRemoved?: string[];
  spellsGained?: string[];
  locationUpdate?: string;
}

export interface DiceRollResult {
  formula: string; // e.g., "1d20+4"
  rolls: number[];
  modifier: number;
  total: number;
  isNat20?: boolean;
  isNat1?: boolean;
  reason?: string;
}

export interface AvatarEvolution {
  evolved: boolean;
  visualChangeReason?: string;
  updatedPhysicalDescription?: string;
  avatarUrl?: string;
}

export interface ActionTurnResult {
  text: string;
  suggestedActions?: string[];
  courseChangeAlert?: CourseChangeAlert | null;
  requiredCheck?: PendingCheck | null;
  stateDelta?: StateDelta | null;
  avatarEvolution?: AvatarEvolution | null;
  modelUsed?: string;
}

export interface LogMessage {
  id: string;
  sender: 'player' | 'dm' | 'system' | 'adjudicator';
  text: string;
  timestamp: string;
  diceRoll?: DiceRollResult;
  actionType?: 'narrative' | 'combat' | 'skill_check' | 'rule_adjudication' | 'map_update';
  modelUsed?: string;
  suggestedActions?: string[];
}

export interface MapToken {
  id: string;
  name: string;
  type: 'hero' | 'monster' | 'npc' | 'object' | 'loot';
  x: number; // grid position x
  y: number; // grid position y
  hp?: number;
  maxHp?: number;
  color: string;
  icon: string;
  isHidden?: boolean;
  notes?: string;
}

export interface TerrainMarker {
  id: string;
  type: 'wall' | 'door' | 'chest' | 'trap' | 'hazard' | 'note' | 'fire' | 'portal';
  x: number;
  y: number;
  label: string;
}

export interface MapData {
  gridWidth: number;
  gridHeight: number;
  bgTheme: 'dungeon' | 'forest' | 'cyber' | 'ghibli' | 'eldritch' | 'cozy' | 'desert' | 'snow';
  showGrid: boolean;
  fogOfWarEnabled: boolean;
  fogMatrix: boolean[][]; // true = foggy (hidden), false = revealed
  tokens: MapToken[];
  terrainMarkers: TerrainMarker[];
  description?: string;
}

export interface GameWorldState {
  currentLocation: string;
  timeOfDay: string;
  activeQuest: string;
  dangerLevel: 'Safe' | 'Moderate' | 'Dangerous' | 'Deadly';
  customNotes: string;
}

export interface PendingCheck {
  skill: string;
  stat?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | string;
  dc: number;
  reason: string;
  difficultyLabel?: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Heroic';
}

export interface CourseChangeAlert {
  id: string;
  title: string;
  subtitle: string;
  type: 'course_change' | 'ambush' | 'crisis' | 'opportunity' | 'twist';
  description: string;
  statCheck?: PendingCheck;
  timestamp: string;
}

export interface StoryOutlineNPC {
  name: string;
  role: string;
  motivation: string;
  secret?: string;
}

export interface DMStoryOutline {
  startingCircumstances: string;
  backstory: string;
  incitingIncident: string;
  immediateGoal: string;
  keyNpcs: StoryOutlineNPC[];
  majorConflicts: string[];
  secretsAndReveals: string[];
  chapters: string[];
  potentialEndings: string[];
}

export interface TropeCategory {
  id: string;
  name: string;
  tagline: string;
  premise: string;
  sampleConflict: string;
}

export interface Experience {
  id: string;
  userId: string;
  title: string;
  category: ExperienceCategory;
  description: string;
  model: string;
  customSystemPrompt?: string;
  createdAt: string;
  updatedAt: string;
  character: CharacterSheet;
  gameWorldState: GameWorldState;
  logs: LogMessage[];
  mapData: MapData;
  storyOutline?: DMStoryOutline;
  pendingCheck?: PendingCheck | null;
  activeAlert?: CourseChangeAlert | null;
}

export interface GeminiModelOption {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  recommendedFor: string;
}

export interface AvatarConfig {
  hairstyle: 'short_rogue' | 'long_braids' | 'wizard_hat' | 'cyber_spikes' | 'curly_afro' | 'bald_monk' | 'knight_helmet' | 'elven_crown';
  hairColor: string;
  skinTone: string;
  clothingColor: string;
  badgeIcon: 'shield' | 'sword' | 'sparkles' | 'wand' | 'crown' | 'skull' | 'heart' | 'flame';
}

export interface EncounterData {
  encounterTitle: string;
  encounterType: 'combat' | 'social' | 'puzzle' | 'ambush';
  narrativeIntro: string;
  monstersOrNpcs: MapToken[];
  terrainMarkers?: TerrainMarker[];
  statCheck?: {
    skill: string;
    dc: number;
    reasoning: string;
  };
  suggestedActions: string[];
}

export interface UserSettings {
  selectedModel?: string;
  customSystemPrompt?: string;
  soundEnabled?: boolean;
  activeProvider?: string;
  providerKeys?: Record<string, string>;
  providerModels?: Record<string, string>;
  providerBaseUrls?: Record<string, string>;
  activeExperienceId?: string | null;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  avatar?: AvatarConfig;
  customApiKey?: string;
  preferredModel?: string;
  settings?: UserSettings;
  activeExperienceId?: string | null;
  updatedAt?: string;
}
