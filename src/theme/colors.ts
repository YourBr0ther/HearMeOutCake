export const colors = {
  // Primary Colors - Duolingo Green
  primary: {
    DEFAULT: '#58CC02',
    dark: '#58A700',
    light: '#89E219',
  },

  // Secondary Colors
  orange: {
    DEFAULT: '#FF9600',
    light: '#FFC800',
  },
  purple: {
    DEFAULT: '#CE82FF',
    dark: '#A560E8',
  },
  blue: {
    DEFAULT: '#1CB0F6',
    dark: '#1899D6',
  },
  pink: {
    DEFAULT: '#FF4B4B',
  },
  yellow: {
    DEFAULT: '#FFD700',
  },

  // Pastel Backgrounds
  pastel: {
    mint: '#E5FFCC',
    lavender: '#F3E5FF',
    peach: '#FFE8CC',
    sky: '#E5F6FF',
    cream: '#FFF7E0',
  },

  // Neutrals
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    dark: '#3C3C3C',
    gray: '#777777',
  },

  // Cake colors
  cake: {
    frosting: '#FFB6C1',
    base: '#DEB887',
    plate: '#FFFFFF',
  },

  // Player colors
  player: {
    host: '#58CC02',
    guest: '#CE82FF',
  },
} as const;

// Gradient presets
export const gradients = {
  primary: ['#89E219', '#58CC02'] as const,
  sunset: ['#FF9600', '#FF4B4B'] as const,
  party: ['#CE82FF', '#1CB0F6'] as const,
  celebration: ['#FFD700', '#FF9600'] as const,
} as const;
