'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarClock, Loader2, MessageSquare, Send, X } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ApplicantDecision } from '@/types/hire';
import { formatDate } from '@/utils/format';

const INTERVIEW_TTL_DAYS = 7;
const DAY_MS = 86_400_000;
const NOTE_MAX_LENGTH = 500;

const COPY: Record<ApplicantDecision, { title: string; label: string; placeholder: string; confirm: string; pending: string }> = {
  invite: {
    title: 'Send AI interview invite',
    label: 'Note to candidate (optional)',
    placeholder: 'Looking forward to your interview.',
    confirm: 'Send invite',
    pending: 'Sending…',
  },
  reject: {
    title: 'Reject application',
    label: 'Message to candidate (optional)',
    placeholder: "Thank you for applying. We've decided to move forward with other candidates.",
    confirm: 'Reject',
    pending: 'Rejecting…',
  },
};

interface ApplicantDecisionDialogProps {
  decision: ApplicantDecision;
  jobTitle: string;
  name: string;
  username: string | null;
  avatarUrl?: string | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

export function ApplicantDecisionDialog({
  decision,
  jobTitle,
  name,
  username,
  avatarUrl,
  pending,
  onClose,
  onConfirm,
}: ApplicantDecisionDialogProps) {
  const [note, setNote] = useState('');
  const [expiresOn] = useState(() => formatDate(new Date(Date.now() + INTERVIEW_TTL_DAYS * DAY_MS).toISOString()));
  const copy = COPY[decision];
  const invite = decision === 'invite';

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [pending, onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="applicant-decision-title"
      className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-y-auto p-4 sm:p-6"
    >
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={pending ? undefined : onClose} />

      <div className="relative z-10 w-full max-w-md border border-slate-300 bg-white text-left shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#e4e5e8] px-5 py-4">
          <div className="min-w-0">
            <h3 id="applicant-decision-title" className="m-0 text-lg font-bold text-[#18191c]">
              {copy.title}
            </h3>
            <p className="m-0 mt-0.5 truncate text-[13px] text-[#767f8c]">{jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-[#e4e5e8] bg-white text-[#767f8c] transition hover:text-[#18191c] disabled:cursor-not-allowed"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="mb-4 flex items-center gap-3 border border-[#e4e5e8] bg-[#f8fafc] p-3">
            <UserAvatar
              src={avatarUrl ?? null}
              name={name}
              className="h-10 w-10 rounded-full text-[13px] font-semibold"
              fallbackClassName="bg-[#e7f0fa] text-[#0a65cc]"
            />
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-semibold text-[#18191c]">{name}</p>
              {username && <p className="m-0 truncate text-xs text-[#9ca3af]">@{username}</p>}
            </div>
          </div>

          <p className="mb-2.5 flex gap-2.5 text-[13px] leading-relaxed text-[#5e6670]">
            <MessageSquare size={16} className={`mt-0.5 shrink-0 ${invite ? 'text-[#0a65cc]' : 'text-[#e05151]'}`} aria-hidden />
            {invite
              ? 'An AI interview link is sent to their messages.'
              : "A rejection message is sent to their messages. This can't be undone."}
          </p>
          {invite && (
            <p className="mb-2.5 flex gap-2.5 text-[13px] leading-relaxed text-[#5e6670]">
              <CalendarClock size={16} className="mt-0.5 shrink-0 text-[#0a65cc]" aria-hidden />
              <span>
                They can take it any time. The link expires on <strong className="text-[#18191c]">{expiresOn}</strong> ({INTERVIEW_TTL_DAYS} days).
              </span>
            </p>
          )}

          <label htmlFor="applicant-decision-note" className="mb-1.5 mt-4 block text-[12.5px] font-semibold text-[#18191c]">
            {copy.label}
          </label>
          <textarea
            id="applicant-decision-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            placeholder={copy.placeholder}
            rows={3}
            className="w-full resize-y border border-[#e4e5e8] px-3 py-2.5 text-[13.5px] text-[#18191c] outline-none transition-colors placeholder:text-[#9199a3] focus:border-[#0a65cc]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#e4e5e8] bg-[#fafbfc] px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="cursor-pointer border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={pending}
            className={`inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-60 sm:text-sm ${
              invite ? 'border border-[#0a65cc] bg-[#0a65cc] hover:bg-[#084f9e]' : 'border border-red-600 bg-red-600 hover:bg-red-700'
            }`}
          >
            {pending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : invite ? <Send size={14} aria-hidden /> : <X size={14} aria-hidden />}
            {pending ? copy.pending : copy.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
