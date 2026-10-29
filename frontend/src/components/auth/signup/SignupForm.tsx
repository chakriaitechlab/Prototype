'use client';

import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { signupAction } from '@/actions/auth.actions';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { LinkedInButton } from '@/components/auth/LinkedInButton';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, {});
  const [clientError, setClientError] = useState<ActionState>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password'));

    const problem =
      password.length < 8
        ? 'Password must be at least 8 characters.'
        : password !== data.get('confirm')
          ? 'Passwords do not match.'
          : !data.get('terms')
            ? 'Please agree to our Terms and Privacy Policy to proceed.'
            : '';

    setClientError({ error: problem });
    if (!problem) startTransition(() => formAction(data));
  };

  const alert = clientError.error ? clientError : state;

  return (
    <>
      <header className="jp-auth-heading">
        <h1>Create account</h1>
        <p className="jp-auth-subtitle">
          Already have an account?{' '}
          <Link href="/auth/login" className="jp-link jp-link--strong">
            Sign In
          </Link>{' '}
          or{' '}
          <Link href="/" className="jp-link">
            Back
          </Link>
        </p>
      </header>

      <FormAlert message={alert.error} trigger={alert} />

      <form onSubmit={handleSubmit} className="jp-auth-form">
        <div className="jp-field">
          <label htmlFor="name">Full Name</label>
          <div className="jp-input-wrap">
            <input
              id="name"
              name="name"
              placeholder="Your full name"
              required
              autoComplete="name"
              autoFocus
              disabled={pending}
            />
          </div>
        </div>

        <div className="jp-field">
          <label htmlFor="email">Email address</label>
          <div className="jp-input-wrap">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              required
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              disabled={pending}
            />
          </div>
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          disabled={pending}
        />

        <PasswordInput
          id="confirm"
          name="confirm"
          label="Confirm Password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          disabled={pending}
        />

        <div style={{ margin: '-0.25rem 0 1.25rem' }}>
          <label className="jp-remember" style={{ alignItems: 'flex-start', fontSize: '0.875rem', lineHeight: 1.45 }}>
            <input
              type="checkbox"
              name="terms"
              required
              disabled={pending}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            <span>
              By creating an account you agree to our{' '}
              <Link href="/terms" className="jp-link" target="_blank" rel="noopener noreferrer">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="jp-link" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <button type="submit" disabled={pending} className="jp-btn jp-btn--primary jp-auth-submit">
          {pending ? (
            <>
              <Loader2 size={18} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Creating…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight size={16} aria-hidden />
            </>
          )}
        </button>
      </form>

      <div className="jp-divider">or continue with</div>
      <div className="jp-social">
        <GoogleButton disabled={pending} />
        <LinkedInButton disabled={pending} />
      </div>
    </>
  );
}
