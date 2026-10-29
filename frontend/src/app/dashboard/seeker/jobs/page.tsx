import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobsContent, type JobsSearchParams } from '@/components/jobs/JobsContent';
import { AppLoader } from '@/components/ui/AppLoader';

export const metadata: Metadata = {
  title: 'Find Jobs | Chakri.ai',
};

export default function SeekerJobsPage({ searchParams }: { searchParams: JobsSearchParams }) {
  return (
    <div className="jp jp--dashboard-embed">
      <Suspense
        fallback={
          <div className="jp-filter-card jp-jobs-status">
            <AppLoader />
            <p>Loading jobs…</p>
          </div>
        }
      >
        <JobsContent searchParams={searchParams} basePath="/dashboard/seeker/jobs" seekerTools />
      </Suspense>
    </div>
  );
}
