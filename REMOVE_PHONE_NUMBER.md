# Remove Phone Number from Sign-Up Form

## ✅ What I Did

I've hidden the phone number field from the sign-up form using CSS. However, for the best solution, you should also disable it in your Clerk dashboard.

## Method 1: CSS (Already Implemented)

I've added custom CSS that hides the phone number field:

**File: `clerk-custom.css`**
```css
/* Hide phone number field */
.cl-formFieldRow[data-field="phoneNumber"],
input[type="tel"] {
  display: none !important;
}
```

This is imported in `index.tsx` and will hide the field visually.

## Method 2: Clerk Dashboard (Recommended)

For a cleaner solution, disable phone number in your Clerk dashboard:

### Steps:

1. **Go to Clerk Dashboard**
   - Visit https://dashboard.clerk.com
   - Select your "SwiftFingers" application

2. **Navigate to User & Authentication**
   - Click "User & Authentication" in left sidebar
   - Click "Email, Phone, Username"

3. **Disable Phone Number**
   - Find "Phone number" section
   - Toggle it **OFF** (disabled)
   - Click "Save" at the bottom

4. **Configure Other Fields**
   
   **Keep These Enabled:**
   - ✅ Email address (Required)
   - ✅ Username (Optional or Required - your choice)
   - ✅ First name (Optional)
   - ✅ Last name (Optional)
   - ✅ Password (Required)

   **Disable These:**
   - ❌ Phone number (Disabled)

5. **Save Changes**
   - Click "Save" button
   - Changes take effect immediately

## Current Sign-Up Form Fields

After disabling phone number, users will see:

```
┌─────────────────────────────────────┐
│  Create your SwiftFingers account   │
│                                     │
│  [Google]  [GitHub]                 │
│                                     │
│  ─── or ───                         │
│                                     │
│  First name    Last name            │
│  [_________]   [_________]          │
│                                     │
│  Username                           │
│  [_____________________]            │
│                                     │
│  Email address                      │
│  [_____________________]            │
│                                     │
│  Password                           │
│  [_____________________] 👁         │
│                                     │
│  [Continue →]                       │
│                                     │
│  Already have an account? Sign in   │
└─────────────────────────────────────┘
```

## Field Configuration Options

### In Clerk Dashboard

You can configure each field as:
- **Required** - User must fill it
- **Optional** - User can skip it
- **Disabled** - Field doesn't appear

### Recommended Settings for SwiftFingers:

| Field | Setting | Reason |
|-------|---------|--------|
| Email | Required | Primary identifier |
| Password | Required | Authentication |
| Username | Optional | Nice to have, not critical |
| First name | Optional | Personalization |
| Last name | Optional | Personalization |
| Phone number | **Disabled** | Not needed for typing app |

## Testing

### After Disabling Phone Number:

1. **Restart your dev server** (if running)
   ```bash
   npm run dev
   ```

2. **Visit the app**
   - Go to http://localhost:5173
   - You'll see the login screen

3. **Click "Sign up"**
   - Phone number field should be gone
   - Only see: First name, Last name, Username, Email, Password

4. **Test sign-up**
   - Fill in the form
   - Should work without phone number

## Troubleshooting

### Phone number still showing?

**Solution 1: Clear Browser Cache**
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
```

**Solution 2: Check Clerk Dashboard**
```
1. Verify phone number is disabled
2. Check "Save" was clicked
3. Wait 1-2 minutes for changes to propagate
```

**Solution 3: Verify CSS is loaded**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for "clerk-custom.css" in the list
5. Should show status 200 (loaded)
```

### Form validation errors?

If you get errors about phone number being required:
- Go to Clerk dashboard
- Make sure phone number is set to "Disabled" (not just "Optional")
- Save changes
- Clear browser cache

## Alternative: Make Phone Optional

If you want to keep phone number but make it optional:

1. Go to Clerk Dashboard
2. User & Authentication → Email, Phone, Username
3. Find "Phone number"
4. Set to **"Optional"** instead of Required
5. Save

This way users can choose to add it or skip it.

## Social Login

The sign-up form also shows social login buttons:
- **Google** - One-click sign-up
- **GitHub** - For developers

These are configured in:
- Clerk Dashboard → Social Connections
- Enable/disable providers as needed

## Custom Localization

The form text is customized in `lib/clerkConfig.ts`:

```typescript
signUp: {
  start: {
    title: "Create your SwiftFingers account",
    subtitle: "Start improving your typing speed today"
  }
}
```

You can change this text to anything you want!

## Summary

✅ **CSS hiding implemented** - Phone field hidden visually
✅ **Dashboard guide provided** - Proper way to disable it
✅ **All other fields remain** - First name, Last name, Username, Email, Password
✅ **Social login works** - Google, GitHub buttons still show
✅ **Form still functional** - Sign-up works without phone

**Next Step:** Go to your Clerk dashboard and disable phone number for a cleaner solution!

## Quick Checklist

- [ ] CSS file created (`clerk-custom.css`)
- [ ] CSS imported in `index.tsx`
- [ ] Clerk dashboard opened
- [ ] Phone number disabled in dashboard
- [ ] Changes saved
- [ ] Browser cache cleared
- [ ] Sign-up form tested
- [ ] Phone field confirmed hidden

**Done!** Your sign-up form now only shows the essential fields. 🎉
