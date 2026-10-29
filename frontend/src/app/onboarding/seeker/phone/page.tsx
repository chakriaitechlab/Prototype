import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { PhoneForm } from '@/components/onboarding/PhoneForm';
import { StepGuard } from '@/components/onboarding/StepGuard';

export const metadata: Metadata = {
  title: 'Verify Phone | Chakri.ai',
};

export default function SeekerPhonePage() {
  return (
    <>
      <StepHeader
        role="SEEKER"
        step="phone"
        title="Verify your phone"
        subtitle="Used for account verification only. We won’t show this on your public profile."
        backHref="/"
        backLabel="Back to Home"
      />
      <Suspense fallback={null}>
        <StepGuard role="SEEKER" step="phone" />
      </Suspense>
      <PhoneForm role="SEEKER" />
    </>
  );
}
