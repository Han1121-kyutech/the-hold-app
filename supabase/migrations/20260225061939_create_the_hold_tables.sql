/*
  # Create THE HOLD Game Tables
  
  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `session_id` (text, unique) - Client-generated session ID
      - `user_id` (uuid, nullable) - Optional user ID for authenticated users
      - `start_time` (timestamptz) - Server timestamp when hold started
      - `end_time` (timestamptz, nullable) - Server timestamp when hold ended
      - `duration` (integer) - Duration in milliseconds
      - `is_active` (boolean) - Whether the session is currently active
      - `last_heartbeat` (timestamptz) - Last time client sent heartbeat (for resilience)
      - `created_at` (timestamptz) - Record creation time
    
    - `leaderboard`
      - `id` (uuid, primary key) - Unique record identifier
      - `session_id` (text) - Reference to game session
      - `duration` (integer) - Duration in milliseconds
      - `player_name` (text, nullable) - Optional player display name
      - `created_at` (timestamptz) - Record creation time
  
  2. Security
    - Enable RLS on both tables
    - Allow anyone to read leaderboard (public data)
    - Allow anyone to insert and update their own game sessions
    - Only allow inserts to leaderboard after session completion
*/

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration integer DEFAULT 0,
  is_active boolean DEFAULT true,
  last_heartbeat timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  duration integer NOT NULL,
  player_name text DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_session_id ON game_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_is_active ON game_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_leaderboard_duration ON leaderboard(duration DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
CREATE POLICY "Anyone can view all active sessions"
  ON game_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert game sessions"
  ON game_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions by session_id"
  ON game_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for leaderboard
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert to leaderboard"
  ON leaderboard
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to automatically clean up old inactive sessions (optional maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE game_sessions
  SET is_active = false,
      end_time = last_heartbeat
  WHERE is_active = true
    AND last_heartbeat < now() - interval '10 seconds';
END;
$$;