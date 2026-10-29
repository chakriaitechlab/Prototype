import { Suspense } from 'react';
import Link from 'next/link';
import { jobsApi } from '@/lib/jobs';
import { RecentApplicationsTable } from './RecentApplicationsTable';
import { TableSkeleton } from './HomeSkeletons';

export function RecentApplications() {
  return (
    <section data-purpose="recently-applied-section">
      <div className="cdash-section-head">
        <div>
          <h2>Recently Applied</h2>
          <p className="cdash-section-sub">Track your active applications and profile matches.</p>
        </div>
        <Link href="/dashboard/seeker/applications">
          View All Applications
          <svg className="cdash-ico-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      <div className="cdash-table-wrap">
        <Suspense fallback={<TableSkeleton />}>
          <ApplicationsTable />
        </Suspense>
      </div>
    </section>
  );
}

async function ApplicationsTable() {
  const applications = await jobsApi.applications().catch(() => null);

  if (!applications) {
    return (
      <div className="cdash-empty">
        Couldn&apos;t load your applications. <Link href="/dashboard/seeker">Try again</Link>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="cdash-empty">
        No applications yet. <Link href="/dashboard/seeker/jobs">Find jobs</Link>
      </div>
    );
  }

  return <RecentApplicationsTable applications={applications} />;
}
