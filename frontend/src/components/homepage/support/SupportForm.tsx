'use client';

import { useActionState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { supportContactAction } from '@/actions/support.actions';
import { FormAlert } from '@/components/ui/FormAlert';

export function SupportForm() {
  const [state, formAction, pending] = useActionState(supportContactAction, {});
  const { error, message, values } = state;

  return (
    <>
      <FormAlert message={error ?? message} type={error ? 'error' : 'success'} trigger={state} />

      <form action={formAction}>
        <div className="jp-form-row">
          <div className="jp-field">
            <label htmlFor="sp-name">Your name</label>
            <div className="jp-input-wrap">
              <input
                id="sp-name"
                name="name"
                defaultValue={values?.name}
                placeholder="Full name"
                autoComplete="name"
                required
                maxLength={100}
                disabled={pending}
              />
            </div>
          </div>
          <div className="jp-field">
            <label htmlFor="sp-email">Email address</label>
            <div className="jp-input-wrap">
              <input
                id="sp-email"
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
        </div>

        <div className="jp-field">
          <label htmlFor="sp-subject">Subject</label>
          <div className="jp-input-wrap">
            <input
              id="sp-subject"
              name="subject"
              defaultValue={values?.subject}
              placeholder="e.g. Problem with Smart Apply"
              required
              maxLength={200}
              disabled={pending}
            />
          </div>
        </div>

        <div className="jp-field">
          <label htmlFor="sp-message">Message</label>
          <textarea
            id="sp-message"
            name="message"
            className="jp-textarea"
            defaultValue={values?.message}
            placeholder="Describe your issue or question..."
            rows={5}
            required
            minLength={10}
            maxLength={5000}
            disabled={pending}
          />
        </div>

        <button type="submit" className="jp-btn jp-btn--primary" disabled={pending} style={{ marginTop: '0.5rem' }}>
          {pending ? (
            <>
              <Loader2 size={16} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <Send size={16} aria-hidden />
            </>
          )}
        </button>
      </form>
    </>
  );
}
