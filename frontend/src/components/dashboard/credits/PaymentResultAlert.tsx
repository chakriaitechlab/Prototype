'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormAlert } from '@/components/ui/FormAlert';
import { isPaymentResult, PAYMENT_RESULT_ALERTS } from '@/utils/diamonds';

export function PaymentResultAlert() {
  const router = useRouter();
  const pathname = usePathname();
  const result = useSearchParams().get('payment');
  const [alert] = useState(() => (isPaymentResult(result) ? PAYMENT_RESULT_ALERTS[result] : null));

  useEffect(() => {
    if (result) router.replace(pathname, { scroll: false });
  }, [result, pathname, router]);

  return alert ? <FormAlert message={alert.message} type={alert.type} /> : null;
}
