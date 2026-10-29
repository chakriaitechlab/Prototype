import 'server-only';
import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { ApiError, apiFetch, publicFetch, toQuery } from './client';
import { jobDetailTag } from '@/utils/job-detail';
import type { GovtJobItem, JobBadge, JobDetail, JobListQuery, JobListResponse, MatchExplanationResult, MatchScore, PrivateJobItem, PrivateJobList, SavedJobsData, SavedJobsResponse, SeekerApplication, JobApplicationInfo, SubmittedApplication } from '@/types/jobs';

function toJobBadge(employmentType: string | null): JobBadge {
  const value = (employmentType ?? '').toLowerCase();
  if (value.includes('part')) return 'PART-TIME';
  if (value.includes('intern')) return 'INTERNSHIP';
  if (value.includes('contract')) return 'CONTRACT';
  if (value.includes('temp')) return 'TEMPORARY';
  return 'FULL-TIME';
}

function toSalaryLabel(salary: string | null) {
  const amount = salary?.replace(/\s*\/\s*(mo|month|yr|year)\b/gi, '').trim();
  if (!amount) return 'Salary: —';
  return amount.startsWith('Salary:') ? amount : `Salary: ${amount}`;
}

function toPrivateJobItem(job: JobListResponse['items'][number]): PrivateJobItem {
  return {
    id: job.id,
    kind: 'private',
    title: job.title,
    type: toJobBadge(job.employmentType),
    salary: toSalaryLabel(job.salary),
    company: job.company?.name || 'Company',
    location: job.location || 'Remote',
    category: job.category ?? undefined,
    logoUrl: job.company?.logoUrl ?? undefined,
    featured: job.featured,
    postedAt: job.createdAt,
  };
}

function toGovtJobItem(job: SavedJobsResponse['govtJobs'][number]): GovtJobItem {
  return {
    id: String(job.id),
    kind: 'govt',
    title: job.job_title,
    titleBn: job.job_title_bn,
    organizationName: job.job_utilities_govtorganization?.name || 'সরকারি প্রতিষ্ঠান',
    organizationNameBn: job.job_utilities_govtorganization?.name_bn ?? null,
    organizationShortName: job.job_utilities_govtorganization?.short_name || '',
    organizationLogo: job.job_utilities_govtorganization?.logo ?? null,
    vacancy: job.vacancy,
    vacancyNotSpecific: job.vacancy_not_specific,
    viewCount: job.view_count,
    publishedDate: job.published_date || '',
    deadlineDate: job.deadline_date || '',
  };
}

const MISSING_JOB_STATUSES = [400, 404];

async function publicJob(jobId: string): Promise<JobDetail | null> {
  'use cache';
  cacheTag(jobDetailTag(jobId));

  try {
    const job = await publicFetch<JobDetail>(`/api/jobs/${encodeURIComponent(jobId)}`);
    cacheLife('hours');
    return job;
  } catch (err) {
    if (err instanceof ApiError && MISSING_JOB_STATUSES.includes(err.status)) {
      cacheLife('minutes');
      return null;
    }
    throw err;
  }
}

const EMPTY_JOB_LIST: PrivateJobList = { items: [], total: 0, totalPages: 1 };

/** Never throws: marketing pages render their empty states when the API is down, and retry soon. */
async function publicJobList(params: JobListQuery = {}): Promise<PrivateJobList> {
  'use cache';
  cacheTag('jobs');

  try {
    const search = new URLSearchParams(toQuery(params)).toString();
    const { items, total, totalPages } = await publicFetch<JobListResponse>(`/api/jobs${search ? `?${search}` : ''}`);
    cacheLife('minutes');
    return { items: items.map(toPrivateJobItem), total, totalPages };
  } catch {
    // 'seconds' would make the page dynamic and fail prerendering whenever the API is down at build time.
    cacheLife('minutes');
    return EMPTY_JOB_LIST;
  }
}

export const jobsApi = {
  job: publicJob,

  /** Logged-out, cached listing for marketing pages; `list` stays per-user for the jobs board. */
  publicList: publicJobList,

  list: async (params: JobListQuery = {}): Promise<PrivateJobList> => {
    const { items, total, totalPages } = await apiFetch<JobListResponse>('/api/jobs', { query: toQuery(params) });
    return { items: items.map(toPrivateJobItem), total, totalPages };
  },

  applications: cache(() => apiFetch<SeekerApplication[]>('/api/jobs/applications')),

  application: cache((jobId: string) =>
    apiFetch<JobApplicationInfo>(`/api/jobs/${encodeURIComponent(jobId)}/application`),
  ),

  apply: (jobId: string, body: FormData) =>
    apiFetch<SubmittedApplication>(`/api/jobs/${encodeURIComponent(jobId)}/apply`, { method: 'POST', body }),

  savedJobs: cache(async (): Promise<SavedJobsData> => {
    const data = await apiFetch<SavedJobsResponse>('/api/jobs/saved');
    return {
      ids: data.ids,
      privateJobs: data.privateJobs.map(toPrivateJobItem),
      govtJobs: data.govtJobs.map(toGovtJobItem),
      total: data.total,
    };
  }),

  toggleSave: (jobId: string, jobType?: 'private' | 'govt') =>
    apiFetch<{ saved: boolean; message: string }>(`/api/jobs/save/${encodeURIComponent(jobId)}`, {
      method: 'POST',
      body: { jobType },
    }),

  matchScores: (ids: string[]) =>
    apiFetch<MatchScore[]>('/api/jobs/match-scores', { method: 'POST', body: { ids } }),

  matchExplanation: (opportunityId: string) =>
    apiFetch<MatchExplanationResult>(`/api/jobs/${encodeURIComponent(opportunityId)}/match-explanation`),
};
