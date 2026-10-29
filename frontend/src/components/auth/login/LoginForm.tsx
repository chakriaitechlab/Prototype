'use client';

import { startTransition, useActionState, useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { loginAction } from '@/actions/auth.actions';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { LinkedInButton } from '@/components/auth/LinkedInButton';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

const REMEMBERED_EMAIL_KEY = 'remembered_email';

const subscribeNoop = () => () => {};

function readRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

// A dropped or aborted action response must surface as a form error, not the route error boundary.
async function submitLogin(prev: ActionState, data: FormData): Promise<ActionState> {
  try {
    return (await loginAction(prev, data)) ?? prev;
  } catch {
    return { error: 'Could not reach the server. Please try again.' };
  }
}

export function LoginForm({
  notice,
  oauthError,
  signupEnabled = true,
}: {
  notice?: string;
  oauthError?: string;
  signupEnabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitLogin, {});
  const rememberedEmail = useSyncExternalStore(subscribeNoop, readRememberedEmail, () => '');
  const [emailInput, setEmail] = useState<string | null>(null);
  const [rememberInput, setRemember] = useState<boolean | null>(null);

  const email = emailInput ?? rememberedEmail;
  const remember = rememberInput ?? Boolean(rememberedEmail);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      if (remember) localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      else localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    } catch {}
    startTransition(() => formAction(data));
  };

  const error = state.error ?? oauthError;

  return (
    <>
      <header className="jp-auth-heading">
        <h1>Welcome back</h1>
        <p className="jp-auth-subtitle">
          New to Chakri.AI?{' '}
          <Link href={signupEnabled ? '/auth/signup' : '/waitlist'} className="jp-link jp-link--strong">
            {signupEnabled ? 'Register Now' : 'Join the Waitlist'}
          </Link>{' '}
          or{' '}
          <Link href="/" className="jp-link">
            Back
          </Link>
        </p>
      </header>

      <FormAlert message={error ? undefined : notice} type="success" />
      <FormAlert message={error} trigger={state.error ? state : oauthError} />

      <form onSubmit={handleSubmit} className="jp-auth-form">
        <div className="jp-field">
          <label htmlFor="jp-email">Email address</label>
          <div className="jp-input-wrap">
            <input
              id="jp-email"
              name="email"
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              inputMode="email"
              spellCheck={false}
              disabled={pending}
            />
          </div>
        </div>

        <PasswordInput
          id="jp-password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={pending}
        />

        <div className="jp-field-hint">
          <label className="jp-remember">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={pending}
            />
            <span>Remember Me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="jp-link"
            style={pending ? { pointerEvents: 'none', opacity: 0.6 } : undefined}
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={pending} className="jp-btn jp-btn--primary jp-auth-submit">
          {pending ? (
            <>
              <Loader2 size={18} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Signing in…
            </>
          ) : (
            <>
              Sign In
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
