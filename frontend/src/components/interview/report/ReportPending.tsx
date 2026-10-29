'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

const REFRESH_INTERVAL_MS = 5000;

export function ReportPending({ failed }: { failed: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (failed) return;
    const timer = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [failed, router]);

  if (failed) {
    return (
      <div className="border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
        <AlertCircle size={30} className="mx-auto mb-3.5 text-[#e05151]" aria-hidden />
        <h3 className="mb-1.5 text-lg font-bold text-[#18191c]">Couldn&apos;t prepare the report</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#767f8c]">
          The AI evaluation failed after several tries. The answers are saved, so the report can be generated again later.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#e4e5e8] bg-white p-10 text-center sm:p-14">
      <Loader2 size={30} className="mx-auto mb-3.5 animate-spin text-[#0a65cc]" aria-hidden />
      <h3 className="mb-1.5 text-lg font-bold text-[#18191c]">Preparing the report</h3>
      <p className="mx-auto max-w-md text-sm leading-relaxed text-[#767f8c]">
        The AI is reviewing every answer. This usually takes under a minute, and the page updates on its own.
      </p>
    </div>
  );
}
