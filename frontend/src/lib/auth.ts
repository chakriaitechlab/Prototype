import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { apiFetch, publicFetch } from './client';
import type { AuthSession, AuthUser, SignupStatus } from '@/types/auth';

type Message = { message: string };

const SIGNUP_STATUS_FALLBACK: SignupStatus = { signupEnabled: true };

async function signupStatus(): Promise<SignupStatus> {
  'use cache';
  cacheTag('signup-status');
  cacheLife('minutes');

  try {
    return await publicFetch<SignupStatus>('/api/auth/signup-status');
  } catch {
    return SIGNUP_STATUS_FALLBACK;
  }
}

export const authApi = {
  signupStatus,

  register: (body: { name: string; email: string; password: string }) =>
    apiFetch<Message & { email: string }>('/api/auth/register', { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthSession>('/api/auth/login', { method: 'POST', body }),

  sendOtp: (email: string) =>
    apiFetch<Message>('/api/auth/send-otp', { method: 'POST', body: { email } }),

  verifyOtp: (body: { email: string; code: string }) =>
    apiFetch<AuthSession>('/api/auth/verify-otp', { method: 'POST', body }),

  forgotPassword: (email: string) =>
    apiFetch<Message>('/api/auth/forgot-password', { method: 'POST', body: { email } }),

  verifyResetCode: (body: { email: string; code: string }) =>
    apiFetch<Message>('/api/auth/verify-reset-code', { method: 'POST', body }),

  resetPassword: (body: { email: string; code: string; newPassword: string }) =>
    apiFetch<Message>('/api/auth/reset-password', { method: 'POST', body }),

  google: (idToken: string) =>
    apiFetch<AuthSession>('/api/auth/google', { method: 'POST', body: { idToken } }),

  linkedin: (body: { code: string; redirectUri: string }) =>
    apiFetch<AuthSession>('/api/auth/linkedin', { method: 'POST', body }),

  me: () => apiFetch<AuthUser>('/api/auth/me'),

  changePassword: (newPassword: string) =>
    apiFetch<Message & { access_token: string }>('/api/auth/change-password', {
      method: 'POST',
      body: { newPassword },
    }),
};
