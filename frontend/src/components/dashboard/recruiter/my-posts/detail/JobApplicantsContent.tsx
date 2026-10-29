import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ApiError } from '@/lib/client';
import { hireApi } from '@/lib/hire';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';
import type { ApplicantFilter, HireApplicantsResponse } from '@/types/hire';
import { formatDate } from '@/utils/format';
import { jobApplicantsPath, jobDetailPath, RECRUITER_MY_POSTS_PATH } from '@/utils/routes';
import { ApplicantsEmpty } from './ApplicantsEmpty';
import { ApplicantsPagination } from './ApplicantsPagination';
import { ApplicantsStats } from './ApplicantsStats';
import { ApplicantsTable } from './ApplicantsTable';
import { ApplicantsToolbar } from './ApplicantsToolbar';

const APPLICANTS_PER_PAGE = 10;
const MAX_QUERY_LENGTH = 100;
const FILTERS: ApplicantFilter[] = ['review', 'invited', 'rejected'];

export type ApplicantsSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSearchParams(params: Awaited<ApplicantsSearchParams>) {
  const q = (firstValue(params.q) ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  const status = FILTERS.find((filter) => filter === firstValue(params.status));
  const page = Math.max(1, Math.floor(Number(firstValue(params.page))) || 1);
  return { q, status, page };
}

function jobMeta({ employmentType, location, deadline, status }: HireApplicantsResponse['job']) {
  return [
    employmentType || 'Full Time',
    location || 'Remote',
    deadline ? `Expires ${formatDate(deadline)}` : null,
    status === 'ACTIVE' ? 'Active' : status === 'DRAFT' ? 'Draft' : 'Expired',
  ]
    .filter(Boolean)
    .join(' • ');
}

interface JobApplicantsContentProps {
  params: Promise<{ id: string }>;
  searchParams: ApplicantsSearchParams;
}

export async function JobApplicantsContent({ params, searchParams }: JobApplicantsContentProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { q, status, page } = parseSearchParams(query);
  const data = await hireApi
    .applicants(id, { page, limit: APPLICANTS_PER_PAGE, status, q: q || undefined })
    .catch((err: unknown) => {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) notFound();
      return null;
    });

  if (data && data.items.length === 0 && data.total > 0) {
    redirect(jobApplicantsPath(id, { status, q, page: data.totalPages }));
  }

  return (
    <>
      <div className="mb-5 pt-2 sm:pt-3">
        <Link
          href={RECRUITER_MY_POSTS_PATH}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#0a65cc] hover:underline"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to My Posts
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="recruiter-page-title">{data?.job.title ?? 'Applicants'}</h1>
            {data && <p className="mt-1 text-[13.5px] leading-[1.4] text-[#5e6670]">{jobMeta(data.job)}</p>}
          </div>
          <Link href={jobDetailPath(id)} className="jp-btn jp-btn--outline h-11! px-5! text-sm!">
            <ExternalLink size={16} aria-hidden />
            View job post
          </Link>
        </div>
      </div>

      {data === null ? (
        <div className="my-4 border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
          <h3 className="mb-1.5 text-lg font-bold tracking-tight text-[#18191c] sm:text-xl">Couldn&apos;t load applicants</h3>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#767f8c]">
            An error occurred while fetching the applicants for this job. Please try again.
          </p>
          <RetryButton label="Retry" className="jp-btn jp-btn--outline h-[42px]! px-6! text-sm!" />
        </div>
      ) : (
        <>
          <ApplicantsStats counts={data.counts} />
          <ApplicantsToolbar jobId={id} counts={data.counts} status={status} search={q} />

          {data.items.length === 0 ? (
            <ApplicantsEmpty jobId={id} hasApplicants={data.counts.all > 0} status={status} search={q} />
          ) : (
            <>
              <div className="cdash-table-wrap border border-[#e4e5e8] bg-white">
                <ApplicantsTable jobId={id} jobTitle={data.job.title} applicants={data.items} />
              </div>
              <ApplicantsPagination jobId={id} page={data.page} totalPages={data.totalPages} status={status} search={q} />
            </>
          )}
        </>
      )}
    </>
  );
}
