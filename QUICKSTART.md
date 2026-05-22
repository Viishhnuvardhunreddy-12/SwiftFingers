# 🚀 Quick Start - Clerk Authentication

## Get Up and Running in 5 Minutes

### Step 1: Create Clerk Account (2 minutes)
1. Go to **https://clerk.com**
2. Click "Start Building for Free"
3. Sign up with your email or GitHub
4. Create a new application
5. Name it "SwiftFingers" (or anything you like)

### Step 2: Get Your Key (1 minute)
1. In Clerk dashboard, click **"API Keys"** in sidebar
2. Find **"Publishable Key"** section
3. Click the copy icon next to the key (starts with `pk_test_`)
4. Keep this tab open - you'll need it in a moment

### Step 3: Add Key to Project (1 minute)
1. Open `.env.local` in your project
2. Find this line:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   ```
3. Replace `your_clerk_publishable_key_here` with your actual key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_abc123xyz...
   ```
4. Save the file

### Step 4: Restart Dev Server (1 minute)
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test It! (30 seconds)
1. Open **http://localhost:5173**
2. Look for **"Sign In"** button in top-right corner
3. Click it - Clerk modal should open
4. Sign up with your email
5. After signing in, you should see your avatar in the header
6. Click the avatar to see account options

## ✅ Success Checklist

- [ ] Clerk account created
- [ ] Publishable key copied
- [ ] Key added to `.env.local`
- [ ] Dev server restarted
- [ ] "Sign In" button visible
- [ ] Modal opens when clicked
- [ ] Can create account
- [ ] Avatar appears after sign-in
- [ ] Analytics show user-specific data

## 🎯 What You Can Do Now

### As a Signed-In User
- ✅ Your typing sessions are saved to your account
- ✅ Stats are personalized to you
- ✅ Data persists across browser sessions
- ✅ Access account settings via avatar dropdown

### Coming Soon (Supabase Integration)
- 🔜 Access your data from any device
- 🔜 Compete on global leaderboards
- 🔜 Challenge friends
- 🔜 Unlock achievements

## 🐛 Troubleshooting

### "Missing Clerk Publishable Key" Error
**Problem**: Key not found in environment
**Solution**: 
1. Check `.env.local` has the key
2. Make sure it starts with `pk_test_` or `pk_live_`
3. Restart dev server after adding key

### Sign-In Button Not Showing
**Problem**: Clerk not initialized
**Solution**:
1. Check browser console for errors
2. Verify `@clerk/clerk-react` is installed: `npm list @clerk/clerk-react`
3. Clear browser cache and reload

### Modal Opens But Can't Sign In
**Problem**: Clerk app not configured
**Solution**:
1. Go to Clerk dashboard
2. Click "User & Authentication"
3. Enable at least one sign-in method (Email recommended)
4. Save changes and try again

### Avatar Not Appearing After Sign-In
**Problem**: Component not rendering
**Solution**:
1. Check browser console for errors
2. Hard refresh page (Ctrl+Shift+R)
3. Try signing out and back in

## 📞 Need Help?

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Discord**: https://clerk.com/discord
- **GitHub Issues**: [Your repo URL]

## 🎉 You're All Set!

Authentication is now working. Users can:
- Sign in with email
- Save their typing progress
- View personalized analytics
- Access their account settings

Next step: Add Supabase for cloud storage and leaderboards!
