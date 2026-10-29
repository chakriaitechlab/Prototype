import { Suspense } from 'react';
import type { Metadata } from 'next';
import { agentApi } from '@/lib/agent';
import { requireDashboard } from '@/utils/session';
import { AppLoader } from '@/components/ui/AppLoader';
import { AgentView } from '@/components/dashboard/agent/AgentView';

export const metadata: Metadata = {
  title: 'Chakri AI Agent | Seeker Dashboard | Chakri.ai',
  description: 'Chat with Chakri AI or give it a task. It searches the web and works in its own browser for you.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function SeekerAgentPage({ searchParams }: { searchParams: SearchParams }) {
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
    requireDashboard('SEEKER'),
    agentApi.list().catch(() => []),
    typeof session === 'string' ? agentApi.get(session).catch(() => null) : null,
    agentApi.connectors().catch(() => []),
  ]);

  return (
    <AgentView
      key={initialSession?.id ?? 'new'}
      role="SEEKER"
      initialSessions={initialSessions}
      initialSession={initialSession}
      initialConnectors={initialConnectors}
      connectorStatus={typeof gmail === 'string' ? gmail : null}
    />
  );
}
