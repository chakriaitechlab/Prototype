import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HubGreeting, HubGreetingView } from '@/components/dashboard/recruiter/home/HubGreeting';
import { KpiCards } from '@/components/dashboard/recruiter/home/KpiCards';
import { KpiCardsSkeleton } from '@/components/dashboard/recruiter/home/KpiCardsSkeleton';
import { RecentCandidates } from '@/components/dashboard/recruiter/home/RecentCandidates';
import { RecentJobs } from '@/components/dashboard/recruiter/home/RecentJobs';

export const metadata: Metadata = {
  title: 'Dashboard | Chakri.ai',
};

export default function RecruiterDashboardPage() {
  return (
    <div className="recruiter-hub-view">
      <Suspense fallback={<HubGreetingView name="…" />}>
        <HubGreeting />
      </Suspense>

      <Suspense fallback={<KpiCardsSkeleton />}>
        <KpiCards />
      </Suspense>

      <Suspense fallback={<div className="cdash-empty">Loading candidates…</div>}>
        <RecentCandidates />
      </Suspense>

      <Suspense fallback={<div className="cdash-empty">Loading jobs…</div>}>
        <RecentJobs />
      </Suspense>
    </div>
  );
}
