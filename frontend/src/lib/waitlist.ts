import 'server-only';
import { apiFetch } from './client';
import type { WaitlistInput, WaitlistResponse } from '@/types/waitlist';

export const waitlistApi = {
  join: (body: WaitlistInput) => apiFetch<WaitlistResponse>('/api/waitlist', { method: 'POST', body }),
};
