import type { ReactNode } from 'react';
import { Check, Gem } from 'lucide-react';
import type { DiamondPlan } from '@/types/diamonds';
import { formatCount } from '@/utils/format';
import { formatTaka } from '@/utils/diamonds';

interface PlanCardProps {
  plan: DiamondPlan;
  tagline: string;
  perks: string[];
  isCurrent?: boolean;
  action: ReactNode;
}

export function PlanCard({ plan, tagline, perks, isCurrent = false, action }: PlanCardProps) {
  return (
    <article className={`jp-price-card${plan.popular ? ' is-popular' : ''}${isCurrent ? ' bg-[#f7fbff]' : ''}`}>
      {isCurrent ? (
        <span className="jp-price-flag bg-slate-800!">Current plan</span>
      ) : plan.popular ? (
        <span className="jp-price-flag">Most popular</span>
      ) : null}

      <div>
        <h3>{plan.name}</h3>
        <p className="jp-price-tagline">{tagline}</p>
      </div>

      <div className="jp-price-amount">
        <strong>{formatTaka(plan.price)}</strong>
        <span>/month</span>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-[#e7f0fa] px-4 py-3.5">
        <Gem size={22} className="shrink-0 text-[#0a65cc]" aria-hidden />
        <div>
          <div className="text-[26px] font-bold leading-none text-[#0a65cc]">{formatCount(plan.diamonds)}</div>
          <div className="mt-1 text-[13px] text-[#5e6670]">diamonds every month</div>
        </div>
      </div>

      <ul className="jp-price-perks">
        {perks.map((perk) => (
          <li key={perk}>
            <Check size={16} strokeWidth={3} />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      {action}
    </article>
  );
}
