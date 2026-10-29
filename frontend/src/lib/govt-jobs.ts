import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { ApiError, apiFetch, publicFetch, toQuery } from './client';
import type {
  GovtJobDetail,
  GovtJobDetailResponse,
  GovtJobItem,
  GovtJobList,
  GovtJobsQuery,
  GovtJobsResponse,
  GovtOrganization,
} from '@/types/jobs';
import { DEFAULT_ORGANIZATION, govtJobDetailTag, teletalkUrl } from '@/utils/govt-job-detail';

const MAX_LIMIT = 500;

function toGovtJobItem(job: GovtJobsResponse['data'][number]): GovtJobItem {
  const organization = job.job_utilities_govtorganization;

  return {
    id: String(job.id),
    kind: 'govt',
    title: job.job_title,
    titleBn: job.job_title_bn,
    organizationName: organization?.name ?? '',
    organizationNameBn: organization?.name_bn ?? null,
    organizationShortName: organization?.short_name ?? '',
    organizationLogo: organization?.logo || null,
    vacancy: job.vacancy,
    vacancyNotSpecific: job.vacancy_not_specific,
    viewCount: job.view_count,
    publishedDate: job.published_date,
    deadlineDate: job.deadline_date,
  };
}

const MISSING_JOB_STATUSES = [400, 404];

function toGovtJobDetail(job: NonNullable<GovtJobDetailResponse['details']>): GovtJobDetail {
  const organization = job.job_utilities_govtorganization;

  return {
    id: String(job.id),
    title: job.job_title_bn || job.job_title,
    organizationName: organization?.name_bn || organization?.name || DEFAULT_ORGANIZATION,
    organizationLogo: teletalkUrl(organization?.logo),
    advertisementNo: job.advertisement_no,
    advertisementFile: teletalkUrl(job.advertisement_file),
    applicationSite: job.application_site,
    vacancy: job.vacancy,
    minAge: job.min_age,
    maxAge: job.max_age,
    publishedDate: job.published_date ?? job.advertisement_published_date,
    deadlineDate: job.deadline_date,
    isExpired: job.deadline_date ? new Date(job.deadline_date).getTime() <= Date.now() : false,
    admitCard: job.admit_card ? { url: teletalkUrl(job.download_url || job.admit_card_upload) } : null,
    result: job.is_result ? { url: teletalkUrl(job.result_upload) } : null,
    circular: job.circular_details,
  };
}

async function govtJob(jobId: string): Promise<GovtJobDetail | null> {
  'use cache';
  cacheTag(govtJobDetailTag(jobId));

  try {
    const { details } = await publicFetch<GovtJobDetailResponse>(`/api/govt-jobs/v1/${encodeURIComponent(jobId)}`);
    if (!details) {
      cacheLife('minutes');
      return null;
    }
    cacheLife('hours');
    return toGovtJobDetail(details);
  } catch (err) {
    if (err instanceof ApiError && MISSING_JOB_STATUSES.includes(err.status)) {
      cacheLife('minutes');
      return null;
    }
    throw err;
  }
}

export const govtJobsApi = {
  job: govtJob,

  list: async (params: GovtJobsQuery = {}): Promise<GovtJobList> => {
    const { data, meta } = await apiFetch<GovtJobsResponse>('/api/govt-jobs/v1', { query: toQuery(params) });
    return { items: data.map(toGovtJobItem), total: meta.total, totalPages: meta.totalPages };
  },

  /** Organizations with their circular counts, most active first. */
  organizations: async (): Promise<GovtOrganization[]> => {
    const { items } = await govtJobsApi.list({ status: 'all', limit: MAX_LIMIT });
    const byName = new Map<string, GovtOrganization>();

    for (const { organizationName: name, organizationNameBn: nameBn } of items) {
      if (!name) continue;
      const existing = byName.get(name);
      if (existing) existing.jobCount += 1;
      else byName.set(name, { name, nameBn, jobCount: 1 });
    }

    return [...byName.values()].sort((a, b) => b.jobCount - a.jobCount);
  },
};
