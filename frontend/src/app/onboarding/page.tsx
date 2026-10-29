import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireUser } from '@/utils/session';
import { pathForUser } from '@/utils/routes';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export default function OnboardingPage() {
  return (
    <Suspense fallback={<AppBootScreen embedded message="Loading" subMessage="Preparing onboarding" />}>
      <OnboardingRedirect />
    </Suspense>
  );
}

async function OnboardingRedirect(): Promise<never> {
  const user = await requireUser();
  redirect(pathForUser(user));
}
