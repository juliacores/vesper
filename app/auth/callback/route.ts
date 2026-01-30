import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Redirect to a client page that will handle the code exchange
  // This is necessary because PKCE requires the code_verifier from the client-side cookies
  if (code) {
    return NextResponse.redirect(new URL(`/auth/confirm?code=${code}`, requestUrl.origin));
  }

  // No code provided, redirect to auth
  return NextResponse.redirect(new URL('/auth', requestUrl.origin));
}

