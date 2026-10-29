'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

const CONSENTS = [
  "I'll keep my camera on and stay in fullscreen.",
  "I won't switch tabs or get outside help.",
  'I understand I can take this interview only once.',
];

interface ConsentDialogProps {
  starting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConsentDialog({ starting, onCancel, onConfirm }: ConsentDialogProps) {
  const [checked, setChecked] = useState<boolean[]>(() => CONSENTS.map(() => false));
  const ready = checked.every(Boolean);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !starting) onCancel();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [starting, onCancel]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md" onClick={starting ? undefined : onCancel} />
      <div className="relative z-10 w-full max-w-[460px] border border-slate-300 bg-white shadow-2xl">
        <div className="border-b border-[#e4e5e8] px-5 py-4">
          <h3 id="consent-title" className="text-lg font-bold text-[#18191c]">
            Ready to begin?
          </h3>
          <p className="mt-0.5 text-[13px] text-[#767f8c]">The interview opens in fullscreen.</p>
        </div>
        <div className="px-5 py-4">
          {CONSENTS.map((text, index) => (
            <label key={text} className="flex cursor-pointer gap-2.5 py-1.5 text-[13.5px] leading-snug text-[#5e6670]">
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={(e) => setChecked((current) => current.map((value, i) => (i === index ? e.target.checked : value)))}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#0a65cc]"
              />
              {text}
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2.5 border-t border-[#e4e5e8] bg-[#fafbfc] px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={starting}
            className="cursor-pointer border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!ready || starting}
            className="inline-flex cursor-pointer items-center gap-2 border border-[#0a65cc] bg-[#0a65cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084f9e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {starting ? 'Starting…' : 'Start interview'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
