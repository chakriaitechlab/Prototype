import type { DiamondAction, DiamondPlanId, PlanAudience } from '@/types/diamonds';
import type { PaymentResult, PaymentStatus } from '@/types/payments';

export const PLAN_TAGLINES: Record<PlanAudience, Record<DiamondPlanId, string>> = {
  seeker: {
    free: 'Try every AI tool, no card needed',
    pro: 'For an active job search',
    premium: 'Maximum AI power and support',
  },
  recruiter: {
    free: 'For trying out hiring with AI',
    pro: 'For small teams hiring every month',
    premium: 'For agencies and high-volume hiring',
  },
};

export const PLAN_PERKS: Record<PlanAudience, Record<DiamondPlanId, string[]>> = {
  seeker: {
    free: ['All AI tools unlocked', 'Learning chat and Chakri AI', 'Standard queue'],
    pro: ['Flagship AI models', 'Unlimited learning chat history', 'Priority queue'],
    premium: ['Everything in Pro', '1-on-1 CV review with a mentor', 'Dedicated support'],
  },
  recruiter: {
    free: ['All AI tools unlocked', 'Job posts and AI interviews', 'Standard queue'],
    pro: ['Unlimited applicant review', 'AI interview invites', 'Priority queue'],
    premium: ['Everything in Pro', 'Team seats', 'Dedicated account manager'],
  },
};

export const PRICING_FAQ = [
  {
    q: 'What are diamonds?',
    a: 'Diamonds are the credits that power AI actions on Chakri.ai. Every account gets free diamonds each month, and paid plans give you more.',
  },
  {
    q: 'Do unused diamonds carry over?',
    a: 'No. On each refill date your balance resets to your plan’s monthly amount.',
  },
  {
    q: 'How do I pay?',
    a: 'Through SSLCommerz: bKash, Nagad, Rocket, Visa, Mastercard and internet banking. Prices are in Bangladeshi Taka.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Plans are paid month by month. If you don’t renew, you move back to the free plan on your next refill.',
  },
];

export const ACTIVITY_LABELS: Record<DiamondAction, string> = {
  SIGNUP_BONUS: 'Welcome diamonds',
  MONTHLY_REFILL: 'Monthly refill',
  PLAN_PURCHASE: 'Plan purchase',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_RESULT_ALERTS: Record<PaymentResult, { message: string; type: 'success' | 'error' }> = {
  success: { message: 'Payment received. Your plan is active and the diamonds are in your account.', type: 'success' },
  failed: { message: 'The payment did not go through. No money was taken. Please try again.', type: 'error' },
  cancelled: { message: 'Payment cancelled. Your plan was not changed.', type: 'error' },
};

export function isPaymentResult(value: string | null): value is PaymentResult {
  return value === 'success' || value === 'failed' || value === 'cancelled';
}

export function formatTaka(value: number) {
  return `৳${value.toLocaleString('en-US')}`;
}
