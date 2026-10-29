import { redirect } from 'next/navigation';
import { hireApi } from '@/lib/hire';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';
import { JobsTable } from '@/components/dashboard/recruiter/jobs/JobsTable';
import { parseStatusFilter } from '@/utils/job-posting';
import { myPostsPath } from '@/utils/routes';
import { MyPostsEmpty } from './MyPostsEmpty';
import { MyPostsPagination } from './MyPostsPagination';
import { MyPostsToolbar } from './MyPostsToolbar';

const JOBS_PER_PAGE = 8;
const MAX_QUERY_LENGTH = 100;

export type MyPostsSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSearchParams(params: Awaited<MyPostsSearchParams>) {
  const search = (firstValue(params.q) ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  const status = parseStatusFilter(firstValue(params.status));
  const page = Math.max(1, Math.floor(Number(firstValue(params.page))) || 1);
  return { search, status, page };
}

export async function MyPostsContent({ searchParams }: { searchParams: MyPostsSearchParams }) {
  const { search, status, page } = parseSearchParams(await searchParams);
  const data = await hireApi
    .jobs({ page, limit: JOBS_PER_PAGE, status, search: search || undefined })
    .catch(() => null);

  if (data && data.items.length === 0 && data.total > 0) {
    redirect(myPostsPath({ status, search, page: data.totalPages }));
  }

  return (
    <>
      <MyPostsToolbar total={data?.allTotal ?? 0} status={status} search={search} />

      {data === null ? (
        <div className="my-4 border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
          <h3 className="mb-1.5 text-lg font-bold tracking-tight text-[#18191c] sm:text-xl">Couldn&apos;t load jobs</h3>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#767f8c]">
            An error occurred while fetching your job listings. Please try again.
          </p>
          <RetryButton label="Retry" className="jp-btn jp-btn--outline h-[42px]! px-6! text-sm!" />
        </div>
      ) : data.items.length === 0 ? (
        <MyPostsEmpty hasJobs={data.allTotal > 0} status={status} search={search} />
      ) : (
        <>
          <div className="cdash-table-wrap">
            <JobsTable jobs={data.items} />
          </div>
          <MyPostsPagination page={data.page} totalPages={data.totalPages} status={status} search={search} />
        </>
      )}
    </>
  );
}
