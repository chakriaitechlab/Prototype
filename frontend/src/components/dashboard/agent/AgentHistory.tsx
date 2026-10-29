'use client';

import { useState } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { Loader2, MessageSquare, PanelLeftClose, Search, Settings, SquarePen, Trash2 } from 'lucide-react';
import type { AgentSession } from '@/types/agent';

const DATE_FORMAT = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

interface AgentHistoryProps {
  basePath: string;
  sessions: AgentSession[];
  activeId: string | null;
  canStartNew: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onNewTask: () => void;
  onDelete: (id: string) => Promise<boolean>;
  onOpenSettings: () => void;
}

/** Spins while the clicked chat loads, so a slow server round trip never looks like a dead click. */
function SessionIcon({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  if (pending) return <Loader2 size={14} className="mt-[3px] shrink-0 animate-spin text-[#0a65cc]" />;
  return <MessageSquare size={14} className={`mt-[3px] shrink-0 ${active ? 'text-[#0a65cc]' : 'text-[#9199a3]'}`} />;
}

export function AgentHistory({ basePath, sessions, activeId, canStartNew, onClose, onNavigate, onNewTask, onDelete, onOpenSettings }: AgentHistoryProps) {
  const [query, setQuery] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const needle = query.trim().toLowerCase();
  const visible = needle ? sessions.filter(({ title }) => title.toLowerCase().includes(needle)) : sessions;

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmingId(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-72 animate-in flex-col border-r border-[#e4e5e8] bg-white duration-200 slide-in-from-left lg:static lg:z-auto"
        aria-label="Agent chats"
      >
        <div className="flex items-center gap-2 p-3">
          <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border border-[#e4e5e8] bg-[#f7f8f9] px-3.5 focus-within:border-[#0a65cc]">
            <Search size={15} className="shrink-0 text-[#9199a3]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search chats"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#18191c] outline-none placeholder:text-[#9199a3]"
            />
          </label>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chats"
            title="Close"
            className="cursor-pointer disabled:cursor-not-allowed flex h-10 w-10 shrink-0 items-center justify-center text-[#5e6670] hover:bg-[#f1f2f4]"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={onNewTask}
            disabled={!canStartNew}
            title={canStartNew ? 'Start a new chat' : 'Stop the current task first'}
            className="cursor-pointer disabled:cursor-not-allowed flex h-10 w-full items-center gap-2.5 px-3 text-[14px] font-medium text-[#18191c] transition-colors hover:bg-[#f1f2f4] disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <SquarePen size={16} className="text-[#0a65cc]" />
            New chat
          </button>
        </div>

        <p className="px-6 pt-4 pb-1.5 text-[12px] font-medium text-[#9199a3]">Chats</p>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {visible.length === 0 ? (
            <p className="px-3 py-6 text-center text-[13px] text-[#9199a3]">
              {needle ? 'No chats match your search.' : 'Your chats with the agent will appear here.'}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {visible.map(({ id, title, status, updatedAt }) => {
                const active = id === activeId;
                const working = status === 'RUNNING' || status === 'WAITING_INPUT';

                if (confirmingId === id) {
                  return (
                    <li key={id} className="border border-[#f3c5c5] bg-[#fdf6f6] p-2.5">
                      <p className="mb-2 truncate text-[13px] text-[#18191c]">Delete &ldquo;{title}&rdquo;?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => void confirmDelete(id)}
                          disabled={deletingId === id}
                          className="cursor-pointer disabled:cursor-not-allowed inline-flex h-7 items-center gap-1 bg-[#e05151] px-2.5 text-xs font-medium text-white hover:bg-[#c94141] disabled:opacity-70"
                        >
                          {deletingId === id && <Loader2 size={12} className="animate-spin" />}
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="cursor-pointer disabled:cursor-not-allowed h-7 px-2.5 text-xs font-medium text-[#5e6670] hover:bg-[#f1f2f4]"
                        >
                          Cancel
                        </button>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={id} className={`group flex items-center border-l-[3px] ${active ? 'border-[#0a65cc] bg-[#e7f0fa]' : 'border-transparent hover:bg-[#f7f8f9]'}`}>
                    <Link
                      href={`${basePath}?session=${encodeURIComponent(id)}`}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      title={title}
                      className="flex min-w-0 flex-1 items-start gap-2.5 px-3 py-2"
                    >
                      <SessionIcon active={active} />
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[13px] ${active ? 'font-medium text-[#0a65cc]' : 'text-[#18191c]'}`}>{title}</span>
                        <span className="block text-[11px] text-[#9199a3]" suppressHydrationWarning>
                          {working ? 'Working…' : DATE_FORMAT.format(new Date(updatedAt))}
                        </span>
                      </span>
                    </Link>
                    {!working && (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(id)}
                        aria-label={`Delete ${title}`}
                        className="cursor-pointer disabled:cursor-not-allowed mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center text-[#9199a3] hover:bg-white hover:text-[#e05151] lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[#e4e5e8] p-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="cursor-pointer disabled:cursor-not-allowed flex h-10 w-full items-center gap-2.5 px-3 text-[14px] font-medium text-[#18191c] transition-colors hover:bg-[#f1f2f4]"
          >
            <Settings size={16} className="text-[#5e6670]" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
