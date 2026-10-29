'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { checkoutAction } from '@/actions/payments.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { PaidPlanId } from '@/types/payments';

interface CheckoutButtonProps {
  planId: PaidPlanId;
  label: string;
  primary?: boolean;
}

export function CheckoutButton({ planId, label, primary = false }: CheckoutButtonProps) {
  const [alert, setAlert] = useState<{ error?: string; trigger: number }>({ trigger: 0 });
  const [pending, startTransition] = useTransition();

  const checkout = () =>
    startTransition(async () => {
      const result = await checkoutAction(planId);
      if ('error' in result) {
        setAlert({ error: result.error, trigger: Date.now() });
        return;
      }
      window.location.assign(result.gatewayUrl);
    });

  return (
    <>
      <FormAlert message={alert.error} trigger={alert.trigger} />
      <button
        type="button"
        onClick={checkout}
        disabled={pending}
        className={`jp-btn ${primary ? 'jp-btn--primary' : 'jp-btn--soft'} jp-btn--block justify-center disabled:opacity-70`}
      >
        {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : null}
        {pending ? 'Opening payment…' : label}
        {pending ? null : <ArrowRight size={16} aria-hidden />}
      </button>
    </>
  );
}
