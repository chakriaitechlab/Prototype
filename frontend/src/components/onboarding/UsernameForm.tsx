'use client';

import { startTransition, useActionState, useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, AtSign, Check, Copy, Loader2, X } from 'lucide-react';
import { checkUsernameAction, setUsernameAction } from '@/actions/onboarding.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState, UserRole } from '@/types/auth';

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;
const FORMAT_MESSAGE = 'Use 3–30 characters: start with a letter, then letters, numbers, or underscores.';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
type CheckResult = { username: string; availability: Availability; message: string };

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '');

interface UsernameFormProps {
  role: UserRole;
  currentUsername: string | null;
}

export function UsernameForm({ role, currentUsername }: UsernameFormProps) {
  const inputId = useId();
  const honeypotId = useId();
  const [state, formAction, pending] = useActionState(setUsernameAction, {});
  const [username, setUsername] = useState(currentUsername ?? '');
  const [checked, setChecked] = useState<CheckResult | null>(null);
  const [fieldError, setFieldError] = useState<ActionState>({});
  const [copied, setCopied] = useState(false);

  const value = normalize(username);
  const isCurrent = Boolean(currentUsername) && value === currentUsername;
  const formatError = value && !USERNAME_PATTERN.test(value) ? FORMAT_MESSAGE : '';
  const result = checked?.username === value ? checked : null;

  const availability: Availability = !value
    ? 'idle'
    : isCurrent
      ? 'available'
      : formatError
        ? 'invalid'
        : (result?.availability ?? 'checking');

  const availabilityMessage = !value
    ? ''
    : isCurrent
      ? 'Current username'
      : formatError || result?.message || 'Checking availability…';

  useEffect(() => {
    if (!value || isCurrent || formatError) return;

    let active = true;
    const timer = setTimeout(async () => {
      const response = await checkUsernameAction(role, value).catch(() => ({
        available: false,
        message: 'Could not check username right now.',
      }));
      if (!active) return;
      setChecked({
        username: value,
        availability: response.available ? 'available' : 'taken',
        message: response.available ? 'Username is available' : response.message,
      });
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [role, value, isCurrent, formatError]);

  const handleCopy = (url: string) => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError({});

    if (formatError) {
      setFieldError({ error: formatError });
      return;
    }
    if (availability !== 'available') {
      setFieldError({ error: 'Please choose an available username to continue.' });
      return;
    }

    const data = new FormData();
    data.set('role', role);
    data.set('username', value);
    startTransition(() => formAction(data));
  };

  const canSubmit = availability === 'available' && value.length >= 3 && !pending;
  const alert = fieldError.error ? fieldError : state;
  const profileUrl = `chakriai.com/${value || 'your_username'}`;
  const showPreview = role === 'SEEKER' && Boolean(value) && availability === 'available';

  const wrapClass = [
    'jp-username-wrap',
    availability === 'available' ? 'is-available' : '',
    availability === 'taken' || availability === 'invalid' ? 'is-invalid' : '',
    availability === 'checking' ? 'is-checking' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const statusIcon =
    availability === 'checking' ? (
      <Loader2 size={16} className="jp-username-status-icon is-spin" aria-hidden />
    ) : availability === 'available' ? (
      <Check size={16} className="jp-username-status-icon is-ok" aria-hidden />
    ) : availability === 'taken' || availability === 'invalid' ? (
      <X size={16} className="jp-username-status-icon is-bad" aria-hidden />
    ) : (
      <AtSign size={16} className="jp-username-status-icon" aria-hidden />
    );

  return (
    <>
      <FormAlert message={alert.error} trigger={alert} />

      <form onSubmit={handleSubmit} className="jp-auth-form" autoComplete="off">
        <div className="jp-field" style={{ marginBottom: '24px' }}>
          <label htmlFor={inputId} style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Choose a unique handle <span style={{ color: '#ef4444' }}>*</span>
          </label>

          <div className="jp-username-field">
            <input
              id={honeypotId}
              type="text"
              name="username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden
              className="jp-autofill-trap"
              defaultValue=""
              readOnly
            />
            <div className={wrapClass}>
              <span className="jp-username-prefix" aria-hidden>
                @
              </span>
              <input
                id={inputId}
                className="jp-username-input"
                type="text"
                name="chakri_profile_handle"
                inputMode="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => {
                  setFieldError({});
                  setUsername(normalize(e.target.value));
                }}
                disabled={pending}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={30}
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                aria-describedby={`${inputId}-hint ${inputId}-status`}
                aria-invalid={availability === 'taken' || availability === 'invalid'}
              />
              <span className="jp-username-status" aria-live="polite">
                {statusIcon}
              </span>
            </div>

            <div className="jp-username-meta">
              <p id={`${inputId}-hint`} className="jp-field-note">
                3–30 characters · letters, numbers, underscores · must be unique
              </p>
              <span className="jp-username-count" aria-hidden>
                {username.length}/30
              </span>
            </div>

            <p
              id={`${inputId}-status`}
              className={`jp-username-feedback is-${availability}`}
              role="status"
              style={{ minHeight: '1.25rem' }}
            >
              {availabilityMessage || '\u00a0'}
            </p>

            {role === 'SEEKER' && (
              <div
                className="jp-username-preview"
                style={{ visibility: showPreview ? 'visible' : 'hidden' }}
                aria-hidden={!showPreview}
              >
                <div className="jp-username-preview-info">
                  <span className="jp-username-preview-label">Your profile URL</span>
                  <span className="jp-username-preview-value">{profileUrl}</span>
                </div>

                <button
                  type="button"
                  className={`jp-username-copy-btn ${copied ? 'is-copied' : ''}`}
                  onClick={() => handleCopy(`https://${profileUrl}`)}
                  title="Copy profile link"
                  aria-label="Copy profile link"
                >
                  {copied ? (
                    <>
                      <Check size={14} aria-hidden />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} aria-hidden />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={!canSubmit} className="jp-btn jp-btn--primary jp-btn--block">
          {pending ? (
            <>
              <Loader2 className="jp-spinner" size={18} aria-hidden />
              <span>Saving username…</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight size={18} aria-hidden />
            </>
          )}
        </button>
      </form>
    </>
  );
}
