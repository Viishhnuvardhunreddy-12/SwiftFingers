# Supabase Schema - Re-run Fix

## Issue Fixed

When re-running the SQL schema, you got this error:
```
ERROR: 42710: policy "Users can view own profile" for table "users" already exists
```

This happened because the policies were already created the first time you ran the schema.

## Solution Applied

Updated `supabase-schema.sql` to be **idempotent** (safe to run multiple times).

### What Changed

**Added DROP POLICY statements:**
```sql
-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.typing_sessions;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.typing_sessions;

-- Then create policies (will work even if they existed before)
CREATE POLICY "Users can view own profile" ...
```

### Already Using IF NOT EXISTS

The schema already had these safe statements:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS public.users ...
CREATE TABLE IF NOT EXISTS public.typing_sessions ...
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ...
```

## Now You Can Re-run Safely

The schema is now **idempotent**, meaning:

✅ **First run** - Creates everything
✅ **Second run** - Updates what changed, skips what exists
✅ **Third run** - Same as second run
✅ **No errors** - Safe to run anytime

## How to Re-run

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and Paste**
   - Open `supabase-schema.sql`
   - Copy ALL the content
   - Paste into SQL Editor

4. **Run**
   - Click "Run" button (or Ctrl+Enter)
   - Should complete without errors
   - Success message appears

## What Gets Updated

### On Re-run

**Tables:**
- ✅ Skipped (already exist)
- ✅ No data loss

**Indexes:**
- ✅ Skipped (already exist)
- ✅ No performance impact

**Policies:**
- ✅ Dropped and recreated
- ✅ Updated with any changes

**Views:**
- ✅ Replaced with new definition
- ✅ Security fix applied (SECURITY INVOKER)

**Functions:**
- ✅ Replaced with new definition
- ✅ No impact on existing data

**Triggers:**
- ✅ Dropped and recreated
- ✅ Updated with any changes

## When to Re-run

### You Should Re-run When:

✅ **Updating security settings** (like the SECURITY INVOKER fix)
✅ **Adding new policies**
✅ **Modifying views**
✅ **Updating functions**
✅ **Fixing bugs in the schema**

### You Don't Need to Re-run When:

❌ **Just adding data** (users, sessions)
❌ **App code changes** (TypeScript, React)
❌ **Environment variable changes**
❌ **Styling changes**

## Verification

After re-running, verify:

### 1. Check Tables
```sql
SELECT * FROM public.users LIMIT 1;
SELECT * FROM public.typing_sessions LIMIT 1;
```
Should return your existing data (no data loss).

### 2. Check Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```
Should show all 5 policies.

### 3. Check Views
```sql
SELECT * FROM public.leaderboard_wpm LIMIT 10;
SELECT * FROM public.user_stats LIMIT 10;
```
Should return data without errors.

### 4. Check for Warnings
- Go to Supabase Dashboard → Database → Views
- Click on `leaderboard_wpm`
- Should show **no security warnings**

## Troubleshooting

### Still getting errors?

**Error: "relation already exists"**
- This is fine, it means the table exists
- The script will skip it with `IF NOT EXISTS`

**Error: "policy already exists"**
- Make sure you have the `DROP POLICY IF EXISTS` lines
- Re-copy the schema from the file

**Error: "permission denied"**
- Make sure you're using the Supabase SQL Editor
- Don't run as a regular user, use the editor

### Data disappeared?

**Don't worry!** The schema doesn't delete data:
- `CREATE TABLE IF NOT EXISTS` - Skips if exists
- `DROP POLICY` - Only drops policies, not data
- `CREATE OR REPLACE VIEW` - Only updates view definition
- Your data is safe

### Need to start fresh?

If you want to completely reset:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS public.typing_sessions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Then run the full schema again
```

⚠️ **Only do this in development!** This deletes all user data.

## Best Practices

### Version Control

Keep track of schema changes:
```
v1.0 - Initial schema
v1.1 - Added SECURITY INVOKER to views
v1.2 - Made schema idempotent (this version)
```

### Testing

Test schema changes in a separate Supabase project first:
1. Create a test project
2. Run schema there
3. Test your app
4. If works, run in production

### Backup

Before major schema changes:
1. Go to Supabase Dashboard → Database → Backups
2. Create a manual backup
3. Then run schema changes
4. If issues, restore backup

## Summary

✅ **Schema is now idempotent**
✅ **Safe to re-run anytime**
✅ **No more "already exists" errors**
✅ **Policies drop and recreate**
✅ **Views update with new security settings**
✅ **No data loss**

## Files Modified

- ✏️ `supabase-schema.sql` - Added DROP POLICY IF EXISTS statements
- ✨ `SUPABASE_RERUN_FIX.md` - This documentation

**You can now re-run the schema without errors!** 🎉

## Quick Command

Just copy this entire file and run in Supabase SQL Editor:
```
supabase-schema.sql
```

That's it! No errors, no data loss, everything updates cleanly.
