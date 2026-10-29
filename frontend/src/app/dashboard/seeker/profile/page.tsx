import { Suspense } from 'react';
import type { Metadata } from 'next';
import { profileApi } from '@/lib/profile';
import { requireDashboard } from '@/utils/session';
import { toProfileTab } from '@/utils/profile';
import { ProfileView } from '@/components/dashboard/seeker/profile/ProfileView';
import { ProfileSkeleton } from '@/components/dashboard/seeker/profile/ProfileSkeleton';

export const metadata: Metadata = {
  title: 'Your Profile | Chakri.ai',
  description: 'Build your professional profile so recruiters can evaluate your background.',
};

type ProfileSearchParams = Promise<{ tab?: string | string[] }>;

async function ProfileLoader({ searchParams }: { searchParams: ProfileSearchParams }) {
  const user = await requireDashboard('SEEKER');
  const [profile, completion, { tab }] = await Promise.all([
    profileApi.get(),
    profileApi.completion().catch(() => null),
    searchParams,
  ]);

  return <ProfileView user={user} profile={profile} completion={completion} initialTab={toProfileTab(tab)} />;
}

export default function SeekerProfilePage({ searchParams }: { searchParams: ProfileSearchParams }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileLoader searchParams={searchParams} />
    </Suspense>
  );
}
