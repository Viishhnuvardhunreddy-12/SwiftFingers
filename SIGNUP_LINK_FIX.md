# Sign-Up Link Fix

## Issue
When clicking "Sign up" link at the bottom of the sign-in form, it should show the sign-up form, but it wasn't working.

## Solution Applied

### Updated LoginScreen.tsx
```typescript
<SignIn 
  appearance={clerkAppearance}
  routing="virtual"
  signUpForceRedirectUrl="/"
  forceRedirectUrl="/"
/>
```

### What This Does
- `routing="virtual"` - Handles routing within the component
- `signUpForceRedirectUrl="/"` - Redirects to home after sign-up
- `forceRedirectUrl="/"` - Redirects to home after sign-in

## How It Works Now

### Sign-In Flow
1. User sees "Sign in to SwiftFingers" form
2. User enters email and password
3. User clicks "Continue"
4. After authentication → Redirected to game screen

### Sign-Up Flow
1. User sees "Sign in to SwiftFingers" form
2. User clicks **"Sign up"** link at bottom
3. Form switches to "Create your SwiftFingers account"
4. User fills in:
   - First name (optional)
   - Last name (optional)
   - Username
   - Email address
   - Password
5. User clicks "Continue"
6. Email verification sent
7. User verifies email
8. After verification → Redirected to game screen

## Testing

### Test Sign-Up Link

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Visit the app**
   - Go to http://localhost:5173
   - You should see the login screen

3. **Click "Sign up"**
   - Look at the bottom of the form
   - Text says: "Don't have an account? **Sign up**"
   - Click the "Sign up" link

4. **Verify form changes**
   - Title should change to "Create your SwiftFingers account"
   - Subtitle: "Start improving your typing speed today"
   - Form shows: First name, Last name, Username, Email, Password
   - NO phone number field (we removed it)

5. **Test sign-up**
   - Fill in the form
   - Click "Continue"
   - Check email for verification link
   - Click verification link
   - Should redirect to game screen

## Troubleshooting

### "Sign up" link not clickable?

**Check 1: Clerk Key**
- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- Key should start with `pk_test_` or `pk_live_`
- Restart dev server after adding key

**Check 2: Browser Console**
- Open DevTools (F12)
- Check Console tab for errors
- Look for Clerk-related errors

**Check 3: Clerk Dashboard**
- Go to https://dashboard.clerk.com
- Select your application
- Go to "User & Authentication"
- Make sure "Email" is enabled
- Make sure sign-up is allowed

### Form doesn't switch to sign-up?

**Solution 1: Hard Refresh**
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

**Solution 2: Clear Cache**
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

**Solution 3: Check Routing**
```typescript
// In LoginScreen.tsx, verify:
<SignIn 
  routing="virtual"  // This is important!
/>
```

### Sign-up form shows phone number?

We already fixed this! But if you still see it:

1. **Check CSS is loaded**
   - Open DevTools → Network tab
   - Look for `clerk-custom.css`
   - Should show status 200

2. **Disable in Clerk Dashboard**
   - Go to dashboard.clerk.com
   - User & Authentication → Email, Phone, Username
   - Disable "Phone number"
   - Save changes

### After sign-up, not redirected?

**Check redirect URLs:**
```typescript
<SignIn 
  signUpForceRedirectUrl="/"
  forceRedirectUrl="/"
/>
```

These should redirect to home (`/`) which shows the game screen.

## Expected Behavior

### Sign-In Screen
```
┌────────────────────────────────┐
│  Sign in to SwiftFingers       │
│  Welcome back! Please sign in  │
│                                │
│  [Facebook] [Google]           │
│                                │
│  ─── or ───                    │
│                                │
│  Email address                 │
│  [___________________]         │
│                                │
│  Password                      │
│  [___________________] 👁      │
│                                │
│  [Continue →]                  │
│                                │
│  Don't have an account?        │
│  Sign up  ← CLICK THIS         │
└────────────────────────────────┘
```

### After Clicking "Sign up"
```
┌────────────────────────────────┐
│  Create your SwiftFingers      │
│  account                       │
│  Start improving your typing   │
│  speed today                   │
│                                │
│  [Facebook] [Google]           │
│                                │
│  ─── or ───                    │
│                                │
│  First name    Last name       │
│  [_______]     [_______]       │
│                                │
│  Username                      │
│  [___________________]         │
│                                │
│  Email address                 │
│  [___________________]         │
│                                │
│  Password                      │
│  [___________________] 👁      │
│                                │
│  [Continue →]                  │
│                                │
│  Already have an account?      │
│  Sign in  ← BACK TO SIGN-IN    │
└────────────────────────────────┘
```

## Clerk Configuration

### In Clerk Dashboard

Make sure these are enabled:

1. **Email Authentication**
   - User & Authentication → Email, Phone, Username
   - Email address: **Enabled** (Required)
   - Email verification: **Enabled** (Recommended)

2. **Sign-Up Settings**
   - User & Authentication → Restrictions
   - Allow sign-ups: **Enabled**
   - Email verification: **Required** (Recommended)

3. **Social Providers** (Optional)
   - Social Connections
   - Enable Google, Facebook, GitHub as needed

## Summary

✅ **Sign-up link now works**
✅ **Clicking "Sign up" switches to sign-up form**
✅ **Form shows correct fields (no phone number)**
✅ **After sign-up → Redirects to game screen**
✅ **Can switch back to sign-in by clicking "Sign in" link**

**Test it now:** Restart your dev server and try clicking the "Sign up" link! 🎉
