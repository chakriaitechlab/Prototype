import { Gem } from 'lucide-react';
import type { DiamondWallet } from '@/types/diamonds';
import { formatCount, formatDate } from '@/utils/format';

export function DiamondBalance({ wallet }: { wallet: DiamondWallet }) {
  const { balance, monthlyDiamonds, planName, planExpiresAt, refillAt } = wallet;
  const percent = monthlyDiamonds > 0 ? Math.min(100, Math.round((balance / monthlyDiamonds) * 100)) : 0;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Diamonds left</div>
        <div className="mt-2 flex items-baseline gap-2">
          <Gem size={22} className="self-center text-[#0a65cc]" aria-hidden />
          <span className="text-3xl font-bold text-slate-900">{formatCount(balance)}</span>
          <span className="text-sm text-slate-500">of {formatCount(monthlyDiamonds)} this month</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#0a65cc]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current plan</div>
        <div className="mt-2 text-2xl font-bold text-slate-900">{planName}</div>
        <p className="mt-2 text-sm text-slate-500">
          {planExpiresAt ? `Active until ${formatDate(planExpiresAt)}` : 'Free forever'}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Next refill</div>
        <div className="mt-2 text-2xl font-bold text-slate-900">{formatDate(refillAt)}</div>
        <p className="mt-2 text-sm text-slate-500">Balance resets to your plan’s monthly diamonds</p>
      </div>
    </section>
  );
}
