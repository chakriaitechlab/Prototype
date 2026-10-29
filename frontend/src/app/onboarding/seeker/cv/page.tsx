import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { CvForm } from '@/components/onboarding/seeker/cv/CvForm';
import { StepGuard } from '@/components/onboarding/StepGuard';

export const metadata: Metadata = {
  title: 'Upload Resume | Chakri.ai',
};

export default function SeekerCvPage() {
  return (
    <>
      <StepHeader role="SEEKER" step="cv" backHref="/onboarding/seeker/username" />
      <Suspense fallback={null}>
        <StepGuard role="SEEKER" step="cv" />
      </Suspense>
      <CvForm />
    </>
  );
}
