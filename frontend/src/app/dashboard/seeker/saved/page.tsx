import { Suspense } from 'react';
import type { Metadata } from 'next';
import { jobsApi } from '@/lib/jobs';
import { requireDashboard } from '@/utils/session';
import { SavedJobsSkeleton } from '@/components/dashboard/seeker/saved/SavedJobsSkeleton';
import { SavedJobsView } from '@/components/dashboard/seeker/saved/SavedJobsView';

export const metadata: Metadata = {
  title: 'Favorite Jobs | Chakri.ai',
  description: 'Manage and review your saved job opportunities.',
};

export default function SeekerSavedJobsPage() {
  return (
    <Suspense fallback={<SavedJobsSkeleton />}>
      <SavedJobsContent />
    </Suspense>
  );
}

async function loadSavedJobs() {
  await requireDashboard('SEEKER');
  return jobsApi.savedJobs();
}

async function SavedJobsContent() {
  const data = await loadSavedJobs();

  return <SavedJobsView data={data} />;
}
