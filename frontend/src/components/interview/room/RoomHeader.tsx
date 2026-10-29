'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { formatClock, MAX_INTERVIEW_WARNINGS } from '@/utils/interviews';

const CLOCK_TICK_MS = 1_000;
const BADGE = 'inline-flex items-center gap-1.5 border border-white/10 bg-slate-900/60 px-2.5 py-1.5 text-[12.5px] font-semibold';

export function RoomHeader({ title, warnings }: { title: string; warnings: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const clock = setInterval(() => setElapsed((seconds) => seconds + 1), CLOCK_TICK_MS);
    return () => clearInterval(clock);
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-[3] flex items-start justify-between gap-3 px-4 py-4 sm:px-6">
      <div className="min-w-0">
        <p className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#93c5fd]">Chakri AI Interview</p>
        <p className="truncate text-base font-semibold">{title}</p>
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-2">
        <span className={BADGE}>
          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
          {formatClock(elapsed)}
        </span>
        <span className={`${BADGE} ${warnings ? 'text-[#fbbf24]' : ''}`}>
          <ShieldCheck size={14} aria-hidden />
          {warnings} / {MAX_INTERVIEW_WARNINGS} warnings
        </span>
      </div>
    </header>
  );
}
