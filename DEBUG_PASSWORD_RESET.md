# Debug Password Reset Issue

## Current Problem
URL shows: `http://localhost:3000/#` (empty hash, no password reset form)

## Troubleshooting Steps

### Step 1: Check Console Logs
Open your browser console (F12) and look for the "Route detection:" log. What does it show?

Expected:
```
Route detection: {
  path: "/",
  hash: "#access_token=xxx&type=recovery&...",
  hashType: "recovery",
  hasAccessToken: true
}
```

If you see:
```
Route detection: {
  path: "/",
  hash: "",  // <-- EMPTY!
  hashType: null,
  hasAccessToken: false
}
```

This means Supabase is not adding the hash parameters to the redirect.

### Step 2: Check Your Email Link

Open the password reset email and **hover over** (don't click) the reset button/link. Look at the URL in the bottom-left of your browser.

It should look like:
```
http://localhost:3000#access_token=xxx&type=recovery&...
```

If it looks like:
```
http://localhost:3000
```
or
```
http://localhost:3000/reset-password
```

Then Supabase is not configured correctly.

### Step 3: Check Supabase Dashboard Settings

1. Go to your Supabase dashboard
2. Navigate to: **Authentication** → **URL Configuration**
3. Check these settings:

   **Site URL:** Should be your app URL (e.g., `http://localhost:3000` for local dev)
   
   **Redirect URLs:** Add these to the allowlist:
   - `http://localhost:3000`
   - `http://localhost:3000/**`
   - `https://yourdomain.com` (your production URL)
   - `https://yourdomain.com/**`

4. Save changes

### Step 4: Check Email Templates

1. In Supabase dashboard: **Authentication** → **Email Templates**
2. Find "Reset Password" template
3. Look for the confirmation link URL

It should use: `{{ .ConfirmationURL }}`

NOT a hardcoded URL like `https://yourdomain.com/reset-password`

### Step 5: Test with Debug Code

Add this to your browser console after the page loads:

```javascript
// Check what Supabase sees
const hash = window.location.hash;
console.log('Full URL:', window.location.href);
console.log('Hash:', hash);
console.log('Hash params:', new URLSearchParams(hash.substring(1)));

// Check Supabase session
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

## Common Issues & Solutions

### Issue 1: "redirect_to parameter not allowed"
**Cause:** Redirect URL not in Supabase allowlist
**Solution:** Add `http://localhost:3000` to redirect URLs in Supabase dashboard

### Issue 2: Email link goes to wrong URL
**Cause:** Hardcoded URL in email template
**Solution:** Update email template to use `{{ .ConfirmationURL }}`

### Issue 3: Hash parameters missing
**Cause:** Supabase might be using PKCE flow wrong
**Solution:** Check that you're using the correct Supabase client configuration

### Issue 4: Old email cached
**Cause:** Using old password reset email before code changes
**Solution:** Request a NEW password reset email after deploying changes

## Quick Fix to Test

If you want to test immediately, you can manually create the URL:

1. Request a password reset email
2. When you get the email, copy the link
3. If the link is: `http://localhost:3000`
4. Manually change it to: `http://localhost:3000#type=recovery`
5. Paste that in your browser

This should at least show you the password reset page (though it won't have a valid token to actually reset).

## Next Steps

After you check the above:
1. What does your browser console show for "Route detection:"?
2. What URL is in the password reset email?
3. Are redirect URLs configured in Supabase dashboard?

Let me know what you find and I'll help you fix it!

