'use client';

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';
import { resetInterviewAction } from '@/actions/interviews.actions';
import { FormAlert } from '@/components/ui/FormAlert';

export function ResetInterviewButton({ interviewId, className = '' }: { interviewId: string; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState<{ error?: string; trigger: number }>({ trigger: 0 });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, pending]);

  const reset = () =>
    startTransition(async () => {
      const result = await resetInterviewAction(interviewId);
      if ('error' in result) {
        setAlert({ error: result.error, trigger: Date.now() });
        return;
      }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <FormAlert message={alert.error} trigger={alert.trigger} />
      <button type="button" onClick={() => setOpen(true)} className={`jp-btn jp-btn--outline h-11! px-4! text-sm! ${className}`}>
        <RotateCcw size={16} aria-hidden />
        Reset interview
      </button>

      {open &&
        createPortal(
          <div role="alertdialog" aria-modal="true" aria-labelledby="reset-interview-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={pending ? undefined : () => setOpen(false)} />
            <div className="relative z-10 w-full max-w-md border border-slate-300 bg-white p-6 text-left shadow-2xl">
              <h3 id="reset-interview-title" className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="inline-flex h-8 w-8 items-center justify-center bg-red-50 text-red-600">
                  <RotateCcw size={16} aria-hidden />
                </span>
                Reset this interview?
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Every answer and the report are deleted, and the interview starts again from the beginning. The new invite is valid for 7 days.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="cursor-pointer border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={pending}
                  className="inline-flex cursor-pointer items-center gap-2 border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
                  {pending ? 'Resetting…' : 'Reset interview'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
