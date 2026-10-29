import 'server-only';
import { cache } from 'react';
import { apiFetch, toQuery } from './client';
import type { RecruiterStats, TalentCandidatesQuery, TalentCandidatesResponse } from '@/types/talent';

export const talentApi = {
  stats: cache((): Promise<RecruiterStats> => apiFetch('/api/recruiter/stats')),

  candidates: (params: TalentCandidatesQuery = {}): Promise<TalentCandidatesResponse> =>
    apiFetch('/api/recruiter/candidates', { query: toQuery(params) }),
};
