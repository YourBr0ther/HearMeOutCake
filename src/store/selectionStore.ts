import { create } from 'zustand';
import { GAME_CONFIG } from '@/utils/constants';

interface SelectedFlag {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  source: 'camera' | 'library';
}

interface SelectionState {
  // Timer
  timeRemaining: number;
  timerActive: boolean;

  // Selected flags
  selectedFlags: SelectedFlag[];

  // Actions
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  setTimerActive: (active: boolean) => void;
  addFlag: (flag: SelectedFlag) => boolean;
  removeFlag: (id: string) => void;
  reorderFlags: (flags: SelectedFlag[]) => void;
  reset: () => void;
}

const initialState = {
  timeRemaining: GAME_CONFIG.TIMER_DURATION,
  timerActive: false,
  selectedFlags: [] as SelectedFlag[],
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

  reset: () => set(initialState),
}));
