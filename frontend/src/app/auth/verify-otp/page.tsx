import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { OtpForm } from '@/components/ui/OtpForm';
import { resendEmailCodeAction, verifyEmailAction, verifyResetCodeAction } from '@/actions/auth.actions';
import { redirectIfAuthenticated } from '@/utils/session';
import type { OtpType } from '@/types/auth';

export const metadata: Metadata = {
  title: 'Verify Email | Chakri.ai',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function readParams(searchParams: SearchParams) {
  const params = await searchParams;
  const email = typeof params.email === 'string' ? params.email.trim().toLowerCase() : '';
  const type: OtpType = params.type === 'reset' ? 'reset' : params.type === 'login' ? 'login' : 'signup';
  return { email, type };
}

export default function VerifyOtpPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <Suspense fallback={null}>
        <VerifyOtpRedirect searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={null}>
        <VerifyOtp searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function VerifyOtpRedirect({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await readParams(searchParams);
  if (type !== 'reset') await redirectIfAuthenticated();
  return null;
}

async function VerifyOtp({ searchParams }: { searchParams: SearchParams }) {
  const { email, type } = await readParams(searchParams);
  if (!email) redirect(type === 'reset' ? '/auth/forgot-password' : '/auth/login');

  const isReset = type === 'reset';

  return (
    <OtpForm
      title={isReset ? 'Enter Reset Code' : 'Verify Email OTP'}
      description={
        <>
          We sent a 6-digit code to <strong>{email}</strong>.{' '}
          <Link href={isReset ? '/auth/forgot-password' : '/auth/signup'} className="jp-link">
            Wrong email?
          </Link>
        </>
      }
      submitLabel={isReset ? 'Verify & Continue' : 'Verify Email'}
      fields={{ email }}
      action={isReset ? verifyResetCodeAction : verifyEmailAction}
      resend={resendEmailCodeAction.bind(null, email, type)}
      footer={
        <p className="jp-auth-legal" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link href="/auth/login" className="jp-link">
            Back to Sign In
          </Link>
        </p>
      }
    />
  );
}
