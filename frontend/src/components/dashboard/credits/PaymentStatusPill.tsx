import type { PaymentStatus } from '@/types/payments';
import { PAYMENT_STATUS_LABELS } from '@/utils/diamonds';

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CLASSES[status]}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
