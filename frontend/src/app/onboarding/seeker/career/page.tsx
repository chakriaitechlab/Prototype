import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { CareerForm } from '@/components/onboarding/seeker/career/CareerForm';
import { requireOnboardingStep } from '@/utils/session';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export const metadata: Metadata = {
  title: 'Career Details | Chakri.ai',
};

export default function SeekerCareerPage() {
  return (
    <>
      <StepHeader
        role="SEEKER"
        step="career"
        title="Career details"
        subtitle="Add your professional title and a summary so employers and recruiters can quickly understand what you do."
        backHref="/onboarding/seeker/cv"
      />
      <Suspense fallback={<AppBootScreen embedded message="Loading career setup…" subMessage="Preparing your preferences" />}>
        <Step />
      </Suspense>
    </>
  );
}

async function Step() {
  const user = await requireOnboardingStep('SEEKER', 'career');
  const { seekerProfile } = user;

  return <CareerForm initialHeadline={seekerProfile?.headline ?? ''} initialAbout={seekerProfile?.about ?? ''} />;
}
