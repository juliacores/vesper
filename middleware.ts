import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simply pass through all requests - auth is handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$|api/).*)',
  ],
};

