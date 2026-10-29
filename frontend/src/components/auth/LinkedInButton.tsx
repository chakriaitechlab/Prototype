'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { startOAuth } from '@/utils/oauth';

export function LinkedInButton({
  disabled = false,
  label = 'Continue with LinkedIn',
}: {
  disabled?: boolean;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    startOAuth('linkedin');
  };

  return (
    <button
      type="button"
      className="jp-social-btn"
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2
          size={20}
          aria-hidden="true"
          style={{ animation: 'jp-spin 1s linear infinite', flexShrink: 0 }}
        />
      ) : (
        <svg
          className="jp-social-icon jp-linkedin-icon"
          width={20}
          height={20}
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, flexShrink: 0, display: 'block' }}
        >
          <path
            fill="#0A66C2"
            d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z"
          />
        </svg>
      )}
      <span>{loading ? 'Connecting…' : label}</span>
    </button>
  );
}