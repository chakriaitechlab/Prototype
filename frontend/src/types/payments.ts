import type { DiamondPlanId } from './diamonds';

export type PaidPlanId = Exclude<DiamondPlanId, 'free'>;

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type PaymentResult = 'success' | 'failed' | 'cancelled';

export interface PaymentRecord {
  id: string;
  tranId: string;
  planId: PaidPlanId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentHistory {
  payments: PaymentRecord[];
}

export interface CheckoutSession {
  gatewayUrl: string;
}
