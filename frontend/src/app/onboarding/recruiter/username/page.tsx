import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { UsernameForm } from '@/components/onboarding/UsernameForm';
import { requireOnboardingStep } from '@/utils/session';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export const metadata: Metadata = {
  title: 'Company Username | Chakri.ai',
};

export default function RecruiterUsernamePage() {
  return (
    <>
      <StepHeader
        role="RECRUITER"
        step="username"
        title="Company username"
        subtitle="A unique handle for your company. Candidates can find you by this username in messages."
        backHref="/onboarding/recruiter/company"
      />
      <Suspense fallback={<AppBootScreen embedded message="Loading username setup…" subMessage="Preparing onboarding" />}>
        <Step />
      </Suspense>
    </>
  );
}

async function Step() {
  const user = await requireOnboardingStep('RECRUITER', 'username');
  return <UsernameForm role="RECRUITER" currentUsername={user.company?.username ?? null} />;
}
