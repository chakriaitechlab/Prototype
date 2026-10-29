import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/client';
import { authApi } from '@/lib/auth';
import type { AuthUser, UserRole } from '@/types/auth';
import { ACCESS_TOKEN_COOKIE, RETURN_TO_COOKIE } from './cookies';
import { dashboardPath, isStepReachable, pathForUser } from './routes';
import type { OnboardingStep } from './routes';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const RESET_TICKET_COOKIE = 'reset_ticket';
const RETURN_TO_MAX_AGE = 60 * 10;
const RETURN_TO_PREFIX = '/messages/';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

export async function setSessionCookie(token: string, persistent = true) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
    ...cookieOptions,
    ...(persistent && { maxAge: SESSION_MAX_AGE }),
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
}

export async function setResetTicket(email: string, code: string) {
  const cookieStore = await cookies();
  cookieStore.set(RESET_TICKET_COOKIE, JSON.stringify({ email, code }), {
    ...cookieOptions,
    path: '/auth',
    maxAge: 5 * 60,
  });
}

export async function readResetTicket(): Promise<{ email: string; code: string } | null> {
  const raw = (await cookies()).get(RESET_TICKET_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { email: string; code: string };
  } catch {
    return null;
  }
}

export async function clearResetTicket() {
  (await cookies()).delete({ name: RESET_TICKET_COOKIE, path: '/auth' });
}

export async function rememberReturnTo(path: string) {
  if (!path.startsWith(RETURN_TO_PREFIX)) return;
  (await cookies()).set(RETURN_TO_COOKIE, path, { ...cookieOptions, maxAge: RETURN_TO_MAX_AGE });
}

export async function destinationFor(user: Pick<AuthUser, 'email' | 'role' | 'nextStep'>) {
  const cookieStore = await cookies();
  const returnTo = cookieStore.get(RETURN_TO_COOKIE)?.value;
  if (user.nextStep !== 'done' || !returnTo?.startsWith(RETURN_TO_PREFIX)) return pathForUser(user);

  cookieStore.delete(RETURN_TO_COOKIE);
  return returnTo;
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    return await authApi.me();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
});

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(pathForUser(user));
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return user;
}

export async function requireRoleSelection() {
  const user = await requireUser();
  if (user.nextStep === 'verify-email' || user.onboardingCompleted) redirect(pathForUser(user));
  return user;
}

export async function requireOnboardingStep(role: UserRole, step: OnboardingStep) {
  const user = await requireUser();
  const { nextStep } = user;

  if (nextStep === 'done') redirect(dashboardPath(user.role));
  if (nextStep === 'verify-email' || nextStep === 'role' || user.role !== role) redirect(pathForUser(user));
  if (!isStepReachable(role, step, nextStep)) redirect(pathForUser(user));

  return user;
}

export async function requireDashboard(role: UserRole) {
  const user = await requireUser();
  if (user.nextStep !== 'done') redirect(pathForUser(user));
  if (user.role !== role) redirect(dashboardPath(user.role));
  return user;
}
