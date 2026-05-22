-- Add Session Policies Only
-- Run this if you already fixed user policies

-- Drop existing restrictive session policies
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.typing_sessions;

-- Allow anyone to insert sessions (app handles user validation)
CREATE POLICY "Allow session creation"
ON public.typing_sessions
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view sessions (needed for leaderboard and stats)
CREATE POLICY "Allow session read"
ON public.typing_sessions
FOR SELECT
USING (true);

-- Allow session updates (for corrections if needed)
CREATE POLICY "Allow session update"
ON public.typing_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Session policies updated!';
    RAISE NOTICE '✅ Sessions can now be saved to Supabase';
    RAISE NOTICE '✅ Stats will now appear in the app';
END $$;
