# Password Reset Flow - How It Works

## 🎯 Overview

This document explains how the password reset flow works in your Reality Bracket app and what changes were made to fix the 404 error.

## 🔄 Complete Flow

### 1. User Requests Password Reset

**Location:** Profile Drawer → Forgot Password
```typescript
// User enters email
auth.requestPasswordReset(email)
  ↓
// Calls Supabase with redirect URL
SupabaseService.resetPasswordForEmail(email, window.location.origin)
```

**Key Change:** The redirect URL is now set to the **root URL** (`https://yourdomain.com`) instead of `/reset-password` to avoid 404 errors.

### 2. Supabase Sends Email

Supabase sends an email with a link that looks like:
```
https://yourdomain.com#access_token=xxx&type=recovery&expires_in=3600&refresh_token=xxx
```

**Important:** The parameters are in the **hash fragment** (#), not the query string (?), so they work on the client-side.

### 3. User Clicks Email Link

When the user clicks the link:
1. Browser navigates to your root URL
2. Supabase automatically establishes a session using the tokens in the hash
3. Your React app loads

### 4. App Detects Password Reset

**Location:** `src/App.tsx`

```typescript
// useEffect runs on mount and monitors hash changes
useEffect(() => {
  const detectRoute = () => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Check for type=recovery in the hash
    if (hashParams.get('type') === 'recovery') {
      setCurrentRoute('password-reset'); // Show PasswordResetPage
    }
  };
  
  detectRoute();
  window.addEventListener('hashchange', detectRoute);
}, []);
```

**Key Features:**
- Detects `type=recovery` in URL hash
- Works regardless of the path (/, /anything, etc.)
- Listens for hash changes to re-detect if needed

### 5. Password Reset Page Loads

**Location:** `src/components/pages/PasswordResetPage.tsx`

The page:
1. Checks for a valid session (Supabase creates this from the URL tokens)
2. Validates the recovery parameters
3. Shows the password reset form

```typescript
useEffect(() => {
  const supabase = SupabaseService.getClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    setIsValidToken(true); // Show form
  } else {
    setIsValidToken(false); // Show error
  }
}, []);
```

### 6. User Updates Password

When the user submits the form:

```typescript
const handlePasswordReset = async (e) => {
  // Update password in Supabase
  const success = await auth.updatePassword(newPassword);
  
  if (success) {
    // Clean up the URL hash
    window.history.replaceState(null, '', window.location.pathname);
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }
};
```

**What happens:**
1. Calls `SupabaseService.updatePassword()` which uses the current session
2. Supabase updates the password in the database
3. Hash is cleaned from URL
4. User is redirected to home page (logged in)

## 🔧 Changes Made

### 1. Fixed Redirect URL (supabaseService.ts)
```typescript
// BEFORE (caused 404)
const resetUrl = `${window.location.origin}/reset-password`;

// AFTER (works!)
const resetUrl = window.location.origin;
```

### 2. Enhanced Route Detection (App.tsx)
- Moved route detection into `useEffect` with state
- Added `hashchange` event listener
- Improved logging for debugging
- Made detection more flexible (works with any path)

### 3. Prevented Premature Hash Cleanup (auth.viewmodel.ts)
```typescript
// BEFORE
if (type === 'recovery' && accessToken) {
  setIsPasswordRecovery(true);
  window.history.replaceState(null, '', window.location.pathname); // ❌ Too early!
}

// AFTER
if (type === 'recovery' && accessToken) {
  setIsPasswordRecovery(true);
  // Don't clean up yet - we need it for route detection
}
```

### 4. Added Hash Cleanup After Success (PasswordResetPage.tsx)
Now the hash is only cleaned up **after** the password is successfully updated, not before.

### 5. Added SPA Routing Config (vercel.json)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures any URL path loads your React app (useful for future features).

## 🧪 Testing

### Test the Complete Flow:

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Request password reset:**
   - Open your app
   - Click Sign In → Forgot Password
   - Enter your email
   - Submit

3. **Check email:**
   - Open the password reset email
   - Look at the link (should go to your root domain)

4. **Click the link:**
   - Should open your app (not a 404!)
   - Should show the password reset form

5. **Reset password:**
   - Enter new password
   - Confirm password
   - Submit
   - Should redirect to home page

### Test Locally:

Open the `TEST_PASSWORD_RESET.html` file in your browser to simulate the flow and see debugging tools.

## 🐛 Troubleshooting

### Still seeing 404?
- Make sure you've deployed the latest code
- Check Supabase dashboard → Email Templates → Make sure the redirect URL is correct
- Verify your hosting provider supports SPA routing

### Home page instead of password reset page?
- Open browser console and look for "Route detection" logs
- Check that URL has `#type=recovery` in it
- Make sure the `useEffect` in App.tsx is running

### Form shows but can't update password?
- Check browser console for session errors
- Verify the access_token in the URL is valid (not expired)
- Make sure Supabase project URL and keys are correct

### "Invalid Reset Link" error?
- The token might have expired (usually 1 hour)
- Request a new password reset link
- Check browser console for session errors

## 📝 Summary

The password reset now works by:
1. ✅ Sending users to the root URL (avoids 404)
2. ✅ Detecting `type=recovery` in the URL hash
3. ✅ Showing the password reset page
4. ✅ Using Supabase's automatic session from URL tokens
5. ✅ Updating the password through the established session
6. ✅ Cleaning up and redirecting after success

**Users can now successfully reset their passwords!** 🎉

