# Testing Guide for Vesper

## Prerequisites

1. ✅ Supabase project created and schema.sql executed
2. ✅ Environment variables configured in `.env.local`
3. ✅ Dependencies installed (`npm install`)

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

## Testing Flow

### 1. Pre-Onboarding (Value Prop Screens)
- **Expected:** 3 slides showing value propositions
- **Test:** Click "Next" through all slides, then "Get Started"
- **Should navigate to:** `/auth`

### 2. Authentication
- **Test Sign in with Email:**
  - Enter your email
  - Click "Send Magic Link"
  - Check your email for the magic link
  - Click the link to authenticate
  
- **Test Sign in with Google:**
  - Click "Continue with Google"
  - Complete OAuth flow
  - Should redirect to `/onboarding`

### 3. Onboarding Flow

#### Step 1: Deep Dive Quiz
- **Test each step:**
  1. Select a dynamic (Submissive/Dominant/Switch/Observer)
  2. Choose a tone (Worship/Praise, Degradation/Dirty, etc.)
  3. Select multiple triggers
  4. Choose psychology preference
  5. Set hard limits (optional)
  6. Set safeword (default: "Red")
- **Expected:** Progress bar updates, can't proceed without required fields
- **After completion:** Should save to Supabase `user_preferences` table

#### Step 2: Feature Tour
- **Expected:** 3 slides explaining features
- **Test:** Navigate through slides or skip
- **Should navigate to:** `/onboarding/paywall`

#### Step 3: Paywall
- **Test:** Click "Subscribe" or "Continue with Free"
- **Expected:** Sets premium status in store
- **Should navigate to:** `/onboarding/identity`

#### Step 4: Identity
- **Test:** Enter username and select pronouns
- **Expected:** Saves to Supabase `users` table
- **Should navigate to:** `/home`

### 4. HOME Tab

#### Daily Vibe Check
- **Test:** Select different vibe chips (Domination, Tenderness, etc.)
- **Expected:** Selected vibe highlights in lime green

#### Partner Selection
- **Test:** Select Lucien, Kai, or Jiro
- **Expected:** Selected card shows lime border

#### Action Buttons
- **Test:** Click "Generate Story", "Generate Audio", or "Start Voice Chat"
- **Expected:** 
  - If no vibe/persona selected: buttons disabled
  - If selected: navigates to generation screen
  - Free users: checks generation limit

### 5. Session Screens

#### Story Generation
- **Test:** Click "Generate Story" from HOME
- **Expected:**
  - Shows loading state
  - Calls `/api/generate/story`
  - Creates session in Supabase
  - Navigates to AudioPlayerScreen
  - Free users: 2-minute timer starts

#### Audio Generation
- **Test:** Click "Generate Audio" from HOME
- **Expected:**
  - Shows loading state
  - Calls `/api/generate/audio`
  - Creates session in Supabase
  - Navigates to AudioPlayerScreen

#### Voice Chat
- **Test:** Click "Start Voice Chat" from HOME
- **Expected:**
  - Shows VoiceChatScreen with breathing visualizer
  - Free users: 2-minute timer
  - STOP button works

### 6. Archive Screens

#### Stories Tab
- **Test:** Navigate to `/stories`
- **Expected:** Shows list of story sessions from Supabase
- **Test:** Click a session card
- **Expected:** Navigates to session detail page

#### Audios Tab
- **Test:** Navigate to `/audios`
- **Expected:** Shows list of audio sessions from Supabase

#### Voice Tab
- **Test:** Navigate to `/voice`
- **Expected:** Shows list of voice chat sessions from Supabase

### 7. Profile Tab

#### User Info
- **Test:** Navigate to `/profile`
- **Expected:** Shows username, email, premium status

#### Preferences
- **Test:** Click "Retake Desire Quiz"
- **Expected:** Navigates back to quiz

#### Settings
- **Test:** Click "Sign Out"
- **Expected:** Signs out and redirects to `/auth`

## Freemium Testing

### Free User Limits
1. **Generation Limit:**
   - Complete onboarding
   - Generate one story/audio/voice chat
   - Try to generate another
   - **Expected:** Redirects to paywall with `reason=generation_limit`

2. **Time Limit:**
   - Start a voice chat or audio session
   - Wait 2 minutes (or let timer countdown)
   - **Expected:** Session stops, redirects to paywall with `reason=time_limit`

### Premium User
- Set `isPremium: true` in Zustand store or database
- **Expected:** No limits, unlimited generations

## Database Verification

### Check Supabase Dashboard:

1. **Users Table:**
   ```sql
   SELECT * FROM users;
   ```
   Should show user records after identity step

2. **User Preferences Table:**
   ```sql
   SELECT * FROM user_preferences;
   ```
   Should show quiz results after quiz completion

3. **Sessions Table:**
   ```sql
   SELECT * FROM sessions ORDER BY created_at DESC;
   ```
   Should show generated sessions

## API Testing

### Test Story Generation:
```bash
curl -X POST http://localhost:3000/api/generate/story \
  -H "Content-Type: application/json" \
  -d '{
    "persona": "Lucien",
    "vibe": "Tenderness",
    "userPreferences": {
      "dynamic": "Submissive",
      "tone": "Soft/Romantic"
    }
  }'
```

### Test TTS:
```bash
curl -X POST http://localhost:3000/api/elevenlabs/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test."
  }'
```

## Common Issues & Fixes

1. **"Supabase URL not found":**
   - Check `.env.local` exists and has correct values
   - Restart dev server after adding env vars

2. **"Unauthorized" errors:**
   - Make sure you're signed in
   - Check Supabase RLS policies are set correctly

3. **API errors:**
   - Verify API keys in `.env.local`
   - Check API rate limits
   - Review server logs in terminal

4. **Build errors:**
   - Run `npm install` again
   - Check TypeScript errors: `npm run build`

## Next Steps After Testing

1. ✅ Verify all flows work end-to-end
2. ✅ Test freemium limits
3. ✅ Verify database saves correctly
4. ✅ Test on mobile device (PWA)
5. ✅ Test error handling
6. ✅ Add Stripe integration for payments
7. ✅ Implement OpenAI Realtime API for voice chat
8. ✅ Add audio file storage to Supabase Storage
