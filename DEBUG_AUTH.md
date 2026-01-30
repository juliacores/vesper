# Debugging Authentication Issues

If you're still experiencing redirects, please check the browser console and share:

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Look for these log messages:**
   - "Session refresh:" - Should show `hasSession: true` and a `userId`
   - "Final session check:" - Should show `hasSession: true`
   - "Navigating to /home" - Should appear before redirect
   - "Home page auth check:" - Should show `hasSession: true` or `hasUser: true`

3. **Check Application Tab:**
   - Open DevTools → Application tab
   - Go to Local Storage → `http://localhost:3000`
   - Look for `vesper-auth` key
   - Check if it contains session data

4. **Check Cookies:**
   - Open DevTools → Application tab
   - Go to Cookies → `http://localhost:3000`
   - Look for Supabase auth cookies (usually start with `sb-`)

## Quick Fix to Try

If session isn't persisting, try this in the browser console after completing identity:

```javascript
// Check current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);

// If no session, try to refresh
if (!session) {
  const { data } = await supabase.auth.refreshSession();
  console.log('Refreshed:', data);
}
```

## Common Issues

1. **Cookies blocked**: Check if your browser is blocking third-party cookies
2. **Local storage disabled**: Some browsers/extensions block localStorage
3. **Supabase URL mismatch**: Ensure `.env.local` has the correct Supabase URL




