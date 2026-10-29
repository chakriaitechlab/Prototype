'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, LogOut } from 'lucide-react';

const COPY = {
  lobby: {
    title: 'Leave the lobby?',
    body: "Your interview hasn't started yet. You can come back and take it any time before the invite expires.",
    confirm: 'Leave lobby',
    pending: 'Leaving…',
  },
  room: {
    title: 'Leave the interview?',
    body: "Your interview ends now and the answers you've given so far are submitted for the report. You can't retake it.",
    confirm: 'End and leave',
    pending: 'Ending…',
  },
} as const;

interface LeaveInterviewDialogProps {
  stage: keyof typeof COPY;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LeaveInterviewDialog({ stage, pending, onCancel, onConfirm }: LeaveInterviewDialogProps) {
  const copy = COPY[stage];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onCancel();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [pending, onCancel]);

  return createPortal(
    <div role="alertdialog" aria-modal="true" aria-labelledby="leave-interview-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={pending ? undefined : onCancel} />
      <div className="relative z-10 w-full max-w-md border border-slate-300 bg-white p-6 text-left shadow-2xl">
        <h3 id="leave-interview-title" className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center bg-red-50 text-red-600">
            <LogOut size={16} aria-hidden />
          </span>
          {copy.title}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">{copy.body}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="cursor-pointer border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {stage === 'room' ? 'Continue interview' : 'Stay'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex cursor-pointer items-center gap-2 border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {pending ? copy.pending : copy.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
