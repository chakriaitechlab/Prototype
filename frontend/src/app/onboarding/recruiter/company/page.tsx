import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { CompanyForm } from '@/components/onboarding/recruiter/company/CompanyForm';
import { requireOnboardingStep } from '@/utils/session';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export const metadata: Metadata = {
  title: 'Your Company | Chakri.ai',
};

export default function RecruiterCompanyPage() {
  return (
    <>
      <StepHeader
        role="RECRUITER"
        step="company"
        title="Your company"
        subtitle="Tell candidates who they’re applying to. You can finish the full company profile later."
        backHref="/onboarding/recruiter/photo"
      />
      <Suspense fallback={<AppBootScreen embedded message="Loading company setup…" subMessage="Preparing onboarding" />}>
        <Step />
      </Suspense>
    </>
  );
}

async function Step() {
  const user = await requireOnboardingStep('RECRUITER', 'company');
  return <CompanyForm initialName={user.company?.name ?? ''} />;
}
