'use client';

import { Loader2, Trash2, X } from 'lucide-react';

interface RemoveFavoriteModalProps {
  name: string;
  removing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveFavoriteModal({ name, removing, onConfirm, onClose }: RemoveFavoriteModalProps) {
  const close = () => {
    if (!removing) onClose();
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
        aria-labelledby="remove-favorite-title"
        className="w-full max-w-[420px] border border-[#e4e5e8] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="mb-2 flex h-10 w-10 items-center justify-center border border-rose-200 bg-rose-50 text-rose-600">
            <Trash2 size={18} aria-hidden />
          </span>
          <button
            type="button"
            disabled={removing}
            onClick={close}
            aria-label="Close dialog"
            className="cursor-pointer p-1 text-gray-400 transition hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <h2 id="remove-favorite-title" className="text-lg font-bold text-[#18191c]">
          Remove Saved Candidate?
        </h2>
        <p className="mt-1.5 text-sm text-[#5e6670]">
          Are you sure you want to remove <strong className="text-[#18191c]">{name}</strong> from your saved
          candidates? You can always bookmark them again from the talent pipeline.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={removing}
            onClick={close}
            className="cursor-pointer border border-[#e4e5e8] bg-white px-4 py-2 text-sm font-semibold text-[#5e6670] transition hover:bg-[#f1f2f4]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={removing}
            onClick={onConfirm}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 border border-rose-600 bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {removing && <Loader2 size={14} className="animate-spin" aria-hidden />}
            {removing ? 'Removing…' : 'Remove Candidate'}
          </button>
        </div>
      </div>
    </div>
  );
}
