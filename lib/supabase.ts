import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          username: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          username?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          username?: string | null;
          full_name?: string | null;
          updated_at?: string;
        };
      };
      typing_sessions: {
        Row: {
          id: string;
          user_id: string;
          wpm: number;
          accuracy: number;
          score: number;
          duration_seconds: number;
          game_type: string;
          difficulty: string;
          char_errors: Record<string, number>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wpm: number;
          accuracy: number;
          score: number;
          duration_seconds: number;
          game_type: string;
          difficulty: string;
          char_errors: Record<string, number>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wpm?: number;
          accuracy?: number;
          score?: number;
          duration_seconds?: number;
          game_type?: string;
          difficulty?: string;
          char_errors?: Record<string, number>;
        };
      };
    };
  };
}
