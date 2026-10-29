import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { PhoneOtpForm } from '@/components/onboarding/PhoneOtpForm';
import { StepGuard } from '@/components/onboarding/StepGuard';

export const metadata: Metadata = {
  title: 'Verify Phone | Chakri.ai',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function SeekerVerifyPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <StepHeader
        role="SEEKER"
        step="verify"
        backHref="/onboarding/seeker/phone"
        backLabel="Change Phone Number"
      />
      <Suspense fallback={null}>
        <StepGuard role="SEEKER" step="phone" />
      </Suspense>
      <Suspense fallback={null}>
        <Step searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Step({ searchParams }: { searchParams: SearchParams }) {
  const { phone } = await searchParams;
  if (typeof phone !== 'string' || !/^\d{10,15}$/.test(phone)) redirect('/onboarding/seeker/phone');

  return <PhoneOtpForm phoneNumber={phone} changeHref="/onboarding/seeker/phone" />;
}
