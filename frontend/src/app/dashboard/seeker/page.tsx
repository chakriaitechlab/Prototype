import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Greeting } from '@/components/dashboard/seeker/home/Greeting';
import { MetricCards } from '@/components/dashboard/seeker/home/MetricCards';
import { ProfileAlert } from '@/components/dashboard/seeker/home/ProfileAlert';
import { RecentApplications } from '@/components/dashboard/seeker/home/RecentApplications';
import { GreetingSkeleton, MetricCardsSkeleton, ProfileAlertSkeleton } from '@/components/dashboard/seeker/home/HomeSkeletons';

export const metadata: Metadata = {
  title: 'Dashboard | Chakri.ai',
};

export default function SeekerDashboardPage() {
  return (
    <>
      <Suspense fallback={<GreetingSkeleton />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<MetricCardsSkeleton />}>
        <MetricCards />
      </Suspense>
      <Suspense fallback={<ProfileAlertSkeleton />}>
        <ProfileAlert />
      </Suspense>
      <RecentApplications />
    </>
  );
}
