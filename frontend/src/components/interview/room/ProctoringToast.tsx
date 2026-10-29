'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MAX_INTERVIEW_WARNINGS } from '@/utils/interviews';

const TOAST_DURATION_MS = 5000;

export function ProctoringToast({ message, warnings, trigger }: { message: string | null; warnings: number; trigger: number }) {
  const [hidden, setHidden] = useState<number | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setHidden(trigger), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, trigger]);

  if (!message || hidden === trigger) return null;

  return (
    <div role="alert" className="absolute left-1/2 top-[76px] z-[4] flex -translate-x-1/2 items-center gap-2 border border-[#f5d9a8] bg-[#fff7e6] px-3.5 py-2 text-[13px] font-medium text-[#8a5a00]">
      <AlertTriangle size={16} aria-hidden />
      Warning {warnings} of {MAX_INTERVIEW_WARNINGS}: {message}
    </div>
  );
}
