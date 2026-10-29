import { Suspense } from 'react';
import type { Metadata } from 'next';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { PhotoForm } from '@/components/onboarding/PhotoForm';
import { requireOnboardingStep } from '@/utils/session';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export const metadata: Metadata = {
  title: 'Profile Photo | Chakri.ai',
};

export default function SeekerPhotoPage() {
  return (
    <>
      <StepHeader
        role="SEEKER"
        step="photo"
        title="Add a profile photo"
        subtitle="A clear photo helps employers recognise you. You can replace it later."
        backHref="/onboarding/seeker/phone"
      />
      <Suspense fallback={<AppBootScreen embedded message="Loading photo setup…" subMessage="Preparing onboarding" />}>
        <Step />
      </Suspense>
    </>
  );
}

async function Step() {
  const user = await requireOnboardingStep('SEEKER', 'photo');
  return <PhotoForm existingAvatarUrl={user.avatarUrl} name={user.name} />;
}
