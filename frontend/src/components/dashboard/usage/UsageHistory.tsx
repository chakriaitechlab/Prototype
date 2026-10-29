import { Gem } from 'lucide-react';
import type { DiamondActivity } from '@/types/diamonds';
import { ACTIVITY_LABELS } from '@/utils/diamonds';
import { formatCount, formatDateTime } from '@/utils/format';

export function UsageHistory({ activity }: { activity: DiamondActivity[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Diamond activity</h2>
      <p className="mt-1 mb-4 text-sm text-slate-500">Every time diamonds were added to your account.</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {activity.length > 0 ? (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Diamonds</th>
                <th className="px-4 py-3">Balance after</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {activity.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3.5">{ACTIVITY_LABELS[item.action]}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-600">+{formatCount(item.amount)}</td>
                  <td className="px-4 py-3.5">{formatCount(item.balanceAfter)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center">
            <Gem size={32} className="mx-auto mb-2 text-slate-300" aria-hidden />
            <p className="text-sm font-semibold text-slate-700">No diamond activity yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
