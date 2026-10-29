'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateTwoFactorAction } from '@/actions/settings.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { TwoFactorState } from '@/types/settings';
import { ToggleCard, ToggleSwitch } from './ToggleCard';

export function TwoFactorToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [state, setState] = useState<TwoFactorState>({});
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      const result = await updateTwoFactorAction(!enabled);
      setState(result);
      if (result.twoFactorEnabled !== undefined) setEnabled(result.twoFactorEnabled);
    });

  return (
    <section className="cset-section cset-section--ruled">
      <FormAlert message={state.error ?? state.message} type={state.error ? 'error' : 'success'} trigger={state} />

      <h3 className="cset-section-title">Two-Factor Authentication (2FA)</h3>
      <ToggleCard
        title="Extra Sign-in Protection"
        note={enabled ? 'Two-factor authentication is active.' : 'Require an extra verification code when logging in.'}
        className="max-w-xl"
      >
        {pending ? (
          <Loader2 size={20} className="animate-spin text-blue-600" />
        ) : (
          <ToggleSwitch checked={enabled} onToggle={toggle} />
        )}
      </ToggleCard>
    </section>
  );
}
