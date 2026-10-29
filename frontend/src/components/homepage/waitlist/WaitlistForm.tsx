'use client';

import { useActionState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { joinWaitlistAction } from '@/actions/waitlist.actions';
import { FormAlert } from '@/components/ui/FormAlert';

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlistAction, {});
  const { error, message, values } = state;

  return (
    <>
      <FormAlert message={error ?? message} type={error ? 'error' : 'success'} trigger={state} />

      <form action={formAction}>
        <div className="jp-field">
          <label htmlFor="wl-name">Full name</label>
          <div className="jp-input-wrap">
            <input
              id="wl-name"
              name="fullName"
              defaultValue={values?.fullName}
              placeholder="Full name"
              autoComplete="name"
              required
              maxLength={100}
              disabled={pending}
            />
          </div>
        </div>

        <div className="jp-field">
          <label htmlFor="wl-email">Email address</label>
          <div className="jp-input-wrap">
            <input
              id="wl-email"
              name="email"
              type="email"
              defaultValue={values?.email}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={pending}
            />
          </div>
        </div>

        <div className="jp-field">
          <label htmlFor="wl-occupation">Occupation (optional)</label>
          <div className="jp-input-wrap">
            <input
              id="wl-occupation"
              name="occupation"
              defaultValue={values?.occupation}
              placeholder="e.g. Software Engineer, HR Manager, Student"
              autoComplete="organization-title"
              maxLength={100}
              disabled={pending}
            />
          </div>
        </div>

        <button type="submit" className="jp-btn jp-btn--primary" disabled={pending} style={{ marginTop: '0.5rem' }}>
          {pending ? (
            <>
              <Loader2 size={16} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Joining…
            </>
          ) : (
            <>
              Join the Waitlist
              <Send size={16} aria-hidden />
            </>
          )}
        </button>
      </form>
    </>
  );
}
