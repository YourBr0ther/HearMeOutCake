import { create } from 'zustand';
import type { ImageSearchResult } from '@/types/game';
import { GAME_CONFIG } from '@/utils/constants';

interface SelectedFlag {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: 'search' | 'camera' | 'library';
}

interface SelectionState {
  // Timer
  timeRemaining: number;
  timerActive: boolean;

  // Selected flags
  selectedFlags: SelectedFlag[];

  // Search state
  searchQuery: string;
  searchResults: ImageSearchResult[];
  isSearching: boolean;

  // Active tab
  activeTab: 'search' | 'camera' | 'library';

  // Actions
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  setTimerActive: (active: boolean) => void;
  addFlag: (flag: SelectedFlag) => boolean;
  removeFlag: (id: string) => void;
  reorderFlags: (flags: SelectedFlag[]) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: ImageSearchResult[]) => void;
  setIsSearching: (searching: boolean) => void;
  setActiveTab: (tab: 'search' | 'camera' | 'library') => void;
  reset: () => void;
}

const initialState = {
  timeRemaining: GAME_CONFIG.TIMER_DURATION,
  timerActive: false,
  selectedFlags: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  activeTab: 'search' as const,
};

export const useSelectionStore = create<SelectionState>((set, get) => ({
  ...initialState,

  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),

  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),

  setTimerActive: (timerActive) => set({ timerActive }),

  addFlag: (flag) => {
    const { selectedFlags } = get();
    if (selectedFlags.length >= GAME_CONFIG.MAX_FLAGS) {
      return false;
    }
    if (selectedFlags.some((f) => f.id === flag.id)) {
      return false;
    }
    set({ selectedFlags: [...selectedFlags, flag] });
    return true;
  },

  removeFlag: (id) =>
    set((state) => ({
      selectedFlags: state.selectedFlags.filter((f) => f.id !== id),
    })),

  reorderFlags: (selectedFlags) => set({ selectedFlags }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setActiveTab: (activeTab) => set({ activeTab }),

  reset: () => set(initialState),
}));
