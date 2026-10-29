'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
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
    <html lang="en" data-scroll-behavior="smooth">
      <body style={{ margin: 0, fontFamily: 'Inter, sans-serif', background: '#f4f0e6', color: '#0d0d0c' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, fontWeight: 400, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ maxWidth: 420, fontSize: 14, color: '#5c5a54', margin: 0 }}>
            An unexpected error occurred. Your data is safe — try again or return to the homepage.
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
      </body>
    </html>
  );
}
