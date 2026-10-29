'use server';

import { errorMessage } from '@/lib/client';
import { paymentsApi } from '@/lib/payments';
import type { PaidPlanId } from '@/types/payments';
import { getCurrentUser } from '@/utils/session';

const PAID_PLAN_IDS: readonly PaidPlanId[] = ['pro', 'premium'];

type CheckoutActionResult = { gatewayUrl: string } | { error: string };

export async function checkoutAction(planId: PaidPlanId): Promise<CheckoutActionResult> {
  const user = await getCurrentUser().catch(() => null);
  if (!user?.role) return { error: 'Please sign in to buy a plan.' };
  if (!PAID_PLAN_IDS.includes(planId)) return { error: 'Choose a valid plan.' };

  try {
    return await paymentsApi.checkout(planId);
  } catch (err) {
    return { error: errorMessage(err, 'Could not start the payment. Please try again.') };
  }
}
