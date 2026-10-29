import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoleForm } from '@/components/onboarding/role/RoleForm';
import { requireRoleSelection } from '@/utils/session';

export const metadata: Metadata = {
  title: 'Choose Account Type | Chakri.ai',
};

export default function OnboardingRolePage() {
  return (
    <>
      <Link href="/" className="jp-auth-back">
        <ArrowLeft size={16} aria-hidden />
        Back to home
      </Link>

      <header className="jp-auth-heading">
        <h1>Choose your account type</h1>
        <p className="jp-auth-subtitle">
          Tell us how you want to use Chakri to continue setting up your profile.
        </p>
      </header>

      <Suspense fallback={null}>
        <RoleGuard />
      </Suspense>
      <RoleForm />
    </>
  );
}

async function RoleGuard() {
  await requireRoleSelection();
  return null;
}
