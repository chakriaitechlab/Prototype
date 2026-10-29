import 'server-only';
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { ApiError, apiFetch, publicFetch } from './client';
import { publicProfileTag } from '@/utils/public-profile';
import type { ProfileCompletion, ProfileUpdate, PublicProfile, SeekerProfile } from '@/types/profile';

const MISSING_PROFILE_STATUSES = [400, 404];

async function publicProfile(username: string): Promise<PublicProfile | null> {
  'use cache';
  cacheTag(publicProfileTag(username));

  try {
    const profile = await publicFetch<PublicProfile>(`/api/profile/public/${encodeURIComponent(username)}`);
    cacheLife('hours');
    return profile;
  } catch (err) {
    if (err instanceof ApiError && MISSING_PROFILE_STATUSES.includes(err.status)) {
      cacheLife('minutes');
      return null;
    }
    throw err;
  }
}

export const profileApi = {
  completion: cache(() => apiFetch<ProfileCompletion>('/api/profile/completion')),
  get: () => apiFetch<SeekerProfile>('/api/profile'),
  update: (body: ProfileUpdate) => apiFetch<SeekerProfile>('/api/profile', { method: 'PATCH', body }),
  uploadResume: (file: FormData) =>
    apiFetch<{ cvUrl: string }>('/api/profile/resume', { method: 'POST', body: file }),
  deleteResume: () => apiFetch<{ cvUrl: null }>('/api/profile/resume', { method: 'DELETE' }),
  uploadProjectPhoto: (file: FormData) =>
    apiFetch<{ url: string }>('/api/profile/project-photo', { method: 'POST', body: file }),
  publicProfile,
};
