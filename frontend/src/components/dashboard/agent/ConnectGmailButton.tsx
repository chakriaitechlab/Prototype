'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getGmailAuthUrlAction } from '@/actions/agent.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import { GmailLogo } from './AgentSettingsDialog';

export function ConnectGmailButton() {
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState<{ message: string } | null>(null);

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

  return (
    <>
      <FormAlert message={alert?.message} trigger={alert} />
      <button
        type="button"
        onClick={() => void connect()}
        disabled={pending}
        className="cursor-pointer disabled:cursor-not-allowed flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#e4e5e8] bg-white text-[14px] font-semibold text-[#18191c] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors hover:border-[#0a65cc] hover:bg-[#f7fafe] disabled:opacity-70"
      >
        {pending ? <Loader2 size={18} className="animate-spin" /> : <GmailLogo />}
        Connect Gmail
      </button>
    </>
  );
}
