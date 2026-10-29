'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { SettingsCopy } from '@/types/settings';
import { DeleteAccountModal } from './DeleteAccountModal';

export function DeleteAccountSection({ copy }: { copy: SettingsCopy['deleteAccount'] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="cset-section max-w-2xl">
      <div className="border border-red-200 rounded-lg p-6 bg-red-50/40">
        <div className="flex items-start gap-3.5">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={22} />
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-red-900">Delete Your Account</h3>
            <p className="text-sm text-red-700 leading-relaxed">{copy.description}</p>
            <ul className="text-xs text-red-600 list-disc list-inside space-y-1 pt-1">
              {copy.consequences.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-red-200 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 border border-rose-600 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white active:scale-[0.98] cursor-pointer rounded-none shadow-sm"
            onClick={() => setModalOpen(true)}
          >
            <Trash2 size={16} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {modalOpen && <DeleteAccountModal accountLabel={copy.accountLabel} onClose={() => setModalOpen(false)} />}
    </section>
  );
}
