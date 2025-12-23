-- HearMeOutCake Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/ozfeanbxudlzuhbfwqby/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  theme TEXT NOT NULL,
  host_id VARCHAR(36) NOT NULL,
  guest_id VARCHAR(36),
  host_ready BOOLEAN DEFAULT FALSE,
  guest_ready BOOLEAN DEFAULT FALSE,
  phase VARCHAR(20) DEFAULT 'waiting' CHECK (phase IN (
    'waiting', 'ready', 'selecting', 'waiting_selections', 'revealing', 'finished'
  )),
  host_submitted BOOLEAN DEFAULT FALSE,
  guest_submitted BOOLEAN DEFAULT FALSE,
  current_reveal_turn VARCHAR(10) DEFAULT 'host' CHECK (current_reveal_turn IN ('host', 'guest')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '2 hours',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flags table
CREATE TABLE IF NOT EXISTS flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(36) NOT NULL,
  is_host BOOLEAN NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source VARCHAR(10) NOT NULL CHECK (source IN ('camera', 'library')),
  reveal_order INTEGER NOT NULL CHECK (reveal_order >= 1 AND reveal_order <= 5),
  is_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id, reveal_order)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_expires ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_flags_room ON flags(room_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rooms_updated_at ON rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security (RLS) - Allow all for now (no auth required)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all room operations" ON rooms;
CREATE POLICY "Allow all room operations" ON rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all flag operations" ON flags;
CREATE POLICY "Allow all flag operations" ON flags FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE flags;
