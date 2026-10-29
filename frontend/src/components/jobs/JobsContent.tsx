import { JobsView } from './JobsView';
import { govtJobsApi } from '@/lib/govt-jobs';
import { jobsApi } from '@/lib/jobs';
import type { GovtJobList, PrivateJobList } from '@/types/jobs';
import { parseJobsSearchParams, type JobsUrlState } from '@/utils/job-filters';

const PER_PAGE = 15;
/** "All" mixes every job and pages on the client, like the legacy page. */
const ALL_JOBS_LIMIT = 500;
const EMPTY_GOVT_LIST: GovtJobList = { items: [], total: 0, totalPages: 1 };
const EMPTY_PRIVATE_LIST: PrivateJobList = { items: [], total: 0, totalPages: 1 };

export type JobsSearchParams = Promise<Record<string, string | string[] | undefined>>;

async function loadJobs({ q, location, company, tab, page, organization, status, sortBy }: JobsUrlState) {
  const [privateList, govtList, organizations] = await Promise.all([
    tab === 'govt'
      ? EMPTY_PRIVATE_LIST
      : jobsApi.list({ q, location, company, limit: ALL_JOBS_LIMIT }).catch(() => EMPTY_PRIVATE_LIST),
    tab === 'private'
      ? EMPTY_GOVT_LIST
      : govtJobsApi
          .list({
            search: [q, location].filter(Boolean).join(' '),
            organization,
            status,
            sortBy,
            page: tab === 'govt' ? page : 1,
            limit: tab === 'govt' ? PER_PAGE : ALL_JOBS_LIMIT,
          })
          .catch(() => EMPTY_GOVT_LIST),
    govtJobsApi.organizations().catch(() => []),
  ]);

  return { privateList, govtList, organizations, fetchedAt: Date.now() };
}

type JobsContentProps = {
  searchParams: JobsSearchParams;
  basePath?: string;
  seekerTools?: boolean;
};

export async function JobsContent({ searchParams, basePath, seekerTools }: JobsContentProps) {
  const urlState = parseJobsSearchParams(await searchParams);
  const { privateList, govtList, organizations, fetchedAt } = await loadJobs(urlState);

  return (
    <JobsView
      urlState={urlState}
      privateJobs={privateList.items}
      govtJobs={govtList.items}
      govtTotal={govtList.total}
      govtTotalPages={govtList.totalPages}
      organizations={organizations}
      now={fetchedAt}
      basePath={basePath}
      seekerTools={seekerTools}
    />
  );
}
