// Candy Galaxy - Game State Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  LineageType,
  GameScreen,
  EVOLUTION_THRESHOLDS,
  HUNGER_DECAY_RATE,
  HAPPINESS_DECAY_RATE,
  ENERGY_DECAY_RATE,
  DECAY_INTERVAL,
  FEED_HUNGER_RESTORE,
  FEED_HAPPINESS_BONUS,
  PLAY_HAPPINESS_RESTORE,
  CUDDLE_HAPPINESS_RESTORE,
  SLEEP_ENERGY_RESTORE,
  CARE_POINT_PER_FEED,
  CARE_POINT_PER_MINIGAME,
  ROCKET_PARTS_REQUIRED,
  PLANET_COLORS,
  STORE_ITEMS,
  EASTER_EGG_NAMES,
} from '@/lib/constants';

// ============================================
// TYPES
// ============================================

export interface PetState {
  name: string;
  lineage: LineageType | null;
  stage: 0 | 1 | 2 | 3; // 0 = egg, 1 = hatched, 2 = evolved, 3 = final
  happiness: number;
  hunger: number;
  energy: number;
  cumulativeCare: number;
  accessory: string | null;
}

export interface GameState {
  // Screen state
  currentScreen: GameScreen;
  introStep: number;
  
  // Pet state
  pet: PetState;
  
  // Economy
  rocketParts: number;
  
  // Inventory
  inventory: Record<string, number>;
  
  // Planet state
  planetHappiness: number; // 0-100, affects color
  
  // Game flags
  hasSeenIntro: boolean;
  rocketDiscovered: boolean;
  rocketRepaired: boolean;
  creativeMode: boolean;
  
  // Last activity time (for decay calculation)
  lastActivityTime: number;
  
  // Easter eggs
  konamiActivated: boolean;
}

export interface GameActions {
  // Screen navigation
  setScreen: (screen: GameScreen) => void;
  nextIntroStep: () => void;
  resetIntro: () => void;
  
  // Pet actions
  setPetName: (name: string) => void;
  setPetLineage: (lineage: LineageType) => void;
  evolvePet: () => void;
  
  // Care actions
  feed: () => void;
  play: () => void;
  cuddle: () => void;
  sleep: () => void;
  
  // Stats
  updateStats: (happiness: number, hunger: number, energy: number) => void;
  decayStats: () => void;
  calculateOfflineDecay: () => void;
  
  // Economy
  addRocketParts: (amount: number) => void;
  spendRocketParts: (amount: number) => boolean;
  
  // Store
  buyItem: (itemId: string) => boolean;
  useItem: (itemId: string) => void;
  
  // Planet
  updatePlanetHappiness: () => void;
  
  // Game flags
  discoverRocket: () => void;
  repairRocket: () => boolean;
  toggleCreativeMode: () => void;
  
  // Easter eggs
  activateKonami: () => void;
  
  // Reset
  resetGame: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialPetState: PetState = {
  name: '',
  lineage: null,
  stage: 0,
  happiness: 100,
  hunger: 100,
  energy: 100,
  cumulativeCare: 0,
  accessory: null,
};

const initialGameState: GameState = {
  currentScreen: 'splash',
  introStep: 0,
  pet: { ...initialPetState },
  rocketParts: 0,
  inventory: {},
  planetHappiness: 50,
  hasSeenIntro: false,
  rocketDiscovered: false,
  rocketRepaired: false,
  creativeMode: false,
  lastActivityTime: Date.now(),
  konamiActivated: false,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getEvolutionStage(cumulativeCare: number): 0 | 1 | 2 | 3 {
  if (cumulativeCare >= EVOLUTION_THRESHOLDS.STAGE_3) return 3;
  if (cumulativeCare >= EVOLUTION_THRESHOLDS.STAGE_2) return 2;
  if (cumulativeCare >= EVOLUTION_THRESHOLDS.HATCH) return 1;
  return 0;
}

function checkEasterEgg(name: string): string | null {
  const lowerName = name.toLowerCase();
  if (lowerName in EASTER_EGG_NAMES) {
    return EASTER_EGG_NAMES[lowerName as keyof typeof EASTER_EGG_NAMES].accessory;
  }
  return null;
}

// ============================================
// STORE
// ============================================

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialGameState,

      // Screen navigation
      setScreen: (screen) => set({ currentScreen: screen }),
      
      nextIntroStep: () => set((state) => ({ 
        introStep: state.introStep + 1 
      })),
      
      resetIntro: () => set({ introStep: 0 }),

      // Pet actions
      setPetName: (name) => set((state) => ({
        pet: { 
          ...state.pet, 
          name,
          accessory: checkEasterEgg(name),
        },
      })),
      
      setPetLineage: (lineage) => set((state) => ({
        pet: { ...state.pet, lineage },
      })),
      
      evolvePet: () => {
        const state = get();
        const newStage = getEvolutionStage(state.pet.cumulativeCare);
        
        if (newStage > state.pet.stage) {
          set((state) => ({
            pet: { ...state.pet, stage: newStage },
            currentScreen: newStage === 3 ? 'valentine' : 'evolution',
          }));
        }
      },

      // Care actions
      feed: () => {
        const state = get();
        if (state.creativeMode || state.inventory.cake > 0) {
          if (!state.creativeMode && state.inventory.cake > 0) {
            set((s) => ({
              inventory: { ...s.inventory, cake: (s.inventory.cake || 1) - 1 },
            }));
          }
          
          set((state) => {
            const newCumulativeCare = state.pet.cumulativeCare + CARE_POINT_PER_FEED;
            return {
              pet: {
                ...state.pet,
                hunger: clamp(state.pet.hunger + FEED_HUNGER_RESTORE, 0, 100),
                happiness: clamp(state.pet.happiness + FEED_HAPPINESS_BONUS, 0, 100),
                cumulativeCare: newCumulativeCare,
                stage: getEvolutionStage(newCumulativeCare),
              },
              lastActivityTime: Date.now(),
            };
          });
        }
      },
      
      play: () => {
        const state = get();
        set({
          pet: {
            ...state.pet,
            happiness: clamp(state.pet.happiness + PLAY_HAPPINESS_RESTORE, 0, 100),
            energy: clamp(state.pet.energy - 5, 0, 100),
          },
          lastActivityTime: Date.now(),
        });
      },
      
      cuddle: () => {
        const state = get();
        set({
          pet: {
            ...state.pet,
            happiness: clamp(state.pet.happiness + CUDDLE_HAPPINESS_RESTORE, 0, 100),
          },
          lastActivityTime: Date.now(),
        });
      },
      
      sleep: () => {
        const state = get();
        set({
          pet: {
            ...state.pet,
            energy: clamp(state.pet.energy + SLEEP_ENERGY_RESTORE, 0, 100),
          },
          lastActivityTime: Date.now(),
        });
      },

      // Stats
      updateStats: (happiness, hunger, energy) => set((state) => ({
        pet: {
          ...state.pet,
          happiness: clamp(happiness, 0, 100),
          hunger: clamp(hunger, 0, 100),
          energy: clamp(energy, 0, 100),
        },
      })),
      
      decayStats: () => {
        const state = get();
        if (state.creativeMode) return;
        
        // Calculate decay per minute (rates are per hour, so divide by 60)
        const hungerDecay = HUNGER_DECAY_RATE / 60;
        const happinessDecay = HAPPINESS_DECAY_RATE / 60;
        const energyDecay = ENERGY_DECAY_RATE / 60;
        
        set((state) => ({
          pet: {
            ...state.pet,
            hunger: clamp(state.pet.hunger - hungerDecay, 0, 100),
            happiness: clamp(state.pet.happiness - happinessDecay, 0, 100),
            energy: clamp(state.pet.energy - energyDecay, 0, 100),
          },
        }));
      },
      
      calculateOfflineDecay: () => {
        const state = get();
        if (state.creativeMode) return;
        
        const now = Date.now();
        const elapsed = now - state.lastActivityTime;
        const hours = elapsed / (1000 * 60 * 60);
        
        const hungerLoss = HUNGER_DECAY_RATE * hours;
        const happinessLoss = HAPPINESS_DECAY_RATE * hours;
        const energyLoss = ENERGY_DECAY_RATE * hours;
        
        // If app was closed for > 1 hour, restore energy (sleep mechanic)
        const energyGain = hours > 1 ? Math.min(50, hours * 10) : 0;
        
        set((state) => ({
          pet: {
            ...state.pet,
            hunger: clamp(state.pet.hunger - hungerLoss, 0, 100),
            happiness: clamp(state.pet.happiness - happinessLoss, 0, 100),
            energy: clamp(state.pet.energy - energyLoss + energyGain, 0, 100),
          },
          lastActivityTime: now,
        }));
      },

      // Economy
      addRocketParts: (amount) => set((state) => ({
        rocketParts: state.rocketParts + amount,
      })),
      
      spendRocketParts: (amount) => {
        const state = get();
        if (state.rocketParts >= amount) {
          set({ rocketParts: state.rocketParts - amount });
          return true;
        }
        return false;
      },

      // Store
      buyItem: (itemId) => {
        const state = get();
        const item = STORE_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;
        
        if (state.creativeMode || state.rocketParts >= item.cost) {
          if (!state.creativeMode) {
            set((s) => ({ rocketParts: s.rocketParts - item.cost }));
          }
          set((s) => ({
            inventory: {
              ...s.inventory,
              [itemId]: (s.inventory[itemId] || 0) + 1,
            },
          }));
          return true;
        }
        return false;
      },
      
      useItem: (itemId) => {
        const state = get();
        if ((state.inventory[itemId] || 0) > 0) {
          const item = STORE_ITEMS.find((i) => i.id === itemId);
          if (!item) return;
          
          set((s) => ({
            inventory: {
              ...s.inventory,
              [itemId]: (s.inventory[itemId] || 1) - 1,
            },
            pet: {
              ...s.pet,
              hunger: item.hungerValue 
                ? clamp(s.pet.hunger + item.hungerValue, 0, 100) 
                : s.pet.hunger,
              happiness: item.happinessValue 
                ? clamp(s.pet.happiness + item.happinessValue, 0, 100) 
                : s.pet.happiness,
            },
          }));
        }
      },

      // Planet
      updatePlanetHappiness: () => {
        const state = get();
        const avgStats = (state.pet.happiness + state.pet.hunger + state.pet.energy) / 3;
        set({ planetHappiness: avgStats });
      },

      // Game flags
      discoverRocket: () => set({ rocketDiscovered: true }),
      
      repairRocket: () => {
        const state = get();
        if (state.creativeMode || state.rocketParts >= ROCKET_PARTS_REQUIRED) {
          if (!state.creativeMode) {
            set((s) => ({ rocketParts: s.rocketParts - ROCKET_PARTS_REQUIRED }));
          }
          set({ rocketRepaired: true });
          return true;
        }
        return false;
      },
      
      toggleCreativeMode: () => set((state) => ({
        creativeMode: !state.creativeMode,
        // Give infinite resources in creative mode
        rocketParts: !state.creativeMode ? 9999 : state.rocketParts,
      })),

      // Easter eggs
      activateKonami: () => set((state) => ({
        konamiActivated: true,
        rocketParts: state.rocketParts + 1000,
      })),

      // Reset
      resetGame: () => set({ ...initialGameState, lastActivityTime: Date.now() }),
    }),
    {
      name: 'candy-galaxy-storage',
      partialize: (state) => ({
        // Only persist these fields
        pet: state.pet,
        rocketParts: state.rocketParts,
        inventory: state.inventory,
        planetHappiness: state.planetHappiness,
        hasSeenIntro: state.hasSeenIntro,
        rocketDiscovered: state.rocketDiscovered,
        rocketRepaired: state.rocketRepaired,
        creativeMode: state.creativeMode,
        lastActivityTime: state.lastActivityTime,
        konamiActivated: state.konamiActivated,
      }),
    }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectPetStage = (state: GameState) => state.pet.stage;

export const selectPlanetColor = (state: GameState) => {
  const happiness = state.planetHappiness;
  if (happiness >= 80) return PLANET_COLORS.loved;
  if (happiness >= 50) return PLANET_COLORS.mid;
  if (happiness >= 30) return PLANET_COLORS.early;
  return PLANET_COLORS.unloved;
};

export const selectCanEvolve = (state: GameState) => {
  const { cumulativeCare } = state.pet;
  const { stage } = state.pet;
  
  if (stage === 0 && cumulativeCare >= EVOLUTION_THRESHOLDS.HATCH) return true;
  if (stage === 1 && cumulativeCare >= EVOLUTION_THRESHOLDS.STAGE_2) return true;
  if (stage === 2 && cumulativeCare >= EVOLUTION_THRESHOLDS.STAGE_3) return true;
  return false;
};

export const selectExpression = (state: GameState) => {
  const happiness = state.pet.happiness;
  if (happiness >= 80) return 'happy';
  if (happiness >= 50) return 'neutral';
  if (happiness >= 30) return 'sad';
  return 'crying';
};
