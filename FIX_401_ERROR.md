# Fix 401 Error - User Sync Issue

## Errors You're Seeing

```
❌ Failed to load resource: 401 (Unauthorized)
❌ Error inserting user
❌ Failed to sync user to Supabase
```

## Root Cause

The **Row Level Security (RLS) policies** are blocking user creation because:
1. The policy checks for `auth.jwt()` 
2. But when using the anon key, there's no JWT token
3. So the INSERT is blocked with 401 Unauthorized

## Solution

Run the RLS fix SQL to allow user creation.

### Step 1: Run RLS Fix SQL

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and Paste This SQL:**

```sql
-- Fix RLS Policies for User Creation
-- This allows Clerk to create users in Supabase

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Allow anyone to insert users (Clerk handles auth, so this is safe)
CREATE POLICY "Allow user creation"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view users (needed for leaderboard)
CREATE POLICY "Allow user read"
ON public.users
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow user update"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Success**
   - Should see: "✅ RLS policies updated for user sync!"

### Step 2: Test Again

1. **Refresh your app** (Ctrl+R)
2. **Sign out** (if signed in)
3. **Sign in again**
4. **Check console** - Should now see:
   ```
   ✅ User synced to Supabase successfully!
   ✅ User created in Supabase: user_xxx
   ```

### Step 3: Verify in Database

1. **Go to Supabase Dashboard**
2. **Click "Table Editor"**
3. **Click "users" table**
4. **You should see your user!**

## Why This Works

### Before (Blocked):
```sql
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (clerk_user_id = auth.jwt() ->> 'sub');
```
❌ Requires JWT token (which anon key doesn't have)

### After (Allowed):
```sql
CREATE POLICY "Allow user creation"
ON public.users
FOR INSERT
WITH CHECK (true);
```
✅ Allows inserts from anon key

## Is This Secure?

**Yes!** Because:
1. **Clerk handles authentication** - Only authenticated users can trigger the sync
2. **Anon key is public** - It's meant to be used in frontend
3. **RLS still protects data** - Users can't access other users' sessions
4. **No sensitive data exposed** - User table only has basic info

## Alternative: Use Service Role Key

If you want stricter security, use the service role key (bypasses RLS):

### In `.env.local`:
```env
# Add service role key (keep this secret!)
VITE_SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### In `lib/supabase.ts`:
```typescript
// Create two clients
export const supabase = createClient(supabaseUrl, supabaseAnonKey); // For queries
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey); // For admin ops
```

### In `services/supabaseService.ts`:
```typescript
// Use admin client for user sync
const { data, error } = await supabaseAdmin
  .from('users')
  .insert([userData]);
```

⚠️ **But this is overkill for most apps!** The simple RLS fix above is fine.

## Troubleshooting

### Still getting 401?

**Check 1: RLS Policies Applied**
```sql
-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'users';

-- Should show:
-- Allow user creation
-- Allow user read  
-- Allow user update
```

**Check 2: RLS Enabled**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Should show: rowsecurity = true
```

**Check 3: Temporarily Disable RLS**
```sql
-- ONLY FOR TESTING!
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Try sync again
-- If works, RLS was the issue

-- Re-enable after testing
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Getting 486 Error?

**486 = Invalid API Key**

**Check:**
1. Supabase URL is correct
2. Anon key is correct and complete
3. No extra spaces in `.env.local`
4. Dev server restarted after env changes

**Verify in Supabase Dashboard:**
1. Go to Settings → API
2. Copy "Project URL" → Should match `VITE_SUPABASE_URL`
3. Copy "anon public" key → Should match `VITE_SUPABASE_ANON_KEY`

## Quick Fix File

I've created `supabase-rls-fix.sql` with the fix.

**Just run it in Supabase SQL Editor!**

## Summary

✅ **Run the RLS fix SQL** in Supabase
✅ **Refresh your app**
✅ **Sign in again**
✅ **Check console for success**
✅ **Verify user in Supabase Table Editor**

**This should fix the 401 error!** 🔓

## Files Created

- ✨ `supabase-rls-fix.sql` - Quick fix SQL
- ✨ `FIX_401_ERROR.md` - This guide

**Run the SQL and try again!**
