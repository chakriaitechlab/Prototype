import { Suspense } from 'react';
import type { Metadata } from 'next';
import { agentApi } from '@/lib/agent';
import { requireDashboard } from '@/utils/session';
import { AppLoader } from '@/components/ui/AppLoader';
import { AgentView } from '@/components/dashboard/agent/AgentView';

export const metadata: Metadata = {
  title: 'Chakri Agent | Recruiter Dashboard | Chakri.ai',
  description: 'Ask Chakri AI about your job posts and candidates, or give it a task on the web.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function RecruiterAgentPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div className="agent-page flex flex-1 items-center justify-center bg-[#f7f8f9]">
          <AppLoader />
        </div>
      }
    >
      <AgentContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AgentContent({ searchParams }: { searchParams: SearchParams }) {
  const { session, gmail } = await searchParams;
  // The backend checks auth on every call, so the role check runs alongside the data instead of before it.
  const [, initialSessions, initialSession, initialConnectors] = await Promise.all([
    requireDashboard('RECRUITER'),
    agentApi.list().catch(() => []),
    typeof session === 'string' ? agentApi.get(session).catch(() => null) : null,
    agentApi.connectors().catch(() => []),
  ]);

  return (
    <AgentView
      key={initialSession?.id ?? 'new'}
      role="RECRUITER"
      initialSessions={initialSessions}
      initialSession={initialSession}
      initialConnectors={initialConnectors}
      connectorStatus={typeof gmail === 'string' ? gmail : null}
    />
  );
}
