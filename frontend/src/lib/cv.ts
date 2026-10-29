import 'server-only';
import { apiFetch } from './client';
import type { BuiltCvProfile, CvApiResponse } from '@/types/cv';

export const cvApi = {
  get: () => apiFetch<CvApiResponse | null>('/api/cv'),
  save: (profile: BuiltCvProfile) =>
    apiFetch<{ success: boolean; message: string }>('/api/cv/save', {
      method: 'POST',
      body: { profile },
    }),
};
