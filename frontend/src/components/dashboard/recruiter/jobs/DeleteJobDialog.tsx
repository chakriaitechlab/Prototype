'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteJobDialogProps {
  open: boolean;
  jobTitle: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteJobDialog({ open, jobTitle, deleting, onClose, onConfirm }: DeleteJobDialogProps) {
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, deleting, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-job-title"
      className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-y-auto p-4 sm:p-6"
    >
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={deleting ? undefined : onClose} />

      <div className="relative z-10 w-full max-w-sm border border-slate-300 bg-white p-6 text-left shadow-2xl sm:max-w-md">
        <h3 id="delete-job-title" className="mb-2 flex items-center gap-2 text-base font-bold text-slate-900">
          <span className="inline-flex h-8 w-8 items-center justify-center bg-red-50 text-red-600">
            <Trash2 size={16} aria-hidden />
          </span>
          Delete this post?
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          <span className="font-medium text-slate-900">{jobTitle || 'This post'}</span> will be permanently removed
          along with its applications and related data. This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="cursor-pointer border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex cursor-pointer items-center gap-2 border border-red-600 bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 sm:text-sm"
          >
            {deleting ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden />
                Deleting…
              </>
            ) : (
              'Delete post'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
