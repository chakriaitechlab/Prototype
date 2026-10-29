'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { googleSignInAction, linkedinSignInAction } from '@/actions/auth.actions';
import { OAUTH_STATE_KEY, oauthRedirectUri } from '@/utils/oauth';

const FAILED = 'Social sign-in failed. Please try again.';

async function completeSignIn(): Promise<string> {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const param = (key: string) => query.get(key) ?? hash.get(key);

  const providerError = param('error_description') ?? param('error');
  if (providerError) return providerError;

  const expected = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  const [provider, state] = expected?.split(':') ?? [];
  if (!state || param('state') !== state) return 'Your sign-in session expired. Please try again.';

  const idToken = param('id_token');
  const code = param('code');

  if (provider === 'google' && idToken) {
    const result = await googleSignInAction(idToken);
    return result?.error ?? '';
  }
  if (provider === 'linkedin' && code) {
    const result = await linkedinSignInAction(code, oauthRedirectUri(window.location.origin));
    return result?.error ?? '';
  }
  return FAILED;
}

export function OAuthCallback() {
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    completeSignIn()
      .then(setError)
      .catch(() => setError(FAILED));
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <header className="jp-auth-heading">
          <h1>Sign In Failed</h1>
          <p className="jp-auth-subtitle">Something went wrong during social authentication.</p>
        </header>

        <div className="jp-alert is-error" style={{ margin: '1.5rem 0' }} role="alert">
          {error}
        </div>

        <Link href="/auth/login" className="jp-btn jp-btn--primary">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Loader2 size={36} color="#0a65cc" style={{ animation: 'jp-spin 1s linear infinite' }} />
      </div>
      <header className="jp-auth-heading">
        <h1>Completing Sign In…</h1>
        <p className="jp-auth-subtitle">Please wait while we verify your credentials.</p>
      </header>
    </div>
  );
}
