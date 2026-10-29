import Link from 'next/link';
import { hireApi } from '@/lib/hire';
import { EmptyJobs } from './EmptyJobs';
import { JobsTable } from '@/components/dashboard/recruiter/jobs/JobsTable';
import { RetryButton } from '@/components/dashboard/recruiter/RetryButton';

export async function RecentJobs() {
  const data = await hireApi.jobs({ page: 1, limit: 8 }).catch(() => null);

  return (
    <section data-purpose="recently-posted-jobs">
      <div className="cdash-section-head">
        <h2>Recently Posted Jobs</h2>
        <Link href="/dashboard/recruiter/my-posts">
          View all
          <svg className="cdash-ico-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
      <div className="cdash-table-wrap">
        {data === null ? (
          <div className="cdash-empty">
            Couldn&apos;t load jobs. <RetryButton />
          </div>
        ) : data.items.length === 0 ? (
          <EmptyJobs />
        ) : (
          <JobsTable jobs={data.items} />
        )}
      </div>
    </section>
  );
}
