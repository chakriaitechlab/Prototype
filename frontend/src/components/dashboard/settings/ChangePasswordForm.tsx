'use client';

import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { changePasswordAction } from '@/actions/auth.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';
import { SettingsPasswordInput } from './SettingsPasswordInput';

const MIN_PASSWORD_LENGTH = 8;

type InvalidField = 'next' | 'confirm' | null;

function validate(newPassword: string, confirmPassword: string): { field: InvalidField; error?: string } {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { field: 'next', error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (newPassword !== confirmPassword) return { field: 'confirm', error: 'Passwords do not match' };
  return { field: null };
}

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [invalidField, setInvalidField] = useState<InvalidField>(null);
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  const mismatch = Boolean(confirmPassword) && newPassword !== confirmPassword;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { field, error } = validate(newPassword, confirmPassword);
    setInvalidField(field);
    if (error) {
      setState({ error });
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(newPassword);
      setState(result);
      if (!result.error) {
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  };

  return (
    <section className="cset-section cset-section--ruled">
      <FormAlert message={state.error ?? state.message} type={state.error ? 'error' : 'success'} trigger={state} />

      <h3 className="cset-section-title">Change Password</h3>
      <p className="text-sm text-gray-500 mb-4">Ensure your account stays secure with a unique and strong password.</p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsPasswordInput
            id="new-password"
            label="New Password"
            placeholder="Enter new password"
            autoComplete="new-password"
            value={newPassword}
            invalid={invalidField === 'next'}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setInvalidField(null);
            }}
          />
          <SettingsPasswordInput
            id="confirm-password"
            label="Confirm Password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            invalid={invalidField === 'confirm' || mismatch}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setInvalidField(null);
            }}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="cset-btn-primary"
            disabled={!newPassword || !confirmPassword || pending}
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </section>
  );
}
