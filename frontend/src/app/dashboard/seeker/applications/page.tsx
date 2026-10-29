import { Suspense } from 'react';
import type { Metadata } from 'next';
import { jobsApi } from '@/lib/jobs';
import { requireDashboard } from '@/utils/session';
import { ApplicationsSkeleton } from '@/components/dashboard/seeker/applications/ApplicationsSkeleton';
import { ApplicationsView } from '@/components/dashboard/seeker/applications/ApplicationsView';

export const metadata: Metadata = {
  title: 'Applications | Chakri.ai',
  description: 'Track and manage your submitted job applications and interviews.',
};

export default function SeekerApplicationsPage() {
  return (
    <Suspense fallback={<ApplicationsSkeleton />}>
      <ApplicationsContent />
    </Suspense>
  );
}

async function ApplicationsContent() {
  await requireDashboard('SEEKER');
  const applications = await jobsApi.applications().catch(() => []);

  return <ApplicationsView applications={applications} />;
}
