export type GamePhase =
  | 'idle'
  | 'creating'
  | 'joining'
  | 'waiting'
  | 'ready'
  | 'selecting'
  | 'waiting_selections'
  | 'revealing'
  | 'finished';

export interface GameRoom {
  id: string;
  code: string;
  theme: string;
  host_id: string;
  guest_id: string | null;
  phase: GamePhase;
  host_ready: boolean;
  guest_ready: boolean;
  host_submitted: boolean;
  guest_submitted: boolean;
  current_reveal_turn: 'host' | 'guest';
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface Flag {
  id: string;
  room_id: string;
  player_id: string;
  is_host: boolean;
  image_url: string;
  thumbnail_url?: string;
  source: 'search' | 'camera' | 'library';
  reveal_order: number;
  is_revealed: boolean;
  created_at: string;
}

export interface Player {
  id: string;
  isHost: boolean;
  isReady: boolean;
  flags: Flag[];
  hasSubmitted: boolean;
}

export interface RevealState {
  currentPlayerTurn: 'host' | 'guest';
  currentFlagIndex: number;
  revealedFlags: {
    host: number[];
    guest: number[];
  };
}

