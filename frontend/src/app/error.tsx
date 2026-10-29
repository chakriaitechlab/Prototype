'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app]', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 32,
        textAlign: 'center',
        background: '#ffffff',
        color: 'var(--ink, #0d0d0c)',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>Something went wrong</h1>
      <p style={{ maxWidth: 420, fontSize: 14, color: 'var(--muted, #5c5a54)', margin: 0 }}>
        This page hit an unexpected error. Your data is safe — try again or return home.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: 999,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            background: '#0d0d0c',
            color: '#f4f0e6',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            borderRadius: 999,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            border: '1px solid rgba(13,13,12,0.15)',
            color: '#0d0d0c',
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
