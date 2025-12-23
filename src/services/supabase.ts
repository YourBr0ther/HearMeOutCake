import { createClient } from '@supabase/supabase-js';
import { API_CONFIG } from '@/utils/constants';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // No accounts needed
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Type for database tables
export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          theme: string;
          host_id: string;
          guest_id: string | null;
          phase: string;
          host_ready: boolean;
          guest_ready: boolean;
          host_submitted: boolean;
          guest_submitted: boolean;
          current_reveal_turn: string;
          created_at: string;
          expires_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          theme: string;
          host_id: string;
          guest_id?: string | null;
          phase?: string;
          host_ready?: boolean;
          guest_ready?: boolean;
          host_submitted?: boolean;
          guest_submitted?: boolean;
          current_reveal_turn?: string;
        };
        Update: Partial<{
          guest_id: string | null;
          phase: string;
          host_ready: boolean;
          guest_ready: boolean;
          host_submitted: boolean;
          guest_submitted: boolean;
          current_reveal_turn: string;
        }>;
      };
      flags: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          is_host: boolean;
          image_url: string;
          thumbnail_url: string | null;
          source: string;
          reveal_order: number;
          is_revealed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          is_host: boolean;
          image_url: string;
          thumbnail_url?: string | null;
          source: string;
          reveal_order: number;
          is_revealed?: boolean;
        };
        Update: Partial<{
          is_revealed: boolean;
        }>;
      };
    };
  };
};
