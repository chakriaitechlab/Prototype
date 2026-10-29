import { Suspense } from 'react';
import type { Metadata } from 'next';
import { diamondsApi } from '@/lib/diamonds';
import { paymentsApi } from '@/lib/payments';
import { requireDashboard } from '@/utils/session';
import { CreditsSkeleton } from '@/components/dashboard/credits/CreditsSkeleton';
import { CreditsView } from '@/components/dashboard/credits/CreditsView';

export const metadata: Metadata = {
  title: 'Plans & Pricing | Chakri.ai',
  description: 'Choose your career plan and track your payments.',
};

export default function SeekerCreditsPage() {
  return (
    <Suspense fallback={<CreditsSkeleton />}>
      <CreditsContent />
    </Suspense>
  );
}

async function CreditsContent() {
  await requireDashboard('SEEKER');
  const [wallet, { plans }, { payments }] = await Promise.all([
    diamondsApi.wallet(),
    diamondsApi.plans('seeker'),
    paymentsApi.history(),
  ]);

  return <CreditsView audience="seeker" wallet={wallet} plans={plans} payments={payments} />;
}
