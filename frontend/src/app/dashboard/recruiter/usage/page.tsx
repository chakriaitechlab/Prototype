import { Suspense } from 'react';
import type { Metadata } from 'next';
import { diamondsApi } from '@/lib/diamonds';
import { requireDashboard } from '@/utils/session';
import { UsageSkeleton } from '@/components/dashboard/usage/UsageSkeleton';
import { UsageView } from '@/components/dashboard/usage/UsageView';

export const metadata: Metadata = {
  title: 'Usage | Chakri.ai',
  description: 'Your diamond balance and diamond activity.',
};

export default function RecruiterUsagePage() {
  return (
    <Suspense fallback={<UsageSkeleton />}>
      <UsageContent />
    </Suspense>
  );
}

async function UsageContent() {
  await requireDashboard('RECRUITER');
  const [wallet, { activity }] = await Promise.all([diamondsApi.wallet(), diamondsApi.usage()]);

  return <UsageView wallet={wallet} activity={activity} />;
}
