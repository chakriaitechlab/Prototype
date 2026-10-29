import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { PhoneForm } from '@/components/onboarding/PhoneForm';
import { StepGuard } from '@/components/onboarding/StepGuard';

export const metadata: Metadata = {
  title: 'Verify Phone | Chakri.ai',
};

export default function RecruiterPhonePage() {
  return (
    <>
      <StepHeader
        role="RECRUITER"
        step="phone"
        title="Verify your phone"
        subtitle="Used for account verification only. We won’t show this on your public profile."
        backHref="/onboarding/role"
        backLabel="Back to role selection"
      />
      <Suspense fallback={null}>
        <StepGuard role="RECRUITER" step="phone" />
      </Suspense>
      <PhoneForm role="RECRUITER" />
    </>
  );
}
