import { Bot } from 'lucide-react';
import type { AgentSessionStatus, AgentStep, AgentStepKind } from '@/types/agent';

const KIND_LABELS: Partial<Record<AgentStepKind, string>> = {
  SEARCH: 'Searching the web',
  CLICK: 'Clicking',
  TYPE: 'Typing',
  SCROLL: 'Scrolling',
  BACK: 'Going back',
  GMAIL: 'Checking Gmail',
};

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function activityLabel(steps: AgentStep[]) {
  const lastUser = steps.findLastIndex(({ kind }) => kind === 'USER');
  const current = steps.slice(lastUser + 1).findLast(({ kind }) => kind in KIND_LABELS || kind === 'NAVIGATE' || kind === 'FETCH');
  if (!current) return 'is working';

  const host = hostOf(current.url);
  if (current.kind === 'NAVIGATE') return host ? `Visiting ${host}` : 'Opening a website';
  if (current.kind === 'FETCH') return host ? `Reading ${host}` : 'Reading a page';
  return KIND_LABELS[current.kind] ?? 'is working';
}

interface AgentPresenceProps {
  status: AgentSessionStatus | null;
  steps: AgentStep[];
  writing: boolean;
}

export function AgentPresence({ status, steps, writing }: AgentPresenceProps) {
  const running = status === 'RUNNING';
  const waiting = status === 'WAITING_INPUT';
  const note = running
    ? writing
      ? 'Writing…'
      : activityLabel(steps)
    : waiting
      ? 'Waiting for you'
      : status === 'STOPPED'
        ? 'Stopped'
        : status === 'FAILED'
          ? 'Something went wrong'
          : null;

  return (
    <div className="flex flex-col items-center" aria-live="polite">
      <div className="relative h-14 w-14">
        {(running || waiting) && (
          <span
            className={`absolute -inset-1 rounded-full border-2 border-t-transparent ${waiting ? 'border-[#f5a623]' : 'animate-spin border-[#0a65cc]'}`}
            aria-hidden="true"
          />
        )}
        <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#0a65cc] to-[#4d9bf0] text-white shadow-md">
          <Bot size={26} />
        </span>
      </div>
      <div className="-mt-1.5 flex flex-col items-center rounded-2xl border border-[#e4e5e8] bg-white px-3.5 py-1 shadow-sm">
        <span className="text-[13px] font-semibold text-[#18191c]">Chakri AI</span>
        {note && <span className={`max-w-[220px] truncate text-[11px] ${waiting ? 'text-[#b26b00]' : 'text-[#5e6670]'}`}>{note}</span>}
      </div>
    </div>
  );
}
