# Clerk Authentication Setup Guide

## Overview
SwiftFingers now supports user authentication via Clerk. This allows users to:
- Sign in with email, Google, GitHub, or other providers
- Save their typing history to their account
- Access their stats across devices
- (Future) Compete on global leaderboards

## Setup Instructions

### 1. Create a Clerk Account
1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your Publishable Key
1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 3. Add the Key to Your Project
Open `.env.local` and replace the placeholder:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### 4. Configure Sign-In Options (Optional)
In your Clerk dashboard:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable your preferred sign-in methods:
   - Email + Password
   - Email + OTP (One-Time Password)
   - Google OAuth
   - GitHub OAuth
   - etc.

### 5. Customize Appearance (Optional)
In your Clerk dashboard:
1. Go to **Customization** → **Theme**
2. Choose a theme that matches SwiftFingers (dark mode recommended)
3. Customize colors, logos, and branding

## Features Implemented

### ✅ Current Features
- **Sign In/Sign Up** - Modal-based authentication
- **User Profile** - Avatar dropdown with account management
- **User-Specific Analytics** - Stats are saved per user
- **Anonymous Mode** - Users can still practice without signing in

### 🚧 Coming Soon (Supabase Integration)
- **Cloud Sync** - Save sessions to database
- **Global Leaderboard** - Compare with other users
- **Cross-Device Sync** - Access your data anywhere
- **Social Features** - Share results, challenge friends

## How It Works

### Authentication Flow
1. User clicks "Sign In" button in header
2. Clerk modal opens with sign-in options
3. After authentication, user data is available via `useAuth()` hook
4. Sessions are saved with user ID for personalized analytics

### Data Storage
- **Anonymous Users**: Data stored in `localStorage` with key `swiftfingers_history_v1`
- **Signed-In Users**: Data stored in `localStorage` with key `swiftfingers_history_v1_{userId}`
- **Future**: Data will sync to Supabase for cloud storage

## Development

### Testing Authentication
```bash
npm run dev
```

Visit `http://localhost:5173` and click "Sign In" to test.

### Using the Auth Hook
```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { isSignedIn, user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (isSignedIn) {
    return <div>Welcome, {user?.username}!</div>;
  }
  
  return <div>Please sign in</div>;
}
```

## Troubleshooting

### "Missing Clerk Publishable Key" Error
- Make sure you added `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local`
- Restart your dev server after adding the key
- Check that the key starts with `pk_test_` or `pk_live_`

### Sign-In Modal Not Appearing
- Check browser console for errors
- Verify your Clerk application is active in the dashboard
- Make sure you're using the correct publishable key

### User Data Not Persisting
- Check that `localStorage` is enabled in your browser
- Clear browser cache and try again
- Verify the user ID is being passed to `saveSessionData()`

## Next Steps

Once Clerk is working, we can add:
1. **Supabase Integration** - Cloud database for sessions
2. **Leaderboards** - Global rankings by WPM/accuracy
3. **Social Features** - Friend challenges, sharing
4. **Premium Features** - Unlock advanced game modes

## Support

- Clerk Documentation: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- SwiftFingers Issues: [GitHub Issues](your-repo-url)
