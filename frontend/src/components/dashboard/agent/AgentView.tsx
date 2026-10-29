'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, Monitor } from 'lucide-react';
import { deleteAgentSessionAction } from '@/actions/agent.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import { useAgentSession } from '@/hooks/useAgentSession';
import { dashboardPath } from '@/utils/routes';
import type { AgentConnector, AgentSession, AgentSessionDetail } from '@/types/agent';
import { ActivityFeed } from './ActivityFeed';
import { AgentEmptyState } from './AgentEmptyState';
import { AgentHistory } from './AgentHistory';
import { AgentPresence } from './AgentPresence';
import { AgentSettingsDialog } from './AgentSettingsDialog';
import { ChatComposer } from './ChatComposer';
import { LiveBrowserPanel } from './LiveBrowserPanel';

const MOBILE_QUERY = '(max-width: 1023px)';
const CONNECTOR_QUERY = 'gmail';

const GMAIL_NOTICES: Record<string, { message: string; type: 'success' | 'error' }> = {
  connected: { message: 'Gmail connected. The agent can now work with your email.', type: 'success' },
  denied: { message: 'Gmail was not connected because access was not allowed.', type: 'error' },
  failed: { message: 'Could not connect Gmail. Please try again.', type: 'error' },
};

let chatsPanelOpen = false;

interface AgentViewProps {
  role: 'SEEKER' | 'RECRUITER';
  initialSessions: AgentSession[];
  initialSession: AgentSessionDetail | null;
  initialConnectors: AgentConnector[];
  connectorStatus: string | null;
}

export function AgentView({ role, initialSessions, initialSession, initialConnectors, connectorStatus }: AgentViewProps) {
  const basePath = `${dashboardPath(role)}/agent`;
  const connectorNotice = connectorStatus ? (GMAIL_NOTICES[connectorStatus] ?? null) : null;
  const [browserOpen, setBrowserOpen] = useState(false);
  const { session, draft, error, send, stop, reset, subscribeFrames } = useAgentSession(initialSession, browserOpen);
  const [sessions, setSessions] = useState(initialSessions);
  const [historyOpen, setHistoryOpenState] = useState(() => chatsPanelOpen);
  const [alert, setAlert] = useState<{ message: string; type?: 'success' | 'error' } | null>(connectorNotice);
  const [connectors, setConnectors] = useState(initialConnectors);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const status = session?.status ?? null;
  const working = status === 'RUNNING' || status === 'WAITING_INPUT';
  const stepCount = session?.steps.length ?? 0;
  const browsing = working && Boolean(session?.steps.some(({ kind }) => kind === 'NAVIGATE'));

  const history = !session
    ? sessions
    : sessions.some(({ id }) => id === session.id)
      ? sessions.map((item) => (item.id === session.id ? session : item))
      : [session, ...sessions];

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [stepCount, status, draft]);

  useEffect(() => {
    if (!connectorStatus) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(CONNECTOR_QUERY);
    window.history.replaceState(window.history.state, '', url);
  }, [connectorStatus]);

  const setHistoryOpen = (open: boolean) => {
    chatsPanelOpen = open;
    setHistoryOpenState(open);
  };

  const closeOnMobile = () => {
    if (window.matchMedia(MOBILE_QUERY).matches) setHistoryOpen(false);
  };

  const startNew = () => {
    setBrowserOpen(false);
    closeOnMobile();
    reset();
  };

  const deleteSession = async (id: string) => {
    const { data, error: deleteError } = await deleteAgentSessionAction(id);
    if (!data) {
      setAlert({ message: deleteError });
      return false;
    }
    setSessions((current) => current.filter((item) => item.id !== id));
    if (session?.id === id) startNew();
    return true;
  };

  return (
    <div className="agent-page flex min-h-0 flex-1 bg-[#f7f8f9]">
      <FormAlert message={error?.message} trigger={error} />
      <FormAlert message={alert?.message} type={alert?.type} trigger={alert} />

      {historyOpen && (
        <AgentHistory
          basePath={basePath}
          sessions={history}
          activeId={session?.id ?? null}
          canStartNew={!working}
          onClose={() => setHistoryOpen(false)}
          onNavigate={closeOnMobile}
          onNewTask={startNew}
          onDelete={deleteSession}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {settingsOpen && <AgentSettingsDialog connectors={connectors} onConnectorsChange={setConnectors} onClose={() => setSettingsOpen(false)} />}

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start gap-2 p-3 sm:p-4">
          {!historyOpen && (
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label="Open chats"
              className="cursor-pointer disabled:cursor-not-allowed pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-[#e4e5e8] bg-white px-4 text-[14px] font-medium text-[#18191c] shadow-sm transition-colors hover:bg-[#f7f8f9]"
            >
              <Menu size={17} />
              <span className="hidden sm:inline">Chats</span>
            </button>
          )}
          <div className="absolute left-1/2 top-3 -translate-x-1/2 sm:top-4">
            <AgentPresence status={status} steps={session?.steps ?? []} writing={Boolean(draft)} />
          </div>
          <button
            type="button"
            onClick={() => setBrowserOpen(!browserOpen)}
            aria-pressed={browserOpen}
            aria-label="Live browser"
            className={`cursor-pointer disabled:cursor-not-allowed pointer-events-auto relative ml-auto inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[14px] font-medium shadow-sm transition-colors ${browserOpen ? 'border-[#0a65cc] bg-[#e7f0fa] text-[#0a65cc]' : 'border-[#e4e5e8] bg-white text-[#18191c] hover:bg-[#f7f8f9]'}`}
          >
            <Monitor size={16} />
            <span className="hidden sm:inline">Live browser</span>
            {browsing && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-[#e05151]" />}
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pt-32 pb-6 sm:px-6">
          {session ? (
            <div className="mx-auto max-w-3xl">
              <ActivityFeed
                steps={session.steps}
                status={session.status}
                draft={draft}
                subscribeFrames={subscribeFrames}
                onOpenBrowser={() => setBrowserOpen(true)}
                onAnswer={send}
                gmailConnected={connectors.some(({ provider }) => provider === 'GMAIL')}
              />
            </div>
          ) : (
            <AgentEmptyState role={role} />
          )}
        </div>

        <ChatComposer status={status} onSend={send} onStop={stop} />
      </section>

      {browserOpen && <LiveBrowserPanel subscribeFrames={subscribeFrames} live={working} onClose={() => setBrowserOpen(false)} />}
    </div>
  );
}
