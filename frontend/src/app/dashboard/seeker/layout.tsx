import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { profileApi } from '@/lib/profile';
import { requireDashboard } from '@/utils/session';
import { SIDEBAR_COLLAPSED_COOKIE } from '@/utils/cookies';
import { AppBootScreen } from '@/components/ui/AppBootScreen';
import { SeekerNavbar } from '@/components/dashboard/seeker/SeekerNavbar';
import { SeekerDrawerProvider, SeekerSidebar } from '@/components/dashboard/seeker/SeekerSidebar';

export const metadata: Metadata = {
  title: 'Seeker Dashboard | Chakri.ai',
  robots: { index: false, follow: false },
};

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppBootScreen />}>
      <SeekerShell>{children}</SeekerShell>
    </Suspense>
  );
}

async function SeekerShell({ children }: { children: React.ReactNode }) {
  const user = await requireDashboard('SEEKER');
  const [cookieStore, completion] = await Promise.all([cookies(), profileApi.completion().catch(() => null)]);
  const collapsed = cookieStore.get(SIDEBAR_COLLAPSED_COOKIE)?.value === '1';

  return (
    <SeekerDrawerProvider defaultCollapsed={collapsed}>
      <div className="jp cdash cdash--app dashboard-shell dash-shell seeker-shell">
        <SeekerNavbar user={user} profilePercent={completion?.percent ?? 0} />
        <div className="cdash-body">
          <SeekerSidebar />
          <main className="cdash-main no-scrollbar">{children}</main>
        </div>
      </div>
    </SeekerDrawerProvider>
  );
}
