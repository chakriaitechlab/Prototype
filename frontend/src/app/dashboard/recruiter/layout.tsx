import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { requireDashboard } from '@/utils/session';
import { SIDEBAR_COLLAPSED_COOKIE } from '@/utils/cookies';
import { AppBootScreen } from '@/components/ui/AppBootScreen';
import { RecruiterNavbar } from '@/components/dashboard/recruiter/RecruiterNavbar';
import { RecruiterDrawerProvider, RecruiterSidebar } from '@/components/dashboard/recruiter/RecruiterSidebar';

export const metadata: Metadata = {
  title: 'Recruiter Dashboard | Chakri.ai',
  robots: { index: false, follow: false },
};

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppBootScreen />}>
      <RecruiterShell>{children}</RecruiterShell>
    </Suspense>
  );
}

async function RecruiterShell({ children }: { children: React.ReactNode }) {
  const user = await requireDashboard('RECRUITER');
  const collapsed = (await cookies()).get(SIDEBAR_COLLAPSED_COOKIE)?.value === '1';

  return (
    <RecruiterDrawerProvider defaultCollapsed={collapsed}>
      <div className="jp cdash cdash--app dashboard-shell dash-shell recruiter-shell">
        <RecruiterNavbar user={user} />
        <div className="cdash-body">
          <RecruiterSidebar />
          <main className="cdash-main no-scrollbar">{children}</main>
        </div>
      </div>
    </RecruiterDrawerProvider>
  );
}
