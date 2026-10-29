import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, DEVICE_ID_COOKIE } from '@/utils/cookies';

const PROTECTED_PREFIXES = ['/onboarding', '/dashboard'];
const DEVICE_ID_MAX_AGE = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  let response: NextResponse;
  if (isProtected && !request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    response = NextResponse.redirect(loginUrl);
  } else {
    response = NextResponse.next();
  }

  if (!request.cookies.has(DEVICE_ID_COOKIE)) {
    response.cookies.set(DEVICE_ID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEVICE_ID_MAX_AGE,
    });
  }

  return response;
}

export const config = {
  matcher: ['/auth/:path*', '/onboarding/:path*', '/dashboard/:path*'],
};
