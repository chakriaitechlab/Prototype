import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password/ForgotPasswordForm';
import { AuthRedirect } from '@/components/auth/AuthRedirect';

export const metadata: Metadata = {
  title: 'Forgot Password | Chakri.ai',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function ForgotPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <Suspense fallback={<ForgotPasswordForm />}>
        <ForgotPassword searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ForgotPassword({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;
  return <ForgotPasswordForm defaultEmail={typeof email === 'string' ? email : ''} />;
}
