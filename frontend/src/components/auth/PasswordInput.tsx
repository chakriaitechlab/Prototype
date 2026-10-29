'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  id: string;
  label: string;
};

export function PasswordInput({ id, label, disabled, ...inputProps }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="jp-field">
      <label htmlFor={id}>{label}</label>
      <div className="jp-input-wrap">
        <input id={id} type={visible ? 'text' : 'password'} required disabled={disabled} {...inputProps} />
        <button
          type="button"
          className="jp-input-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          disabled={disabled}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
