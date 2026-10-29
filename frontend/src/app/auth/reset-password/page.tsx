import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password/ResetPasswordForm';
import { readResetTicket } from '@/utils/session';

export const metadata: Metadata = {
  title: 'Set New Password | Chakri.ai',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}

async function ResetPassword() {
  const ticket = await readResetTicket();
  if (!ticket) redirect('/auth/forgot-password');

  return <ResetPasswordForm email={ticket.email} />;
}
