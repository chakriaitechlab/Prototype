'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export function GoBackButton({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      {children}
    </button>
  );
}
