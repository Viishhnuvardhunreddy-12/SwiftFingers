# Supabase User Sync - Debugging Guide

## Issue

Users are signing up/signing in with Clerk, but their information is not being stored in Supabase.

## What I Added

### 1. Enhanced Logging

**Updated `hooks/useSupabaseSync.ts`:**
- Added detailed console logs
- Shows sync status (idle, syncing, success, error)
- Logs user details being synced
- Better error messages

### 2. Connection Test

**Created `services/supabaseTest.ts`:**
- Tests Supabase connection
- Verifies environment variables
- Tests database access
- Runs automatically on app load

### 3. Automatic Testing

**Updated `App.tsx`:**
- Runs connection test on mount
- Shows sync status in console
- Helps identify issues quickly

## How to Debug

### Step 1: Check Browser Console

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Sign in to your app**
4. **Look for these messages:**

**✅ Success Messages:**
```
🧪 Testing Supabase connection...
✅ Supabase client initialized
✅ Successfully queried users table
✅ Environment variables configured
📍 Supabase URL: https://qvhsgdxcionsfpemivjj.supabase.co

🔄 Starting user sync to Supabase...
✅ User synced to Supabase successfully!
✅ User created in Supabase: user_xxx
```

**❌ Error Messages:**
```
❌ Supabase client not initialized
❌ Error querying users table
❌ Supabase environment variables not set
❌ Failed to sync user to Supabase
```

### Step 2: Verify Environment Variables

**Check `.env.local`:**
```env
VITE_SUPABASE_URL=https://qvhsgdxcionsfpemivjj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Make sure:**
- ✅ Both variables are set
- ✅ No typos in variable names
- ✅ Keys are complete (not truncated)
- ✅ No extra spaces or quotes

**After changing `.env.local`:**
```bash
# MUST restart dev server!
npm run dev
```

### Step 3: Check Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Check Tables**
   - Click "Table Editor"
   - Look for `users` table
   - Check if it exists

3. **Check RLS Policies**
   - Click "Authentication" → "Policies"
   - Verify policies exist for `users` table
   - Should see 2 policies:
     - "Users can view own profile"
     - "Users can update own profile"

4. **Check API Keys**
   - Click "Settings" → "API"
   - Verify "anon public" key matches your `.env.local`

### Step 4: Test Manual Insert

**In Supabase SQL Editor:**
```sql
-- Try to insert a test user
INSERT INTO public.users (clerk_user_id, email, username)
VALUES ('test_123', 'test@example.com', 'testuser');

-- Check if it worked
SELECT * FROM public.users WHERE clerk_user_id = 'test_123';

-- Clean up
DELETE FROM public.users WHERE clerk_user_id = 'test_123';
```

**If this fails:**
- RLS policies might be too restrictive
- Table might not exist
- Permissions might be wrong

## Common Issues & Solutions

### Issue 1: "Supabase client not initialized"

**Cause**: Environment variables not loaded

**Solution:**
1. Check `.env.local` exists
2. Verify variable names start with `VITE_`
3. Restart dev server
4. Hard refresh browser (Ctrl+Shift+R)

### Issue 2: "Error querying users table"

**Cause**: Table doesn't exist or RLS blocking

**Solution:**
1. Run `supabase-schema.sql` in Supabase SQL Editor
2. Verify `users` table exists in Table Editor
3. Check RLS policies are created

### Issue 3: "Error inserting user"

**Possible Causes:**

**A. RLS Policy Too Restrictive**
```sql
-- The policy checks for auth.jwt()
-- But anon key doesn't have JWT
-- Solution: Temporarily disable RLS for testing

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Try sync again
-- If works, RLS is the issue
```

**B. Missing Columns**
```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Should have:
-- id, clerk_user_id, email, username, full_name, created_at, updated_at
```

**C. Unique Constraint Violation**
```sql
-- User might already exist
SELECT * FROM public.users WHERE clerk_user_id = 'user_xxx';

-- If exists, sync should UPDATE not INSERT
-- Check console for "User updated" message
```

### Issue 4: "No error but user not in database"

**Cause**: Silent failure or RLS blocking SELECT

**Solution:**
1. Check console for ALL messages
2. Look for "User created" or "User updated"
3. Query database directly:
```sql
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 10;
```
4. If empty, RLS might be blocking INSERT
5. Temporarily disable RLS to test

## RLS Policy Fix

If RLS is blocking inserts, update the policy:

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create new policy that allows anon inserts
CREATE POLICY "Allow anon user creation"
ON public.users
FOR INSERT
WITH CHECK (true);

-- This allows anyone to create users
-- Secure because Clerk handles auth
```

## Testing Checklist

- [ ] Environment variables set in `.env.local`
- [ ] Dev server restarted after env changes
- [ ] Browser console shows connection test success
- [ ] `users` table exists in Supabase
- [ ] RLS policies created
- [ ] Can manually insert into `users` table
- [ ] Console shows "User synced successfully"
- [ ] User appears in Supabase Table Editor

## Manual Test Function

Add this to your browser console:

```javascript
// Test Supabase connection
await testSupabaseConnection();

// Test user insert
await testUserInsert();
```

These functions are now available globally when the app loads.

## Expected Console Output

### On App Load:
```
🧪 Testing Supabase connection...
✅ Supabase client initialized
✅ Successfully queried users table
📊 Current user count: [...]
✅ Environment variables configured
📍 Supabase URL: https://qvhsgdxcionsfpemivjj.supabase.co
```

### On Sign In:
```
🔄 Starting user sync to Supabase...
{userId: "user_xxx", email: "user@example.com", username: "username"}
✅ User synced to Supabase successfully!
{clerkUserId: "user_xxx", supabaseUserId: "uuid-here"}
✅ User created in Supabase: user_xxx
```

### On Subsequent Sign Ins:
```
🔄 Starting user sync to Supabase...
✅ User synced to Supabase successfully!
✅ User updated in Supabase: user_xxx
```

## Files Modified

- ✏️ `hooks/useSupabaseSync.ts` - Added detailed logging
- ✏️ `App.tsx` - Added connection test on mount
- ✨ `services/supabaseTest.ts` - New test utilities
- ✨ `SUPABASE_USER_SYNC_DEBUG.md` - This guide

## Next Steps

1. **Restart your dev server**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Sign in to your app**

4. **Check console messages**
   - Look for ✅ success or ❌ error messages
   - Share any error messages you see

5. **Check Supabase Dashboard**
   - Go to Table Editor → users
   - See if your user appears

**Share the console output with me and I can help debug further!** 🔍
