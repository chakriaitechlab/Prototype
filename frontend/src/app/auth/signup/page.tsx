import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignupForm } from '@/components/auth/signup/SignupForm';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { authApi } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Create Account | Chakri.ai',
};

export default async function SignupPage() {
  const { signupEnabled } = await authApi.signupStatus();
  if (!signupEnabled) redirect('/waitlist');

  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect />
      </Suspense>
      <SignupForm />
    </>
  );
}
