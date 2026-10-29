import { Receipt } from 'lucide-react';
import type { DiamondPlan } from '@/types/diamonds';
import type { PaymentRecord } from '@/types/payments';
import { formatTaka } from '@/utils/diamonds';
import { formatDateTime } from '@/utils/format';
import { PaymentStatusPill } from './PaymentStatusPill';

interface PaymentHistoryProps {
  payments: PaymentRecord[];
  plans: DiamondPlan[];
}

export function PaymentHistory({ payments, plans }: PaymentHistoryProps) {
  const planName = (planId: string) => plans.find((plan) => plan.id === planId)?.name ?? planId;

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">Every plan payment you started, with its status.</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {payments.length > 0 ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3.5 font-mono text-[13px]">{payment.tranId}</td>
                  <td className="px-4 py-3.5">{planName(payment.planId)}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{formatTaka(payment.amount)}</td>
                  <td className="px-4 py-3.5">{payment.method ?? '—'}</td>
                  <td className="px-4 py-3.5"><PaymentStatusPill status={payment.status} /></td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{formatDateTime(payment.paidAt ?? payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center">
            <Receipt size={32} className="mx-auto mb-2 text-slate-300" aria-hidden />
            <p className="text-sm font-semibold text-slate-700">No payments yet</p>
            <p className="mt-1 text-xs text-slate-400">When you buy a plan, the receipt shows up here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
