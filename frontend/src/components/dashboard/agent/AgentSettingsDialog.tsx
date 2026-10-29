'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LayoutGrid, Loader2, X } from 'lucide-react';
import { disconnectGmailAction, getGmailAuthUrlAction } from '@/actions/agent.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { AgentConnector } from '@/types/agent';

interface AgentSettingsDialogProps {
  connectors: AgentConnector[];
  onConnectorsChange: (connectors: AgentConnector[]) => void;
  onClose: () => void;
}

export function AgentSettingsDialog({ connectors, onConnectorsChange, onClose }: AgentSettingsDialogProps) {
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{ message: string } | null>(null);
  const gmail = connectors.find(({ provider }) => provider === 'GMAIL');

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose]);

  const connect = async () => {
    setPending(true);
    const { data, error } = await getGmailAuthUrlAction();
    if (data) {
      window.location.assign(data.url);
      return;
    }
    setAlert({ message: error });
    setPending(false);
  };

  const disconnect = async () => {
    setPending(true);
    const { data, error } = await disconnectGmailAction();
    if (data) onConnectorsChange(connectors.filter(({ provider }) => provider !== 'GMAIL'));
    else setAlert({ message: error });
    setPending(false);
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="agent-settings-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <FormAlert message={alert?.message} trigger={alert} />
      <div className="fixed inset-0 animate-in bg-slate-950/50 backdrop-blur-sm duration-200 fade-in" onClick={onClose} />
      <div className="relative z-10 flex h-[min(520px,calc(100dvh-2rem))] w-full max-w-3xl animate-in flex-col overflow-hidden border border-[#e4e5e8] bg-white shadow-2xl duration-150 fade-in zoom-in-95 sm:flex-row">
        <nav className="flex shrink-0 flex-col border-b border-[#e4e5e8] bg-[#f7f8f9] p-4 sm:w-56 sm:border-r sm:border-b-0 sm:p-5" aria-label="Settings sections">
          <h3 id="agent-settings-title" className="mb-3 text-lg font-semibold text-[#18191c] sm:mb-5">
            Settings
          </h3>
          <button
            type="button"
            aria-current="page"
            className="cursor-pointer disabled:cursor-not-allowed flex h-10 items-center gap-2.5 border border-[#e4e5e8] bg-white px-3 text-[14px] font-medium text-[#0a65cc]"
          >
            <LayoutGrid size={16} />
            Connectors
          </button>
        </nav>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 sm:px-6">
            <h4 className="text-lg font-semibold text-[#18191c]">Connectors</h4>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close settings"
              className="cursor-pointer disabled:cursor-not-allowed flex h-8 w-8 items-center justify-center text-[#5e6670] hover:bg-[#f1f2f4]"
            >
              <X size={17} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
            <p className="mb-4 text-[13px] leading-5 text-[#767f8c]">Connect your accounts so the agent can work with them for you.</p>
            <div className="flex items-center gap-3 border border-[#e4e5e8] p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#f1f2f4] bg-white">
                <GmailLogo />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#18191c]">Gmail</p>
                <p className="truncate text-[12px] text-[#5e6670]">
                  {gmail ? `Connected as ${gmail.email}` : 'Let the agent read, draft and send your email'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void (gmail ? disconnect() : connect())}
                disabled={pending}
                className={`cursor-pointer disabled:cursor-not-allowed inline-flex h-9 shrink-0 items-center gap-1.5 px-4 text-[13px] font-medium transition-colors disabled:opacity-70 ${gmail ? 'border border-[#e4e5e8] text-[#18191c] hover:bg-[#f7f8f9]' : 'bg-[#0a65cc] text-white hover:bg-[#094e9f]'}`}
              >
                {pending && <Loader2 size={14} className="animate-spin" />}
                {gmail ? 'Disconnect' : 'Connect'}
              </button>
            </div>
            <p className="mt-3 text-[12px] leading-5 text-[#767f8c]">
              The agent always asks you before it sends an email or moves one to Trash.
            </p>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  );
}

export function GmailLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4caf50" d="M45 16.2l-5 2.75-5 4.75V40h7c1.66 0 3-1.34 3-3V16.2z" />
      <path fill="#1e88e5" d="M3 16.2l3.61 1.71L13 23.7V40H6c-1.66 0-3-1.34-3-3V16.2z" />
      <path fill="#e53935" d="M35 11.2 24 19.45 13 11.2 12 17l1 6.7 11 8.25 11-8.25 1-6.7z" />
      <path fill="#c62828" d="M3 12.3v3.9l10 7.5V11.2L9.88 8.86C9.13 8.3 8.21 8 7.27 8 4.91 8 3 9.91 3 12.27z" />
      <path fill="#fbc02d" d="M45 12.3v3.9l-10 7.5V11.2l3.12-2.34C38.87 8.3 39.79 8 40.73 8 43.09 8 45 9.91 45 12.27z" />
    </svg>
  );
}
