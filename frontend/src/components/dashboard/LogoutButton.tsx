'use client';

import { useEffect, useState } from 'react';
import { createPortal, useFormStatus } from 'react-dom';
import { Loader2, LogOut } from 'lucide-react';
import { logoutAction } from '@/actions/auth.actions';

type LogoutDialogProps = {
  open: boolean;
  onClose: () => void;
  label?: string;
  message?: string;
};

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-none border border-rose-700 bg-rose-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-rose-700 hover:border-rose-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-rose-500/40 disabled:opacity-70 cursor-pointer"
    >
      {pending && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {label}
    </button>
  );
}

export function LogoutDialog({
  open,
  onClose,
  label = 'Logout',
  message = 'Are you sure you want to log out? You will need to sign back in to access your account and dashboard.',
}: LogoutDialogProps) {
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md rounded-none border border-slate-300 bg-white p-6 animate-in zoom-in-95 fade-in duration-150 shadow-2xl">
        <h3 id="logout-dialog-title" className="text-base font-bold text-slate-900 mb-2">
          {label}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

        <form action={logoutAction} className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-none border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <ConfirmButton label={label} />
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function LogoutButton({ className = '', message }: { className?: string; message?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Logout"
        className={`flex items-center justify-center gap-2 rounded-none border border-rose-600 bg-white px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white active:scale-[0.98] cursor-pointer ${className}`.trim()}
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
      <LogoutDialog open={open} onClose={() => setOpen(false)} message={message} />
    </>
  );
}
