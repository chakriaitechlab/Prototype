import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UserCheck } from 'lucide-react';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { UsernameForm } from '@/components/onboarding/UsernameForm';
import { requireOnboardingStep } from '@/utils/session';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export const metadata: Metadata = {
  title: 'Choose Username | Chakri.ai',
};

export default function SeekerUsernamePage() {
  return (
    <>
      <StepHeader role="SEEKER" step="username" backHref="/onboarding/seeker/photo" />

      <header className="jp-auth-heading">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <UserCheck size={22} style={{ color: '#0a65cc' }} />
          <h1 style={{ margin: 0 }}>Choose your username</h1>
        </div>
        <p className="jp-auth-subtitle">
          Your unique public handle for your professional profile. Employers and recruiters can view your portfolio at
          this link.
        </p>
      </header>

      <Suspense fallback={<AppBootScreen embedded message="Loading username setup…" subMessage="Preparing your profile" />}>
        <Step />
      </Suspense>
    </>
  );
}

async function Step() {
  const user = await requireOnboardingStep('SEEKER', 'username');
  return <UsernameForm role="SEEKER" currentUsername={user.username} />;
}
