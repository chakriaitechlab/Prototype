import 'server-only';
import { apiFetch, toQuery } from './client';
import type {
  ApplicantDecision,
  ApplicantDecisionResult,
  HireApplicantsQuery,
  HireApplicantsResponse,
  HireJobCreate,
  HireJobCreated,
  HireJobDetail,
  HireJobStatus,
  HireJobUpdate,
  HireJobsQuery,
  HireJobsResponse,
} from '@/types/hire';

export const hireApi = {
  jobs: (params: HireJobsQuery = {}): Promise<HireJobsResponse> =>
    apiFetch('/api/hire/jobs', { query: toQuery(params) }),

  job: (jobId: string): Promise<HireJobDetail> => apiFetch(`/api/hire/jobs/${encodeURIComponent(jobId)}`),

  create: (job: HireJobCreate): Promise<HireJobCreated> => apiFetch('/api/hire/jobs', { method: 'POST', body: job }),

  update: (jobId: string, job: HireJobCreate): Promise<HireJobCreated> =>
    apiFetch(`/api/hire/jobs/${encodeURIComponent(jobId)}`, { method: 'PUT', body: job }),

  updateStatus: (jobId: string, status: HireJobStatus): Promise<HireJobUpdate> =>
    apiFetch(`/api/hire/jobs/${encodeURIComponent(jobId)}`, { method: 'PATCH', body: { status } }),

  remove: (jobId: string): Promise<{ id: string }> =>
    apiFetch(`/api/hire/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' }),

  applicants: (jobId: string, params: HireApplicantsQuery = {}): Promise<HireApplicantsResponse> =>
    apiFetch(`/api/hire/jobs/${encodeURIComponent(jobId)}/applicants`, { query: toQuery(params) }),

  decide: (jobId: string, applicationId: string, decision: ApplicantDecision, note?: string): Promise<ApplicantDecisionResult> =>
    apiFetch(
      `/api/hire/jobs/${encodeURIComponent(jobId)}/applicants/${encodeURIComponent(applicationId)}/${decision}`,
      { method: 'POST', body: { note } },
    ),
};
