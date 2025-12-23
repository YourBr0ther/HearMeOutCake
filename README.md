# HearMeOutCake

A fun 2-player mobile game where players pick themed images ("flags") and reveal them on a virtual cake for discussion.

## How It Works

1. **Create or Join** - Player 1 creates a room with a theme (e.g., "Crazy person you would marry"), Player 2 joins via 6-character room code
2. **Pick Your Flags** - Each player has 10 minutes to select 5 images from their camera roll or take photos
3. **Reveal & Discuss** - Players take turns revealing their flags stuck in a virtual cake and defend their choices!

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Navigation**: Expo Router v6 (file-based routing)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Animations**: React Native Reanimated

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/YourBr0ther/HearMeOutCake.git
cd HearMeOutCake

# Install dependencies
npm install

# Start the development server
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- See supabase-schema.sql for the full schema
```

## Project Structure

```
HearMeOutCake/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── create-game.tsx    # Create room
│   ├── join-game.tsx      # Join room
│   ├── waiting-room.tsx   # Lobby
│   ├── selection.tsx      # Pick flags
│   └── reveal.tsx         # Cake reveal
├── src/
│   ├── components/ui/     # Reusable UI components
│   ├── services/          # Supabase & API services
│   ├── store/             # Zustand state stores
│   ├── theme/             # Colors & styling
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── assets/                # Images & icons
```

## Running on Different Platforms

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# Expo Go (scan QR code)
npm start
```

## License

MIT
