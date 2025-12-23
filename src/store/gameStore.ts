import { create } from 'zustand';
import type { GamePhase, GameRoom, Flag } from '@/types/game';

interface GameState {
  // Room state
  room: GameRoom | null;
  playerId: string | null;
  isHost: boolean;

  // Game phase
  phase: GamePhase;

  // Player states
  isReady: boolean;
  opponentReady: boolean;
  hasSubmitted: boolean;
  opponentSubmitted: boolean;

  // Flags
  myFlags: Flag[];
  opponentFlags: Flag[];

  // Reveal state
  currentRevealTurn: 'host' | 'guest';
  revealedHostFlags: number[];
  revealedGuestFlags: number[];

  // Actions
  setRoom: (room: GameRoom | null) => void;
  setPlayerId: (id: string) => void;
  setIsHost: (isHost: boolean) => void;
  setPhase: (phase: GamePhase) => void;
  setReady: (ready: boolean) => void;
  setOpponentReady: (ready: boolean) => void;
  setHasSubmitted: (submitted: boolean) => void;
  setOpponentSubmitted: (submitted: boolean) => void;
  setMyFlags: (flags: Flag[]) => void;
  setOpponentFlags: (flags: Flag[]) => void;
  setCurrentRevealTurn: (turn: 'host' | 'guest') => void;
  revealFlag: (isHost: boolean, flagIndex: number) => void;
  reset: () => void;
}

const initialState = {
  room: null,
  playerId: null,
  isHost: false,
  phase: 'idle' as GamePhase,
  isReady: false,
  opponentReady: false,
  hasSubmitted: false,
  opponentSubmitted: false,
  myFlags: [],
  opponentFlags: [],
  currentRevealTurn: 'host' as const,
  revealedHostFlags: [],
  revealedGuestFlags: [],
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setRoom: (room) => set({ room }),
  setPlayerId: (playerId) => set({ playerId }),
  setIsHost: (isHost) => set({ isHost }),
  setPhase: (phase) => set({ phase }),
  setReady: (isReady) => set({ isReady }),
  setOpponentReady: (opponentReady) => set({ opponentReady }),
  setHasSubmitted: (hasSubmitted) => set({ hasSubmitted }),
  setOpponentSubmitted: (opponentSubmitted) => set({ opponentSubmitted }),
  setMyFlags: (myFlags) => set({ myFlags }),
  setOpponentFlags: (opponentFlags) => set({ opponentFlags }),
  setCurrentRevealTurn: (currentRevealTurn) => set({ currentRevealTurn }),

  revealFlag: (isHost, flagIndex) =>
    set((state) => ({
      revealedHostFlags: isHost
        ? [...state.revealedHostFlags, flagIndex]
        : state.revealedHostFlags,
      revealedGuestFlags: !isHost
        ? [...state.revealedGuestFlags, flagIndex]
        : state.revealedGuestFlags,
    })),

  reset: () => set(initialState),
}));
