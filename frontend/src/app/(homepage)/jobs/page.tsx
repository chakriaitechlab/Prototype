import { Suspense } from 'react';
import type { Metadata } from 'next';
import { JobsContent, type JobsSearchParams } from '@/components/jobs/JobsContent';
import { AppLoader } from '@/components/ui/AppLoader';

export const metadata: Metadata = {
  title: 'Find Jobs in Bangladesh | Chakri.ai',
  description: 'Browse government circulars and private jobs across Bangladesh, with filters by organization, status and deadline.',
  alternates: { canonical: '/jobs' },
};

export default function JobsPage({ searchParams }: { searchParams: JobsSearchParams }) {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AppLoader />
          <p style={{ margin: 0, color: 'var(--jp-gray-600)' }}>Loading jobs…</p>
        </div>
      }
    >
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}
