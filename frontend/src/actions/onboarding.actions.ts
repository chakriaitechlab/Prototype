'use server';

import { redirect } from 'next/navigation';
import { ApiError, errorMessage } from '@/lib/client';
import { authApi } from '@/lib/auth';
import { onboardingApi } from '@/lib/onboarding';
import { storageApi } from '@/lib/storage';
import { pathAfterStep, pathForUser } from '@/utils/routes';
import type { OnboardingStep } from '@/utils/routes';
import type { ActionState, AuthUser, UserRole } from '@/types/auth';

const field = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

async function advance(
  request: () => Promise<AuthUser>,
  { from, fallback }: { from?: OnboardingStep; fallback?: string } = {},
): Promise<ActionState> {
  let user: AuthUser;
  try {
    user = await request();
  } catch (err) {
    return { error: errorMessage(err, fallback) };
  }
  redirect(from ? pathAfterStep(user, from) : pathForUser(user));
}

export async function updateRoleAction(role: UserRole): Promise<ActionState> {
  return advance(() => onboardingApi.updateRole(role), {
    fallback: 'Could not save your account type. Please try again.',
  });
}

export async function sendPhoneOtpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const role = field(formData, 'role') === 'RECRUITER' ? 'recruiter' : 'seeker';

  let sentTo: string;
  try {
    ({ phoneNumber: sentTo } = await onboardingApi.sendPhoneOtp(field(formData, 'phoneNumber')));
  } catch (err) {
    return { error: errorMessage(err, 'Could not send WhatsApp code. Please try again.') };
  }
  redirect(`/onboarding/${role}/verify?phone=${sentTo}`);
}

export async function resendPhoneOtpAction(phoneNumber: string): Promise<ActionState> {
  try {
    const { message } = await onboardingApi.sendPhoneOtp(phoneNumber);
    return { message };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to resend code.') };
  }
}

export async function verifyPhoneOtpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return advance(
    () =>
      onboardingApi.verifyPhoneOtp({ phoneNumber: field(formData, 'phoneNumber'), code: field(formData, 'code') }),
    { from: 'phone', fallback: 'Invalid verification code.' },
  );
}

export async function savePhotoAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return advance(async () => {
    if (formData.get('file') instanceof File) await storageApi.avatar(formData);
    return authApi.me();
  }, { from: 'photo', fallback: 'Could not upload photo. Please try again.' });
}

export async function continueOnboardingAction(from: OnboardingStep): Promise<ActionState> {
  return advance(() => authApi.me(), { from });
}

export async function checkUsernameAction(
  role: UserRole,
  username: string,
): Promise<{ available: boolean; message: string }> {
  try {
    return role === 'RECRUITER'
      ? await onboardingApi.checkCompanyUsername(username)
      : await onboardingApi.checkUsername(username);
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) return { available: false, message: err.message };
    return { available: false, message: errorMessage(err, 'Could not check username right now.') };
  }
}

export async function setUsernameAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = field(formData, 'username');
  const save = field(formData, 'role') === 'RECRUITER' ? onboardingApi.setCompanyUsername : onboardingApi.setUsername;

  return advance(() => save(username), {
    from: 'username',
    fallback: 'Could not save username. Please try again.',
  });
}

export async function uploadCvAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await onboardingApi.uploadCv(formData);
    return { message: 'Resume saved.' };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to upload CV. Please try again.') };
  }
}

export async function skipCvAction(): Promise<ActionState> {
  return advance(() => onboardingApi.skipCv(), { from: 'cv' });
}

export async function saveCareerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return advance(
    () => onboardingApi.saveCareer({ headline: field(formData, 'headline'), about: field(formData, 'about') }),
    { from: 'career', fallback: 'Could not save career details. Please try again.' },
  );
}

export async function skipCareerAction(): Promise<ActionState> {
  return advance(() => onboardingApi.saveCareer({}), { from: 'career' });
}

export async function saveCompanyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return advance(() => onboardingApi.saveCompany(field(formData, 'name')), {
    from: 'company',
    fallback: 'Could not save company name. Please try again.',
  });
}
