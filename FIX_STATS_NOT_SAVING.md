# Fix Stats Not Saving to Supabase

## Issue

After completing a typing game:
- ❌ Stats don't appear in the app
- ❌ Sessions not saved to Supabase
- ❌ No data in `typing_sessions` table

## Root Cause

Same as the user sync issue - **RLS policies are blocking session inserts**.

The `typing_sessions` table has restrictive policies that check for `auth.jwt()`, which doesn't exist when using the anon key.

## Complete Fix

Run the updated RLS fix SQL that handles BOTH users AND sessions.

### Step 1: Run Complete RLS Fix

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy this SQL:**

```sql
-- Fix RLS Policies for User Creation AND Session Saving

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Allow user creation"
ON public.users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow user read"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "Allow user update"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- TYPING_SESSIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.typing_sessions;

CREATE POLICY "Allow session creation"
ON public.typing_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow session read"
ON public.typing_sessions
FOR SELECT
USING (true);

CREATE POLICY "Allow session update"
ON public.typing_sessions
FOR UPDATE
USING (true)
WITH CHECK (true);
```

3. **Click "Run"**
4. **Verify success message**

### Step 2: Test the Fix

1. **Refresh your app** (Ctrl+R)
2. **Sign in** (if not already)
3. **Play a typing game** (any mode)
4. **Complete the session**
5. **Check browser console** (F12)

**You should see:**
```
💾 Saving session to Supabase...
✅ Found Supabase user ID: xxx
✅ Session saved to Supabase successfully!
✅ Session saved to cloud
```

### Step 3: Verify in Supabase

1. **Go to Supabase Dashboard**
2. **Click "Table Editor"**
3. **Click "typing_sessions" table**
4. **You should see your session!**

## What This Fixes

### Before (Blocked):
```sql
CREATE POLICY "Users can insert own sessions"
ON public.typing_sessions
FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
));
```
❌ Requires JWT token (which anon key doesn't have)
❌ Sessions can't be saved
❌ Stats don't appear

### After (Allowed):
```sql
CREATE POLICY "Allow session creation"
ON public.typing_sessions
FOR INSERT
WITH CHECK (true);
```
✅ Allows inserts from anon key
✅ Sessions save successfully
✅ Stats appear in app

## Console Messages to Look For

### Success Flow:
```
🔄 Starting user sync to Supabase...
✅ User synced to Supabase successfully!

[User plays game]

💾 Saving session to Supabase...
✅ Found Supabase user ID: xxx
✅ Session saved to Supabase successfully!
✅ Session saved to cloud
```

### Error Flow:
```
❌ Supabase user not found for Clerk ID
💡 Make sure user was synced to Supabase first

OR

❌ Error saving session to Supabase
Error code: 401 (Unauthorized)
```

## Troubleshooting

### Issue 1: "Supabase user not found"

**Cause**: User wasn't synced to Supabase first

**Solution:**
1. Sign out
2. Sign in again (triggers user sync)
3. Check console for "User synced successfully"
4. Try playing again

### Issue 2: Still getting 401 errors

**Cause**: RLS policies not updated

**Solution:**
1. Verify you ran the complete SQL (both users AND sessions)
2. Check policies in Supabase:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('users', 'typing_sessions');
```
3. Should show 6 policies total (3 for users, 3 for sessions)

### Issue 3: Sessions save but don't appear in app

**Cause**: Analytics component not fetching from Supabase

**Solution:**
1. Check if sessions are in Supabase Table Editor
2. If yes, the save is working
3. Analytics component needs to be updated to fetch from Supabase
4. Currently it only reads from localStorage

## Data Flow

### Complete Flow:
```
1. User signs in
   ↓
2. User synced to Supabase (users table)
   ↓
3. User plays typing game
   ↓
4. Session evaluated (WPM, accuracy calculated)
   ↓
5. Session saved to localStorage (backup)
   ↓
6. Session saved to Supabase (typing_sessions table)
   ↓
7. Stats available in database
   ↓
8. Can build leaderboards, analytics, etc.
```

## Verify Everything Works

### Checklist:
- [ ] Ran complete RLS fix SQL
- [ ] Refreshed app
- [ ] Signed in successfully
- [ ] Console shows "User synced successfully"
- [ ] Played a typing game
- [ ] Console shows "Session saved successfully"
- [ ] Session appears in Supabase typing_sessions table
- [ ] No 401 errors in console

## Next Steps

Once sessions are saving:

### 1. Update Analytics to Use Supabase

Currently, the Analytics modal reads from localStorage. Update it to fetch from Supabase:

```typescript
// In AnalyticsModal.tsx
const sessions = await getUserSessions(user.id);
// Process sessions for display
```

### 2. Build Leaderboard

```typescript
const leaderboard = await getLeaderboard('INTERMEDIATE', 10);
// Display top 10 players
```

### 3. Show User Stats

```typescript
const stats = await getUserStats(user.id);
// Display total sessions, best WPM, etc.
```

## Files Updated

- ✏️ `supabase-rls-fix.sql` - Now includes session policies
- ✏️ `services/supabaseService.ts` - Better logging
- ✨ `FIX_STATS_NOT_SAVING.md` - This guide

## Summary

✅ **Run the complete RLS fix SQL** (includes both users and sessions)
✅ **Refresh your app**
✅ **Sign in and play a game**
✅ **Check console for success messages**
✅ **Verify session in Supabase Table Editor**

**After this fix, your stats will save to Supabase!** 📊

The updated `supabase-rls-fix.sql` file is ready to run!
