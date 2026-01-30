# Supabase Authentication Setup Guide

## Issue: "Unsupported provider: provider is not enabled"

This error occurs when Google OAuth is not enabled in your Supabase project. Here's how to fix it:

## Option 1: Enable Google OAuth (Recommended for Production)

### Step 1: Go to Supabase Dashboard
1. Navigate to your Supabase project: https://supabase.com/dashboard
2. Select your project

### Step 2: Configure Google OAuth
1. Go to **Authentication** → **Providers** in the left sidebar
2. Find **Google** in the list
3. Click **Enable Google**
4. You'll need to:
   - Create a Google OAuth Client ID and Secret
   - Add your redirect URL: `https://yjtqnklcgahpfopmoomh.supabase.co/auth/v1/callback`
   - Copy the Client ID and Secret to Supabase

### Step 3: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `https://yjtqnklcgahpfopmoomh.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
7. Copy the **Client ID** and **Client Secret**
8. Paste them into Supabase Google provider settings

## Option 2: Use Email Magic Link Only (Quick Fix for Testing)

If you just want to test the app quickly, you can use email magic link authentication:

1. The email magic link should work without any additional setup
2. Just enter your email and click "Send Magic Link"
3. Check your email for the authentication link

## Option 3: Temporarily Hide Google Button (For Development)

If you want to hide the Google button until OAuth is configured, you can modify `components/auth/AuthForm.tsx`:

```tsx
// Comment out or conditionally hide the Google button
{false && (
  <motion.button
    onClick={handleGoogleSignIn}
    // ... rest of button code
  >
    Continue with Google
  </motion.button>
)}
```

## Verify Email Authentication is Working

1. Make sure **Email** provider is enabled in Supabase:
   - Go to **Authentication** → **Providers**
   - Ensure **Email** is enabled (should be by default)

2. Test email magic link:
   - Enter your email in the auth form
   - Click "Send Magic Link"
   - Check your email inbox
   - Click the magic link to authenticate

## Current Status

- ✅ **Email Magic Link**: Should work (if Email provider is enabled)
- ❌ **Google OAuth**: Needs to be configured in Supabase dashboard

## Quick Test

1. Try the email magic link first - it should work immediately
2. If email doesn't work, check Supabase dashboard → Authentication → Providers → Email is enabled
3. Once authenticated, you can continue with the onboarding flow

## Need Help?

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Google OAuth Setup: https://supabase.com/docs/guides/auth/social-login/auth-google




