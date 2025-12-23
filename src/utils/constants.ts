// Game configuration
export const GAME_CONFIG = {
  TIMER_DURATION: 10 * 60, // 10 minutes in seconds
  MAX_FLAGS: 5,
  ROOM_CODE_LENGTH: 6,
  ROOM_EXPIRY_HOURS: 2,
} as const;

// API endpoints (placeholder - update with real Supabase URL)
export const API_CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  PEXELS_API_KEY: process.env.EXPO_PUBLIC_PEXELS_API_KEY || '',
} as const;

// Theme suggestions for creating games
export const THEME_SUGGESTIONS = [
  'Crazy person you would marry',
  'Cartoon character you relate to',
  'Celebrity you would want as a roommate',
  'Fictional villain you secretly like',
  'Food that describes your personality',
  'Animal that represents you',
  'Movie character you would date',
  'Historical figure you would party with',
] as const;
