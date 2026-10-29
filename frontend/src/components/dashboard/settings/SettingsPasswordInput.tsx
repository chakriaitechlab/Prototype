'use client';

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type SettingsPasswordInputProps = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  id: string;
  label: string;
  invalid?: boolean;
};

export function SettingsPasswordInput({ id, label, invalid, ...inputProps }: SettingsPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="cset-label" htmlFor={id}>
        {label}
      </label>
      <div className="cset-input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={invalid}
          className={`cset-input cset-input--with-trailing ${invalid ? 'border-red-500 focus:border-red-500' : ''}`}
          {...inputProps}
        />
        <button
          type="button"
          className="cset-input-trailing"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
