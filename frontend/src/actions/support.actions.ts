'use server';

import { errorMessage } from '@/lib/client';
import { supportApi } from '@/lib/support';
import type { SupportContactState } from '@/types/support';

const field = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();

// Public endpoint: no session to verify; the backend validates and rate-limits by IP.
export async function supportContactAction(
  _prev: SupportContactState,
  formData: FormData,
): Promise<SupportContactState> {
  const values = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    subject: field(formData, 'subject'),
    message: field(formData, 'message'),
  };

  try {
    const { message } = await supportApi.contact(values);
    return { message };
  } catch (err) {
    return {
      error: errorMessage(err, 'Failed to send message. Please try again or email us directly.'),
      values,
    };
  }
}
