'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ChakriBetaLaunchDialog } from '@/components/ui/ChakriBetaBadge';

export function BetaNoticeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [betaOpen, setBetaOpen] = useState(false);

  return (
    <>
      {!dismissed && (
        <aside
          className="w-full bg-[#FFF9E6] border-b border-amber-200/80 text-amber-950 text-xs sm:text-[13px] leading-relaxed select-none"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 shrink-0 select-none">
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              </span>

              <p className="text-slate-800 text-xs sm:text-[13px] truncate sm:whitespace-nowrap">
                <strong className="font-semibold text-amber-950 mr-1.5">
                  Scheduled Updates:
                </strong>
                <span>
                  Chakri.ai is in active Beta. Live feature upgrades are in progress.
                </span>
                <button
                  type="button"
                  onClick={() => setBetaOpen(true)}
                  className="inline-flex items-center ml-1.5 text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Learn more
                </button>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="shrink-0 p-1 text-amber-800 hover:text-amber-950 hover:bg-amber-200/50 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss maintenance notice"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
      <ChakriBetaLaunchDialog open={betaOpen} onClose={() => setBetaOpen(false)} />
    </>
  );
}
