import { Suspense } from 'react';
import { learnApi } from '@/lib/learn';
import { requireDashboard } from '@/utils/session';
import { LearnShell } from '@/components/dashboard/seeker/learn/LearnShell';
import { LearnSkeleton } from '@/components/dashboard/seeker/learn/LearnSkeleton';

export default function SeekerLearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LearnSkeleton />}>
      <LearnContent>{children}</LearnContent>
    </Suspense>
  );
}

async function LearnContent({ children }: { children: React.ReactNode }) {
  await requireDashboard('SEEKER');
  const chats = await learnApi.list().catch(() => null);

  return <LearnShell initialChats={chats}>{children}</LearnShell>;
}
