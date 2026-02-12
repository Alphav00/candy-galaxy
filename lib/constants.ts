// Candy Galaxy - Game Constants

// ============================================
// GAME SETTINGS
// ============================================

export const GAME_VERSION = '1.0.0';
export const PLANET_RADIUS = 4;

// ============================================
// STAT DECAY RATES (per hour in ms)
// ============================================

export const DECAY_INTERVAL = 60000; // 1 minute check
export const HUNGER_DECAY_RATE = 5; // -5 per hour
export const HAPPINESS_DECAY_RATE = 8; // -8 per hour
export const ENERGY_DECAY_RATE = 2; // -2 per hour

// ============================================
// CARE ACTION VALUES
// ============================================

export const FEED_HUNGER_RESTORE = 20;
export const FEED_HAPPINESS_BONUS = 5;
export const PLAY_HAPPINESS_RESTORE = 15;
export const CUDDLE_HAPPINESS_RESTORE = 10;
export const SLEEP_ENERGY_RESTORE = 50;
export const CARE_POINT_PER_FEED = 1;
export const CARE_POINT_PER_MINIGAME = 5;

// ============================================
// EVOLUTION THRESHOLDS
// ============================================

export const EVOLUTION_THRESHOLDS = {
  HATCH: 30,
  STAGE_2: 150,
  STAGE_3: 500,
} as const;

// ============================================
// CHARACTER LINEAGES
// ============================================

export type LineageType = 'gummy' | 'chocolate';

export const LINEAGE_COLORS = {
  gummy: {
    primary: '#FF69B4', // Hot Pink
    secondary: '#FFB6C1', // Light Pink
  },
  chocolate: {
    primary: '#6F4E37', // Milk Chocolate Brown
    secondary: '#8B4513', // Saddle Brown
  },
} as const;

export const EVOLUTION_NAMES = {
  gummy: ['Gummy Egg', 'Gummy Blob', 'Gummy Bear', 'Gummy Dragon'],
  chocolate: ['Chocolate Egg', 'Truffle', 'Cocoa Cat', 'Gateau Guardian'],
} as const;

export const PET_SIZES = {
  stage_1: 0.5,
  stage_2: 1.0,
  stage_3: 1.5,
} as const;

// ============================================
// PLANET COLORS (Dynamic Blooming)
// ============================================

export const PLANET_COLORS = {
  unloved: '#E8B4D9', // Pale Lavender-Pink
  early: '#FFB3D9', // Cotton Candy Pink
  mid: '#FF99CC', // Bubble Gum Pink
  loved: '#FF69B4', // Hot Pink
  accent: '#B3E0FF', // Powder Blue
  highlight: '#FFFACD', // Lemon Chiffon
} as const;

// ============================================
// STORE ITEMS
// ============================================

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'food' | 'toy' | 'decoration' | 'special';
  hungerValue?: number;
  happinessValue?: number;
}

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'cake',
    name: 'Delicious Cake',
    description: 'A sweet treat that fills the tummy!',
    cost: 1,
    type: 'food',
    hungerValue: 20,
    happinessValue: 5,
  },
  {
    id: 'ball',
    name: 'Bouncy Ball',
    description: 'A fun toy to play with!',
    cost: 2,
    type: 'toy',
    happinessValue: 10,
  },
  {
    id: 'flower',
    name: 'Candy Flower',
    description: 'A beautiful decoration for the planet.',
    cost: 3,
    type: 'decoration',
  },
  {
    id: 'mystery',
    name: 'Mystery Box',
    description: 'What could be inside?',
    cost: 5,
    type: 'special',
  },
];

// ============================================
// ROCKET REQUIREMENTS
// ============================================

export const ROCKET_PARTS_REQUIRED = 10;

// ============================================
// FACIAL EXPRESSION THRESHOLDS
// ============================================

export const HAPPINESS_THRESHOLDS = {
  HAPPY: 80, // 80-100%
  NEUTRAL: 50, // 50-79%
  SAD: 30, // 30-49%
  CRYING: 0, // 0-29%
} as const;

// ============================================
// AUDIO KEYS
// ============================================

export const AUDIO_KEYS = {
  // UI
  BUTTON_CLICK: 'button_click',
  MENU_OPEN: 'menu_open',
  MENU_CLOSE: 'menu_close',
  
  // Pet
  PET_BOUNCE: 'pet_bounce',
  PET_HAPPY: 'pet_happy',
  PET_SAD: 'pet_sad',
  PET_EAT: 'pet_eat',
  PET_SLEEP: 'pet_sleep',
  
  // Evolution
  EGG_HATCH: 'egg_hatch',
  EVOLUTION_GLOW: 'evolution_glow',
  FANFARE: 'fanfare',
  
  // Mini-game
  MINIGAME_START: 'minigame_start',
  MINIGAME_WIN: 'minigame_win',
  MINIGAME_LOSE: 'minigame_lose',
  MATCH_SUCCESS: 'match_success',
  MATCH_FAIL: 'match_fail',
  
  // Particles
  CONFETTI_BURST: 'confetti_burst',
  SPARKLE: 'sparkle',
  HEART_POP: 'heart_pop',
  
  // Music
  MUSIC_INTRO: 'music_intro',
  MUSIC_MAIN: 'music_main',
  MUSIC_MINIGAME: 'music_minigame',
} as const;

// ============================================
// GAME SCREENS
// ============================================

export type GameScreen = 
  | 'splash'
  | 'intro'
  | 'character-select'
  | 'naming'
  | 'game'
  | 'evolution'
  | 'minigame'
  | 'shop'
  | 'valentine';

// ============================================
// EASTER EGG NAMES
// ============================================

export const EASTER_EGG_NAMES = {
  freddy: { accessory: 'top_hat', description: 'A tiny, stylish top hat!' },
  celestia: { accessory: 'unicorn_horn', description: 'A shimmering unicorn horn!' },
} as const;
