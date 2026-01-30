# Production Readiness Plan for Vesper

## 🎯 Goal: Launch-Ready MVP by End of Day

## Current Status Assessment

### ✅ Completed Features
- [x] Authentication (Supabase - Email Magic Link)
- [x] Onboarding flow (Value Props → Quiz → Tour → Paywall → Identity)
- [x] Deep Dive Quiz (6 steps, saves to Supabase)
- [x] HOME tab (Vibe selection, Partner selection, Action buttons)
- [x] Session screens (Voice Chat UI, Audio Player UI)
- [x] Archive screens (Stories, Audios, Voice tabs)
- [x] Profile page
- [x] Freemium logic (1 generation, 2-minute limit)
- [x] Navigation system
- [x] State management (Zustand)
- [x] Database schema (Supabase)

### ⚠️ Partially Implemented
- [~] Story generation (OpenAI API works, but TTS not connected)
- [~] Audio generation (OpenAI API works, but TTS not connected)
- [~] Voice chat (UI exists, but OpenAI Realtime API not implemented)
- [~] Audio playback (Howler.js ready, but audio URLs not generated)

### ❌ Missing/Incomplete
- [ ] Stripe payment integration
- [ ] OpenAI Realtime API for voice chat
- [ ] TTS audio generation and storage
- [ ] Error boundaries
- [ ] Production error logging
- [ ] Rate limiting on API routes
- [ ] PWA icons
- [ ] Production build optimizations
- [ ] Security headers
- [ ] Analytics/monitoring

---

## 🚀 Production Readiness Checklist

### Priority 1: Critical for Launch (Must Have)

#### 1. Fix Authentication Flow ✅ HIGH PRIORITY
- **Status**: Known issue - redirects after onboarding
- **Action**: Fix session persistence and middleware
- **Time**: 30-60 min

#### 2. Complete Story/Audio Generation Flow
- **Status**: OpenAI API works, but TTS not connected
- **Action**: 
  - Connect TTS generation after story/audio creation
  - Save audio to Supabase Storage
  - Update session with audio URL
- **Time**: 1-2 hours

#### 3. Remove/Replace Console Logs
- **Status**: 25+ console.log/error statements
- **Action**: 
  - Remove debug logs
  - Replace with proper error logging service (or remove for now)
- **Time**: 30 min

#### 4. Error Handling & Boundaries
- **Status**: No error boundaries, minimal error handling
- **Action**:
  - Add React error boundaries
  - Add try-catch in critical paths
  - User-friendly error messages
- **Time**: 1 hour

#### 5. Production Build & Testing
- **Status**: Need to verify production build works
- **Action**:
  - Run production build
  - Fix any build errors
  - Test critical flows
- **Time**: 1 hour

#### 6. Environment Variables Setup
- **Status**: Need production env vars
- **Action**:
  - Set up production environment variables
  - Verify all API keys work
- **Time**: 15 min

### Priority 2: Important for Launch (Should Have)

#### 7. PWA Icons
- **Status**: Icons removed, manifest references them
- **Action**: Create/generate PWA icons (192x192, 512x512)
- **Time**: 15 min

#### 8. Rate Limiting
- **Status**: No rate limiting on API routes
- **Action**: Add basic rate limiting to prevent abuse
- **Time**: 30 min

#### 9. Security Headers
- **Status**: No security headers configured
- **Action**: Add security headers in next.config.js
- **Time**: 15 min

#### 10. Fix Supabase Queries
- **Status**: Some queries commented out (quiz completion)
- **Action**: Uncomment and verify all Supabase queries work
- **Time**: 30 min

### Priority 3: Nice to Have (Can Add Later)

#### 11. Stripe Integration
- **Status**: Not implemented
- **Action**: Can be added post-launch
- **Time**: 2-3 hours (defer)

#### 12. OpenAI Realtime API (Voice Chat)
- **Status**: Not implemented
- **Action**: Can be added post-launch, or disable voice chat button for now
- **Time**: 3-4 hours (defer)

#### 13. Analytics
- **Status**: Not implemented
- **Action**: Add basic analytics (PostHog, Plausible, or similar)
- **Time**: 30 min (optional)

#### 14. Monitoring/Error Tracking
- **Status**: Not implemented
- **Action**: Add Sentry or similar
- **Time**: 30 min (optional)

---

## 📋 Recommended Launch Strategy

### Option A: Full MVP Launch (Recommended)
**Timeline**: 4-6 hours

1. Fix authentication flow (1 hour)
2. Complete story/audio generation with TTS (2 hours)
3. Remove console logs, add error handling (1 hour)
4. Production build & testing (1 hour)
5. PWA icons, security headers (30 min)
6. Final testing (30 min)

**Result**: Fully functional app with story/audio generation

### Option B: Minimal Viable Launch
**Timeline**: 2-3 hours

1. Fix authentication flow (1 hour)
2. Remove console logs, add basic error handling (30 min)
3. Production build & testing (1 hour)
4. Disable incomplete features (voice chat button)
5. Add "Coming Soon" messages

**Result**: Core app works, some features disabled

---

## 🔧 Quick Fixes Needed

### 1. Authentication Issue
- Problem: Redirects after onboarding completion
- Solution: Fix session persistence (already attempted, may need different approach)

### 2. Quiz Not Saving to Supabase
- Problem: Quiz completion has TODO comment
- Solution: Uncomment Supabase save code (already in file, just commented)

### 3. Audio Not Playing
- Problem: Howler.js not initialized with audio URLs
- Solution: Generate TTS after story/audio creation, save URL, initialize Howler

### 4. Voice Chat Not Working
- Problem: OpenAI Realtime API not implemented
- Solution: Either implement it (3-4 hours) or disable button with "Coming Soon"

---

## 🎯 Recommended Action Plan (Today)

### Phase 1: Critical Fixes (2-3 hours)
1. ✅ Fix authentication redirect issue
2. ✅ Uncomment and fix Supabase queries
3. ✅ Remove console.logs
4. ✅ Add basic error boundaries
5. ✅ Test production build

### Phase 2: Complete Core Features (2 hours)
6. ✅ Connect TTS generation to story/audio flow
7. ✅ Save audio files to Supabase Storage
8. ✅ Initialize audio playback with real URLs

### Phase 3: Production Polish (1 hour)
9. ✅ Add PWA icons
10. ✅ Add security headers
11. ✅ Final testing
12. ✅ Deploy

### Phase 4: Post-Launch (Optional)
13. ⏸️ Implement Stripe payments
14. ⏸️ Implement OpenAI Realtime API
15. ⏸️ Add analytics

---

## 🚨 Blockers to Address

1. **Authentication**: Must fix before launch
2. **Audio Generation**: Core feature, should work
3. **Production Build**: Must verify it works
4. **Error Handling**: Need basic error boundaries

---

## 📝 Deployment Checklist

- [ ] All environment variables set in production
- [ ] Supabase production database configured
- [ ] RLS policies verified
- [ ] API keys verified
- [ ] Production build successful
- [ ] All critical flows tested
- [ ] Error handling in place
- [ ] Console logs removed
- [ ] PWA icons added
- [ ] Security headers configured
- [ ] Domain configured (if applicable)
- [ ] SSL certificate (if applicable)

---

## 💡 Quick Wins

1. **Disable Voice Chat**: Add "Coming Soon" to voice chat button (5 min)
2. **Remove Debug Logs**: Find/replace console.log (15 min)
3. **Add Loading States**: Already mostly done, verify (10 min)
4. **Error Messages**: Add user-friendly error messages (30 min)

---

## 🎬 Next Steps

1. Review this plan
2. Choose launch strategy (Option A or B)
3. Start with Phase 1 critical fixes
4. Test thoroughly after each phase
5. Deploy when ready

**Estimated Total Time**: 4-6 hours for full MVP, 2-3 hours for minimal launch
