'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { deleteAccountAction } from '@/actions/settings.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

const CONFIRMATION_WORD = 'delete';

interface DeleteAccountModalProps {
  accountLabel: string;
  onClose: () => void;
}

export function DeleteAccountModal({ accountLabel, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  const confirmed = confirmText.trim().toLowerCase() === CONFIRMATION_WORD;
  const blocked = !confirmed || pending;

  const close = () => {
    if (!pending) onClose();
  };

  const confirmDelete = () =>
    startTransition(async () => {
      setState(await deleteAccountAction(confirmText));
    });

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4 backdrop-blur-sm animate-in fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <FormAlert message={state.error} trigger={state} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="w-full max-w-md rounded-none bg-white p-6 shadow-2xl border border-slate-300 animate-in zoom-in-95 duration-150"
      >
        <div className="flex justify-between items-start gap-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-red-600 font-semibold">
            <AlertTriangle size={22} className="text-red-600" />
            <h2 id="delete-dialog-title" className="text-base font-bold text-gray-900">
              Delete Account
            </h2>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={close}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 p-1 rounded-none transition disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm leading-relaxed text-gray-700">
            Are you sure you want to delete {accountLabel}? This action is{' '}
            <strong className="text-red-600 font-semibold">permanent and cannot be undone</strong>.
          </p>
          <div className="rounded-none bg-red-50 p-3 text-xs text-red-800 leading-relaxed border border-red-200">
            To confirm, please type <strong className="font-mono font-bold text-red-700">{CONFIRMATION_WORD}</strong> in
            the box below:
          </div>
        </div>

        <input
          aria-label="Type delete to confirm"
          className="cset-input mt-4 text-center font-mono tracking-wider font-semibold text-gray-900 rounded-none border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          value={confirmText}
          disabled={pending}
          onChange={(e) => setConfirmText(e.target.value)}
          autoFocus
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            className="rounded-none border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            onClick={close}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={blocked}
            onClick={confirmDelete}
            className={`inline-flex items-center justify-center gap-2 rounded-none px-5 py-2 text-xs sm:text-sm font-semibold text-white transition ${
              blocked
                ? 'pointer-events-none bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-[0.98] cursor-pointer shadow-sm'
            }`}
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            <span>{pending ? 'Deleting...' : 'Delete My Account'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
