import 'server-only';
import { apiFetch } from './client';
import type { AuthUser, UserRole } from '@/types/auth';

export const onboardingApi = {
  updateRole: (role: UserRole) =>
    apiFetch<AuthUser>('/api/onboarding/role', { method: 'PATCH', body: { role } }),

  sendPhoneOtp: (phoneNumber: string) =>
    apiFetch<{ message: string; phoneNumber: string }>('/api/onboarding/phone/send-otp', {
      method: 'POST',
      body: { phoneNumber },
    }),

  verifyPhoneOtp: (body: { phoneNumber: string; code: string }) =>
    apiFetch<AuthUser>('/api/onboarding/phone/verify-otp', { method: 'POST', body }),

  checkUsername: (username: string) =>
    apiFetch<{ available: boolean; message: string }>('/api/onboarding/seeker/check-username', {
      query: { username },
    }),

  setUsername: (username: string) =>
    apiFetch<AuthUser>('/api/onboarding/seeker/username', { method: 'POST', body: { username } }),

  uploadCv: (file: FormData) =>
    apiFetch<AuthUser>('/api/onboarding/seeker/cv', { method: 'POST', body: file }),

  skipCv: () => apiFetch<AuthUser>('/api/onboarding/seeker/cv/skip', { method: 'POST' }),

  saveCareer: (body: { headline?: string; about?: string }) =>
    apiFetch<AuthUser>('/api/onboarding/seeker/career', { method: 'POST', body }),

  saveCompany: (name: string) =>
    apiFetch<AuthUser>('/api/onboarding/recruiter/company', { method: 'POST', body: { name } }),

  checkCompanyUsername: (username: string) =>
    apiFetch<{ available: boolean; message: string }>('/api/onboarding/recruiter/check-username', {
      query: { username },
    }),

  setCompanyUsername: (username: string) =>
    apiFetch<AuthUser>('/api/onboarding/recruiter/username', { method: 'POST', body: { username } }),
};
