'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, X } from 'lucide-react';
import { decideApplicantAction } from '@/actions/hire.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';
import type { ApplicantDecision } from '@/types/hire';
import { ApplicantDecisionDialog } from './ApplicantDecisionDialog';

type Alert = ActionState & { trigger: number };

interface ApplicantActionsProps {
  jobId: string;
  jobTitle: string;
  applicationId: string;
  name: string;
  username: string | null;
  avatarUrl?: string | null;
}

export function ApplicantActions({ jobId, jobTitle, applicationId, name, username, avatarUrl }: ApplicantActionsProps) {
  const router = useRouter();
  const [decision, setDecision] = useState<ApplicantDecision | null>(null);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirm = (note: string) => {
    if (!decision) return;
    startTransition(async () => {
      const result = await decideApplicantAction(jobId, applicationId, decision, note);
      setAlert({ ...result, trigger: Date.now() });
      if (result.error) return;
      setDecision(null);
      router.refresh();
    });
  };

  return (
    <>
      <FormAlert message={alert?.error ?? alert?.message} type={alert?.error ? 'error' : 'success'} trigger={alert?.trigger} />

      <button
        type="button"
        onClick={() => setDecision('invite')}
        className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-[#0a65cc] bg-[#0a65cc] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#084f9e]"
      >
        <Send size={17} aria-hidden />
        Invite
      </button>
      <button
        type="button"
        onClick={() => setDecision('reject')}
        className="inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-[#f3c4c4] bg-white px-4 text-[14px] font-semibold text-[#e05151] transition-colors hover:border-[#e05151] hover:bg-[#fdf2f2]"
      >
        <X size={17} aria-hidden />
        Reject
      </button>

      {decision && (
        <ApplicantDecisionDialog
          decision={decision}
          jobTitle={jobTitle}
          name={name}
          username={username}
          avatarUrl={avatarUrl}
          pending={isPending}
          onClose={() => setDecision(null)}
          onConfirm={confirm}
        />
      )}
    </>
  );
}
