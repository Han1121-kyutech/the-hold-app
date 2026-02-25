import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type GameSession = {
  id: string;
  session_id: string;
  user_id: string | null;
  start_time: string;
  end_time: string | null;
  duration: number;
  is_active: boolean;
  last_heartbeat: string;
  created_at: string;
};

export type LeaderboardEntry = {
  id: string;
  session_id: string;
  duration: number;
  player_name: string;
  created_at: string;
};
