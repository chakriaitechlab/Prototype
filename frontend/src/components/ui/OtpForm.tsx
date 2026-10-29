'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, FormEvent, KeyboardEvent, ReactNode } from 'react';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type { ActionState } from '@/types/auth';
import { FormAlert } from '@/components/ui/FormAlert';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function formatCooldown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface OtpFormProps {
  title: string;
  description: ReactNode;
  submitLabel: string;
  fields: Record<string, string>;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  resend: () => Promise<ActionState>;
  timerLabel?: string;
  footer?: ReactNode;
}

export function OtpForm({
  title,
  description,
  submitLabel,
  fields,
  action,
  resend,
  timerLabel = 'Resend code in',
  footer,
}: OtpFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<{ after: ActionState; result: ActionState } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const updateDigit = (index: number, value: string) => {
    setDigits((prev) => prev.map((d, i) => (i === index ? value : d)));
  };

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    updateDigit(index, char);
    if (char && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      updateDigit(index - 1, '');
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ''));
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const result = await resend().catch(() => ({ error: 'Failed to resend code.' }));
    setResendResult({ after: state, result });
    if (!result.error) setCooldown(RESEND_COOLDOWN_SECONDS);
    setResending(false);
  };

  // Whichever happened last wins: a resend replaces the previous verify error until the next verify.
  const latestResend = resendResult?.after === state ? resendResult.result : null;
  const error = latestResend ? latestResend.error : state.error;
  const success = latestResend?.message;

  return (
    <>
      <header className="jp-auth-heading">
        <h1>{title}</h1>
        <p className="jp-auth-subtitle">{description}</p>
      </header>

      <FormAlert message={success} type="success" trigger={resendResult} />

      <FormAlert message={error} trigger={latestResend ? resendResult : state} />

      <form onSubmit={handleSubmit} className="jp-auth-form">
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input type="hidden" name="code" value={code} />

        <div className="jp-otp-grid">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              className={`jp-otp-box ${digit ? 'is-filled' : ''}`}
              autoFocus={idx === 0}
              aria-label={`Digit ${idx + 1}`}
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={pending || code.length !== CODE_LENGTH}
          className="jp-btn jp-btn--primary jp-auth-submit"
        >
          {pending ? (
            <>
              <Loader2 size={18} aria-hidden style={{ animation: 'jp-spin 1s linear infinite' }} />
              Verifying code…
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight size={16} aria-hidden />
            </>
          )}
        </button>
      </form>

      <div className="jp-otp-resend">
        <span>Didn&apos;t receive the code?</span>
        {cooldown > 0 ? (
          <span className="jp-otp-timer">
            {timerLabel} <strong>{formatCooldown(cooldown)}</strong>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="jp-otp-resend-btn"
          >
            {resending ? (
              <>
                <Loader2 size={13} style={{ animation: 'jp-spin 1s linear infinite', display: 'inline' }} /> Sending…
              </>
            ) : (
              <>
                <RefreshCw size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Resend Code
              </>
            )}
          </button>
        )}
      </div>

      {footer}
    </>
  );
}
