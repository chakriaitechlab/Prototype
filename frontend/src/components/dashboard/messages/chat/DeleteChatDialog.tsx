'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface DeleteChatDialogProps {
  name: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteChatDialog({ name, pending, onConfirm, onClose }: DeleteChatDialogProps) {
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

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="delete-chat-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm border border-slate-300 bg-white p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-150">
        <h3 id="delete-chat-title" className="mb-2 text-base font-bold text-slate-900">
          Delete chat?
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Messages with {name} will be removed from your chat list. {name} will still see them.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center gap-1.5 border border-rose-700 bg-rose-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70 sm:text-sm"
          >
            {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
