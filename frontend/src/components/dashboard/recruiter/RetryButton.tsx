'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_CLASS = 'font-semibold text-[var(--cdash-brand)] disabled:opacity-60';

// Re-runs the server components in place instead of a full page reload.
export function RetryButton({ label = 'Retry', className = DEFAULT_CLASS }: { label?: string; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={className}
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
    >
      {isPending ? 'Retrying…' : label}
    </button>
  );
}
