import { Award, Calendar, Coins, MapPin, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GovtJobContent } from '@/utils/govt-job-detail';

type Stat = { label: string; value: string; icon: LucideIcon; tone: string; valueClass?: string };

export function GovtJobStats({ stats, isExpired }: { stats: GovtJobContent['stats']; isExpired: boolean }) {
  const items: Stat[] = [
    { label: 'গ্রেড', value: stats.grade, icon: Award, tone: 'bg-[#eff6ff] text-[#2563eb]' },
    { label: 'বেতন স্কেল', value: stats.salary, icon: Coins, tone: 'bg-[#ecfdf5] text-[#059669]' },
    { label: 'পদ সংখ্যা', value: stats.vacancy, icon: Users, tone: 'bg-[#fef3c7] text-[#d97706]' },
    {
      label: 'আবেদনের শেষ তারিখ',
      value: stats.deadline,
      icon: Calendar,
      tone: isExpired ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#f0fdf4] text-[#16a34a]',
      valueClass: isExpired ? 'text-[#dc2626]' : undefined,
    },
    { label: 'কর্মস্থল', value: stats.workplace, icon: MapPin, tone: 'bg-[#f3e8ff] text-[#7e22ce]' },
  ];

  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 border-t border-[#f1f5f9] pt-5">
      {items.map(({ label, value, icon: Icon, tone, valueClass }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3.5">
          <div className={`grid size-9 shrink-0 place-items-center rounded-[10px] ${tone}`}>
            <Icon size={20} />
          </div>
          <div>
            <span className="block text-xs text-[#64748b]">{label}</span>
            <strong className={`text-[0.9rem] ${valueClass ?? 'text-[#0f172a]'}`}>{value}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
