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

export default function RecruiterVerifyPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <StepHeader
        role="RECRUITER"
        step="verify"
        backHref="/onboarding/recruiter/phone"
        backLabel="Change Phone Number"
      />
      <Suspense fallback={null}>
        <StepGuard role="RECRUITER" step="phone" />
      </Suspense>
      <Suspense fallback={null}>
        <Step searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Step({ searchParams }: { searchParams: SearchParams }) {
  const { phone } = await searchParams;
  if (typeof phone !== 'string' || !/^\d{10,15}$/.test(phone)) redirect('/onboarding/recruiter/phone');

  return <PhoneOtpForm phoneNumber={phone} changeHref="/onboarding/recruiter/phone" />;
}
