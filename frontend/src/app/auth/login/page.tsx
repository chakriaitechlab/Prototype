import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login/LoginForm';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { authApi } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Sign In | Chakri.ai',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const NOTICES = {
  verified: 'Email verified successfully! Please sign in with your credentials.',
  reset: 'Password updated successfully! Please sign in with your new password.',
  deleted: 'Your account has been deleted.',
  message: 'Please sign in to send a message.',
};

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <Suspense fallback={<LoginForm />}>
        <Login searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Login({ searchParams }: { searchParams: SearchParams }) {
  const [params, { signupEnabled }] = await Promise.all([searchParams, authApi.signupStatus()]);

  const notice =
    params.reset === 'success'
      ? NOTICES.reset
      : params.verified === 'true'
        ? NOTICES.verified
        : params.deleted === 'true'
          ? NOTICES.deleted
          : params.continue === 'message'
            ? NOTICES.message
            : undefined;
  const oauthError = typeof params.oauth_error === 'string' ? params.oauth_error : undefined;

  return <LoginForm notice={notice} oauthError={oauthError} signupEnabled={signupEnabled} />;
}
