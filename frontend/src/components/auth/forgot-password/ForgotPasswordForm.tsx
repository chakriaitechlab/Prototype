'use client';

import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { forgotPasswordAction } from '@/actions/auth.actions';
import { FormAlert } from '@/components/ui/FormAlert';

export function ForgotPasswordForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});
  const [email, setEmail] = useState(defaultEmail);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  const codeQuery = new URLSearchParams({ type: 'reset', ...(email && { email }) });

  return (
    <>
      <header className="jp-auth-heading">
        <h1>Forgot password</h1>
        <p className="jp-auth-subtitle">
          Remember your password?{' '}
          <Link href="/auth/login" className="jp-link jp-link--strong">
            Sign In
          </Link>
        </p>
      </header>

      <FormAlert message={state.error} trigger={state} />

      <form onSubmit={handleSubmit} className="jp-auth-form">
        <div className="jp-field">
          <label htmlFor="fp-email">Email address</label>
          <div className="jp-input-wrap">
            <input
              id="fp-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              autoFocus
              required
              disabled={pending}
            />
          </div>
        </div>

        <button type="submit" disabled={pending} className="jp-btn jp-btn--primary jp-auth-submit">
          {pending ? (
            <>
              <Loader2 size={18} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Sending code…
            </>
          ) : (
            <>
              Send Reset Code
              <ArrowRight size={16} aria-hidden />
            </>
          )}
        </button>
      </form>

      <p className="jp-auth-legal" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        Already have a 6-digit code?{' '}
        <Link href={`/auth/verify-otp?${codeQuery}`} className="jp-link jp-link--strong">
          Enter code here
        </Link>
      </p>
    </>
  );
}
