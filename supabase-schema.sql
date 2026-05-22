-- SwiftFingers Database Schema
-- Run this in your Supabase SQL Editor
-- 
-- SAFE TO RE-RUN: This script uses IF NOT EXISTS and DROP IF EXISTS
-- so you can run it multiple times without errors.
--

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    username TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Typing sessions table
CREATE TABLE IF NOT EXISTS public.typing_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wpm INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    score INTEGER NOT NULL,
    duration_seconds NUMERIC NOT NULL,
    game_type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    char_errors JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.typing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.typing_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_wpm ON public.typing_sessions(wpm DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_game_type ON public.typing_sessions(game_type);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.typing_sessions;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can update their own data
CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.typing_sessions
    FOR INSERT
    WITH CHECK (user_id IN (
        SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.typing_sessions
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM public.users WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ));

-- Everyone can view leaderboard data (top scores)
CREATE POLICY "Anyone can view leaderboard"
    ON public.typing_sessions
    FOR SELECT
    USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (for re-running the script)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for leaderboard (top WPM by difficulty)
-- Using SECURITY INVOKER to respect RLS policies of the querying user
CREATE OR REPLACE VIEW public.leaderboard_wpm
WITH (security_invoker = true)
AS
SELECT 
    u.username,
    u.full_name,
    ts.wpm,
    ts.accuracy,
    ts.difficulty,
    ts.game_type,
    ts.created_at,
    ROW_NUMBER() OVER (PARTITION BY ts.difficulty ORDER BY ts.wpm DESC) as rank
FROM public.typing_sessions ts
JOIN public.users u ON ts.user_id = u.id
WHERE ts.wpm > 0
ORDER BY ts.difficulty, ts.wpm DESC;

-- View for user statistics
-- Using SECURITY INVOKER to respect RLS policies of the querying user
CREATE OR REPLACE VIEW public.user_stats
WITH (security_invoker = true)
AS
SELECT 
    u.id as user_id,
    u.clerk_user_id,
    u.username,
    COUNT(ts.id) as total_sessions,
    AVG(ts.wpm)::INTEGER as avg_wpm,
    MAX(ts.wpm) as best_wpm,
    AVG(ts.accuracy)::INTEGER as avg_accuracy,
    MAX(ts.accuracy) as best_accuracy,
    SUM(ts.duration_seconds) as total_time_seconds
FROM public.users u
LEFT JOIN public.typing_sessions ts ON u.id = ts.user_id
GROUP BY u.id, u.clerk_user_id, u.username;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.typing_sessions TO anon, authenticated;
GRANT SELECT ON public.leaderboard_wpm TO anon, authenticated;
GRANT SELECT ON public.user_stats TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'SwiftFingers database schema created successfully!';
    RAISE NOTICE 'Tables: users, typing_sessions';
    RAISE NOTICE 'Views: leaderboard_wpm, user_stats';
    RAISE NOTICE 'RLS policies enabled for security';
END $$;
