# Vesper Testing Guide

## Prerequisites

1. **Environment Variables**: Make sure you have a `.env.local` file with all required keys:
   ```bash
   # Copy from env.example if you haven't already
   cp env.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ELEVENLABS_API_KEY` - Your ElevenLabs API key

2. **Supabase Setup**:
   - Run the schema from `supabase/schema.sql` in your Supabase SQL Editor
   - Create a storage bucket named `audio-sessions` in Supabase Storage
   - Enable Google OAuth in Supabase Authentication (if you want to test Google login)

3. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

## Running the App

### Development Mode
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build Test
```bash
npm run build
npm start
```

## Testing Flow

### 1. Initial Landing & Authentication

1. **Open** `http://localhost:3000`
2. **Verify** you see the value proposition slides
3. **Click** "Get Started" or "Sign In"
4. **Test Authentication**:
   - **Email Magic Link**: Enter your email, check inbox for magic link
   - **Google OAuth**: Click "Continue with Google" (if enabled)

### 2. Onboarding Flow

After authentication, you should be redirected to `/onboarding/quiz`

1. **Deep Dive Quiz** (`/onboarding/quiz`):
   - Complete all 6 steps:
     - Step 1: Dynamic (Submissive/Dominant/Switch/Observer)
     - Step 2: Tone preference
     - Step 3: Triggers
     - Step 4: Psychology
     - Step 5: Hard limits
     - Step 6: Safeword
   - Click "Complete" - should save to Supabase and navigate to tour

2. **Feature Tour** (`/onboarding/tour`):
   - Review the features
   - Click "Continue" - should navigate to identity page

3. **Identity Setup** (`/onboarding/identity`):
   - Enter username
   - Select pronouns (She/Her, He/Him, They/Them)
   - Click "Complete Setup" - should navigate to `/home`

### 3. Home Screen (`/home`)

1. **Vibe Check**:
   - Select a vibe (e.g., "Intimate", "Playful", "Intense")
   - Verify selection is highlighted

2. **Partner Selection**:
   - Select a persona (Lucien, Kai, or Jiro)
   - Verify selection is highlighted

3. **Action Buttons**:
   - **"Start Story"** - Should navigate to `/sessions/story/new`
   - **"Start Audio"** - Should navigate to `/sessions/audio/new`
   - **"Start Voice Chat"** - Should redirect to home (feature disabled)

### 4. Story Generation (`/sessions/story/new`)

1. **Generation Process**:
   - Page should show "Generating your story..." loading state
   - Wait for story to be generated (OpenAI API call)
   - Wait for TTS audio to be generated (ElevenLabs API call)
   - Should automatically navigate to AudioPlayerScreen

2. **Audio Player**:
   - Verify audio controls appear
   - **Play/Pause** button should work
   - **Progress bar** should update as audio plays
   - **Time remaining** should count down (for free users: 2 minutes)
   - **STOP** button should stop playback and show safeword screen
   - **Back** button should navigate to home

3. **Freemium Logic** (if not premium):
   - First generation should work
   - After 1 generation, should redirect to paywall
   - Timer should show 2 minutes remaining

### 5. Audio Generation (`/sessions/audio/new`)

1. **Generation Process**:
   - Similar to story generation
   - Should generate guided audio/meditation script
   - Should create TTS audio
   - Should navigate to AudioPlayerScreen

2. **Audio Player**:
   - Same controls as story player
   - Verify audio plays correctly

### 6. Archive Screens

1. **Stories Tab** (`/stories`):
   - Should display list of story sessions
   - Click on a session card - should navigate to `/sessions/story/[id]`
   - Verify session details load correctly

2. **Audios Tab** (`/audios`):
   - Should display list of audio sessions
   - Click on a session card - should navigate to `/sessions/audio/[id]`
   - Verify session details load correctly

3. **Voice Tab** (`/voice`):
   - Should display list of voice chat sessions (if any)
   - Currently disabled, so may be empty

### 7. Profile Screen (`/profile`)

1. **User Information**:
   - Should display username
   - Should display pronouns
   - Should display email

2. **Settings**:
   - Premium status indicator
   - Logout button (if implemented)

## Testing Checklist

### Authentication
- [ ] Can sign in with email magic link
- [ ] Can sign in with Google (if enabled)
- [ ] Session persists after page refresh
- [ ] Redirects to `/home` when authenticated
- [ ] Redirects to `/auth` when not authenticated

### Onboarding
- [ ] Quiz saves preferences to Supabase
- [ ] Identity page saves username and pronouns
- [ ] Navigation flow works correctly
- [ ] No redirect loops

### Content Generation
- [ ] Story generation creates OpenAI content
- [ ] Story generation creates ElevenLabs TTS audio
- [ ] Audio is saved to Supabase Storage
- [ ] Session is saved to database with audio URL
- [ ] Audio playback works correctly

### Freemium Logic
- [ ] Free users get 1 generation
- [ ] Timer shows 2 minutes for free users
- [ ] Paywall appears after limit reached
- [ ] Premium users have unlimited access

### Navigation
- [ ] Bottom navigation works
- [ ] All routes are accessible
- [ ] Back buttons work correctly
- [ ] Deep links work (e.g., `/sessions/story/[id]`)

### Error Handling
- [ ] Error boundary catches errors
- [ ] API errors are handled gracefully
- [ ] Missing data shows appropriate messages

## Common Issues & Solutions

### Issue: "User not authenticated" after completing onboarding
**Solution**: Check Supabase RLS policies. Run `supabase/add_insert_policy.sql` if needed.

### Issue: Audio doesn't play
**Solution**: 
- Check that ElevenLabs API key is set
- Check browser console for errors
- Verify Supabase Storage bucket `audio-sessions` exists
- Check that audio URL is being saved to database

### Issue: Build errors
**Solution**: 
- Run `npm install` to ensure all dependencies are installed
- Check that all environment variables are set
- Run `npm run build` to see specific errors

### Issue: Redirect loops
**Solution**: 
- Clear browser cache and localStorage
- Check middleware.ts logic
- Verify Supabase session is being created

## Browser Console Checks

Open DevTools (F12 or Cmd+Option+I) and check:

1. **No red errors** in console
2. **Network tab**: API calls should return 200 status
3. **Application tab**: 
   - Local Storage should have `vesper-auth` key
   - Cookies should have Supabase auth cookies (`sb-*`)

## API Testing

You can test API routes directly:

```bash
# Test story generation (requires auth token)
curl -X POST http://localhost:3000/api/generate/story \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"persona": "Lucien", "vibe": "Intimate", "userPreferences": {}}'

# Test TTS (requires auth token)
curl -X POST http://localhost:3000/api/elevenlabs/tts \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"text": "Hello, this is a test"}'
```

## Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Add PWA icons** for better mobile experience
3. **Add rate limiting** to API routes
4. **Implement voice chat** feature
5. **Add analytics** tracking
6. **Set up error monitoring** (Sentry, etc.)
