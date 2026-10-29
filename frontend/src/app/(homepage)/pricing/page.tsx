import type { Metadata } from 'next';
import { diamondsApi } from '@/lib/diamonds';
import { PricingView } from '@/components/homepage/pricing/PricingView';

export const metadata: Metadata = {
  title: 'Pricing | Chakri.ai',
  description:
    'Simple monthly plans for job seekers and recruiters. Every account gets free diamonds each month to power the AI tools.',
};

export default async function PricingPage() {
  const [seeker, recruiter] = await Promise.all([diamondsApi.plans('seeker'), diamondsApi.plans('recruiter')]);

  return <PricingView seekerPlans={seeker.plans} recruiterPlans={recruiter.plans} />;
}
