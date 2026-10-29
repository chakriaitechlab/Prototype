'use client';

import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { sendPhoneOtpAction } from '@/actions/onboarding.actions';
import type { UserRole } from '@/types/auth';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

const COUNTRIES = [
  { code: 'BD', label: 'Bangladesh', dial: '880', placeholder: '017XXXXXXXX' },
  { code: 'IN', label: 'India', dial: '91', placeholder: '98XXXXXXXX' },
] as const;

type CountryCode = (typeof COUNTRIES)[number]['code'];

type PhoneCheck = { ok: true; international: string } | { ok: false; message: string };

function validatePhone(country: CountryCode, phone: string): PhoneCheck {
  const raw = phone.trim();

  if (!raw) return { ok: false, message: 'Phone number is required.' };
  if (raw.startsWith('+') || /[^\d]/.test(raw)) {
    return { ok: false, message: 'Enter digits only (0-9). Do not include country code, +, or spaces.' };
  }

  if (country === 'BD') {
    if (raw.startsWith('880')) {
      return {
        ok: false,
        message: 'Do not include country code (880). Just enter 11 digits (01XXXXXXXXX) or 10 digits (1XXXXXXXXX).',
      };
    }
    if (raw.length !== 10 && raw.length !== 11) {
      return {
        ok: false,
        message: 'Bangladesh phone number must be exactly 11 digits (e.g. 017XXXXXXXX) or 10 digits (e.g. 17XXXXXXXX).',
      };
    }
    if (!/^0?1[3-9]\d{8}$/.test(raw)) {
      return { ok: false, message: 'Invalid operator code. Must start with 013–019 (or 13–19).' };
    }
    return { ok: true, international: `880${raw.replace(/^0/, '')}` };
  }

  if (raw.startsWith('91') && raw.length > 10) {
    return { ok: false, message: 'Do not include country code (91). Just enter your 10-digit number.' };
  }
  if (raw.length !== 10) return { ok: false, message: 'India phone number must be exactly 10 digits.' };
  if (!/^[6-9]\d{9}$/.test(raw)) return { ok: false, message: 'Invalid India mobile number. Must start with 6, 7, 8, or 9.' };
  return { ok: true, international: `91${raw}` };
}

export function PhoneForm({ role }: { role: UserRole }) {
  const [state, formAction, pending] = useActionState(sendPhoneOtpAction, {});
  const [country, setCountry] = useState<CountryCode>('BD');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<ActionState>({});

  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? '880';
  const alert = phoneError.error ? phoneError : state;

  const recheck = (nextCountry: CountryCode, value: string) => {
    if (!value.trim()) return;
    const check = validatePhone(nextCountry, value);
    setPhoneError(check.ok ? {} : { error: check.message });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const check = validatePhone(country, phone);

    if (!check.ok) {
      setPhoneError({ error: check.message });
      return;
    }

    setPhoneError({});
    const data = new FormData();
    data.set('phoneNumber', check.international);
    data.set('role', role);
    startTransition(() => formAction(data));
  };

  return (
    <form onSubmit={handleSubmit} className="jp-auth-form" autoComplete="off">
      <FormAlert message={alert.error} trigger={alert} />
      <div className="jp-field">
        <label htmlFor="onboard-country">Country</label>
        <select
          id="onboard-country"
          value={country}
          onChange={(e) => {
            const next = e.target.value as CountryCode;
            setCountry(next);
            setPhoneError({});
            recheck(next, phone);
          }}
          required
          autoComplete="country"
        >
          {COUNTRIES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="jp-field">
        <label htmlFor="onboard-phone">Phone</label>
        <div className={`jp-phone-group ${alert.error ? 'is-error' : ''}`}>
          <span className="jp-phone-dial-badge">+{dial}</span>
          <input
            id="onboard-phone"
            type="tel"
            placeholder={COUNTRIES.find((c) => c.code === country)?.placeholder}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError.error && validatePhone(country, e.target.value).ok) setPhoneError({});
            }}
            onBlur={() => recheck(country, phone)}
            required
            autoComplete="tel"
            inputMode="tel"
            autoFocus
          />
        </div>
        <p className="jp-field-note">Used for account verification only.</p>
      </div>

      <button type="submit" className="jp-btn jp-btn--primary jp-btn--block" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="jp-spinner" size={18} aria-hidden />
            <span>Saving…</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <ArrowRight size={18} aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
