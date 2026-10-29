'use client';

import { Loader2, Trash2, X } from 'lucide-react';

interface DeleteResumeModalProps {
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteResumeModal({ deleting, onConfirm, onClose }: DeleteResumeModalProps) {
  const close = () => {
    if (!deleting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-resume-title"
        className="w-full max-w-md rounded-none bg-white p-6 shadow-2xl border border-slate-300 animate-in zoom-in-95 duration-150"
      >
        <div className="flex justify-between items-start gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center bg-red-50 text-red-600">
              <Trash2 size={16} aria-hidden />
            </span>
            <h2 id="delete-resume-title" className="text-base font-bold text-gray-900">
              Remove resume?
            </h2>
          </div>
          <button
            type="button"
            disabled={deleting}
            onClick={close}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 p-1 transition disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          Your resume will be permanently removed from your profile. You can upload a new one at any time.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            className="border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            onClick={close}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 bg-red-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-red-700 transition cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            <span>{deleting ? 'Deleting…' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
