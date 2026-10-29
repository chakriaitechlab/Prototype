'use client';

import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { resetPasswordAction } from '@/actions/auth.actions';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});
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
          : '';

    setClientError({ error: problem });
    if (!problem) startTransition(() => formAction(data));
  };

  const alert = clientError.error ? clientError : state;

  return (
    <>
      <header className="jp-auth-heading">
        <h1>Set new password</h1>
        <p className="jp-auth-subtitle">
          Choose a new password for <strong>{email}</strong>
        </p>
      </header>

      <FormAlert message={alert.error} trigger={alert} />

      <form onSubmit={handleSubmit} className="jp-auth-form">
        <PasswordInput
          id="new-password"
          name="password"
          label="New password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          autoFocus
          disabled={pending}
        />

        <PasswordInput
          id="confirm-password"
          name="confirm"
          label="Confirm new password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          disabled={pending}
        />

        <button type="submit" disabled={pending} className="jp-btn jp-btn--primary jp-auth-submit">
          {pending ? (
            <>
              <Loader2 size={18} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Updating password…
            </>
          ) : (
            <>
              Save New Password
              <ArrowRight size={16} aria-hidden />
            </>
          )}
        </button>
      </form>

      <p className="jp-auth-legal" style={{ textAlign: 'center', marginTop: '1.25rem' }}>
        <Link href="/auth/login" className="jp-link">
          Cancel and return to Sign In
        </Link>
      </p>
    </>
  );
}
