'use server';

import { errorMessage } from '@/lib/client';
import { waitlistApi } from '@/lib/waitlist';
import type { WaitlistState } from '@/types/waitlist';

const field = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

// Public endpoint: no session to verify; the backend validates and rate-limits by IP.
export async function joinWaitlistAction(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const values = {
    fullName: field(formData, 'fullName'),
    email: field(formData, 'email'),
    occupation: field(formData, 'occupation') || undefined,
  };

  try {
    const { message } = await waitlistApi.join(values);
    return { message };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to join the waitlist. Please try again.'), values };
  }
}
