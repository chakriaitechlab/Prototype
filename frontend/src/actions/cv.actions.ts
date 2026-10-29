'use server';

import { errorMessage } from '@/lib/client';
import { cvApi } from '@/lib/cv';
import { getCurrentUser } from '@/utils/session';
import type { ActionState } from '@/types/auth';
import type { BuiltCvProfile } from '@/types/cv';

const SESSION_EXPIRED = 'Your session has expired. Please sign in again.';

export async function saveCvAction(profile: BuiltCvProfile): Promise<ActionState> {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return { error: SESSION_EXPIRED };
  }

  if (!profile.fullName?.trim()) {
    return { error: 'Please enter your full name before saving.' };
  }

  try {
    const res = await cvApi.save(profile);
    return { message: res.message || 'CV saved successfully!' };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to save CV. Please try again.') };
  }
}
