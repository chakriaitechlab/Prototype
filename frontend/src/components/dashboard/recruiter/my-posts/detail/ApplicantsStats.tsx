import type { LucideIcon } from 'lucide-react';
import { Clock3, Send, Users, XCircle } from 'lucide-react';
import type { HireApplicantsResponse } from '@/types/hire';
import { formatCount } from '@/utils/format';

const STATS: { key: keyof HireApplicantsResponse['counts']; label: string; icon: LucideIcon; tone: string }[] = [
  { key: 'all', label: 'Total applications', icon: Users, tone: 'bg-[#e7f0fa] text-[#0a65cc]' },
  { key: 'review', label: 'To review', icon: Clock3, tone: 'bg-[#fff7e6] text-[#d97706]' },
  { key: 'invited', label: 'Invited', icon: Send, tone: 'bg-[#eaf6ec] text-[#28a745]' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'bg-[#fdf2f2] text-[#e05151]' },
];

export function ApplicantsStats({ counts }: { counts: HireApplicantsResponse['counts'] }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {STATS.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className="flex items-center gap-3.5 border border-[#e4e5e8] bg-white px-4 py-4">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center ${tone}`}>
            <Icon size={20} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[22px] font-semibold leading-tight text-[#18191c]">{formatCount(counts[key])}</p>
            <p className="truncate text-[13px] text-[#767f8c]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
