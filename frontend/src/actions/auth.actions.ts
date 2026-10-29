'use server';

import { redirect } from 'next/navigation';
import { ApiError, errorMessage } from '@/lib/client';
import { authApi } from '@/lib/auth';
import { clearResetTicket, clearSessionCookie, destinationFor, getCurrentUser, readResetTicket, setResetTicket, setSessionCookie } from '@/utils/session';
import type { ActionState, AuthSession, AuthUser, OtpType } from '@/types/auth';

const field = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

const verifyOtpPath = (email: string, type: OtpType) =>
  `/auth/verify-otp?email=${encodeURIComponent(email.toLowerCase())}&type=${type}`;

async function startSession(request: () => Promise<AuthSession>, persistent = true): Promise<ActionState> {
  let destination: string;
  try {
    const { access_token, user } = await request();
    await setSessionCookie(access_token, persistent);
    destination = await destinationFor(user);
  } catch (err) {
    return { error: errorMessage(err) };
  }
  redirect(destination);
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = field(formData, 'email');
  const password = String(formData.get('password') ?? '');
  const remember = formData.get('remember') === 'on';

  let destination: string;
  try {
    const { access_token, user } = await authApi.login({ email, password });
    await setSessionCookie(access_token, remember);
    destination = await destinationFor(user);
  } catch (err) {
    if (err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED') {
      redirect(verifyOtpPath(email, 'login'));
    }
    return { error: errorMessage(err, 'Invalid email or password.') };
  }
  redirect(destination);
}

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = field(formData, 'email');

  try {
    await authApi.register({
      name: field(formData, 'name'),
      email,
      password: String(formData.get('password') ?? ''),
    });
  } catch (err) {
    return { error: errorMessage(err, 'Could not create account. Please try again.') };
  }
  redirect(verifyOtpPath(email, 'signup'));
}

export async function verifyEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return startSession(() =>
    authApi.verifyOtp({ email: field(formData, 'email'), code: field(formData, 'code') }),
  );
}

export async function resendEmailCodeAction(email: string, type: OtpType): Promise<ActionState> {
  try {
    const { message } = type === 'reset' ? await authApi.forgotPassword(email) : await authApi.sendOtp(email);
    return { message };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to resend code.') };
  }
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = field(formData, 'email');

  try {
    await authApi.forgotPassword(email);
  } catch (err) {
    return { error: errorMessage(err, 'Failed to send reset code. Please try again.') };
  }
  redirect(verifyOtpPath(email, 'reset'));
}

export async function verifyResetCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = field(formData, 'email');
  const code = field(formData, 'code');

  try {
    await authApi.verifyResetCode({ email, code });
    await setResetTicket(email, code);
  } catch (err) {
    return { error: errorMessage(err, 'Invalid verification code.') };
  }
  redirect('/auth/reset-password');
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ticket = await readResetTicket();
  if (!ticket) {
    return { error: 'Your reset session has expired. Please request a new code.' };
  }

  try {
    await authApi.resetPassword({ ...ticket, newPassword: String(formData.get('password') ?? '') });
  } catch (err) {
    return { error: errorMessage(err, 'Failed to reset password. Please try again.') };
  }

  await clearResetTicket();
  await clearSessionCookie();
  redirect('/auth/login?reset=success');
}

export async function changePasswordAction(newPassword: string): Promise<ActionState> {
  if (!(await getCurrentUser().catch(() => null))) {
    return { error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const { access_token, message } = await authApi.changePassword(newPassword);
    await setSessionCookie(access_token);
    return { message };
  } catch (err) {
    return { error: errorMessage(err, 'Could not change your password. Please try again.') };
  }
}

export async function googleSignInAction(idToken: string): Promise<ActionState> {
  return startSession(() => authApi.google(idToken));
}

export async function linkedinSignInAction(code: string, redirectUri: string): Promise<ActionState> {
  return startSession(() => authApi.linkedin({ code, redirectUri }));
}

export async function getSessionUserAction(): Promise<AuthUser | null> {
  return getCurrentUser();
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/');
}
