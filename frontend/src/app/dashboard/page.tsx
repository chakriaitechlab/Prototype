import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireUser } from '@/utils/session';
import { pathForUser } from '@/utils/routes';
import { AppBootScreen } from '@/components/ui/AppBootScreen';

export default function DashboardPage() {
  return (
    <Suspense fallback={<AppBootScreen />}>
      <DashboardRedirect />
    </Suspense>
  );
}

async function DashboardRedirect(): Promise<never> {
  const user = await requireUser();
  redirect(pathForUser(user));
}
