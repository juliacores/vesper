import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VibeType =
  | 'Domination'
  | 'Tenderness'
  | 'Praise'
  | 'Punishment'
  | 'Sleep Aid'
  | string;

export type PersonaType = 'Lucien' | 'Kai' | 'Jiro';

export type UserPreferences = {
  dynamic?: 'Submissive' | 'Dominant' | 'Switch' | 'Observer/Voyeur';
  tone?: 'Worship/Praise' | 'Degradation/Dirty' | 'Stern/Commanding' | 'Soft/Romantic';
  triggers?: string[];
  psychology?: string;
  hardLimits?: string[];
  safeword?: string;
  username?: string;
  pronouns?: 'She/Her' | 'He/Him' | 'They/Them';
};

interface AppState {
  // Current session state
  currentVibe: VibeType | null;
  selectedPersona: PersonaType | null;
  
  // User preferences
  userPreferences: UserPreferences;
  
  // Premium status
  isPremium: boolean;
  
  // Free tier usage
  freeGenerationsUsed: number;
  
  // Actions
  setCurrentVibe: (vibe: VibeType | null) => void;
  setSelectedPersona: (persona: PersonaType | null) => void;
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;
  setIsPremium: (isPremium: boolean) => void;
  incrementFreeGenerations: () => void;
  resetFreeGenerations: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentVibe: null,
      selectedPersona: null,
      userPreferences: {
        safeword: 'Red',
      },
      isPremium: false,
      freeGenerationsUsed: 0,

      // Actions
      setCurrentVibe: (vibe) => set({ currentVibe: vibe }),
      setSelectedPersona: (persona) => set({ selectedPersona: persona }),
      setUserPreferences: (preferences) =>
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences },
        })),
      setIsPremium: (isPremium) => set({ isPremium }),
      incrementFreeGenerations: () =>
        set((state) => ({
          freeGenerationsUsed: state.freeGenerationsUsed + 1,
        })),
      resetFreeGenerations: () => set({ freeGenerationsUsed: 0 }),
    }),
    {
      name: 'vesper-storage',
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        isPremium: state.isPremium,
        freeGenerationsUsed: state.freeGenerationsUsed,
      }),
    }
  )
);

