'use client';

import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { saveCompanyAction } from '@/actions/onboarding.actions';
import { FormAlert } from '@/components/ui/FormAlert';

export function CompanyForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(saveCompanyAction, {});
  const [name, setName] = useState(initialName);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  return (
    <>
      <FormAlert message={state.error} trigger={state} />

      <form onSubmit={handleSubmit} className="jp-auth-form" autoComplete="off">
        <div className="jp-field">
          <label htmlFor="recruiter-company">Company</label>
          <div className="jp-input-wrap">
            <input
              id="recruiter-company"
              name="name"
              type="text"
              placeholder="Your company name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="organization"
              autoFocus
            />
          </div>
        </div>

        <button type="submit" className="jp-btn jp-btn--primary jp-btn--block" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="jp-spinner" size={18} aria-hidden />
              <span>Completing…</span>
            </>
          ) : (
            <>
              <span>Complete profile</span>
              <ArrowRight size={18} aria-hidden />
            </>
          )}
        </button>
      </form>
    </>
  );
}
