import 'server-only';
import { apiFetch } from './client';
import type { SupportContactInput, SupportContactResponse } from '@/types/support';

export const supportApi = {
  contact: (body: SupportContactInput) =>
    apiFetch<SupportContactResponse>('/api/support/contact', { method: 'POST', body }),
};
