import 'server-only';
import { cache } from 'react';
import { apiFetch } from './client';
import type { CheckoutSession, PaidPlanId, PaymentHistory } from '@/types/payments';

export const paymentsApi = {
  checkout: (planId: PaidPlanId): Promise<CheckoutSession> =>
    apiFetch('/api/payments/checkout', { method: 'POST', body: { planId } }),

  history: cache((): Promise<PaymentHistory> => apiFetch('/api/payments/history')),
};
