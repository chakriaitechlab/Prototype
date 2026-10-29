'use client';

import { Loader2, Sparkles } from 'lucide-react';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const TIERS = [
  { min: 80, className: 'border-[rgba(5,150,105,0.25)] bg-[rgba(5,150,105,0.08)] text-[#047857]', icon: '#059669' },
  { min: 65, className: 'border-[rgba(10,101,204,0.25)] bg-[rgba(10,101,204,0.08)] text-[#0a65cc]', icon: '#0a65cc' },
  { min: 50, className: 'border-[rgba(217,119,6,0.25)] bg-[rgba(217,119,6,0.08)] text-[#b45309]', icon: '#d97706' },
  { min: 0, className: 'border-[rgba(225,29,72,0.25)] bg-[rgba(225,29,72,0.08)] text-[#be123c]', icon: '#e11d48' },
];

const PENDING_TIER = {
  className: 'border-[rgba(107,114,128,0.25)] bg-[rgba(107,114,128,0.08)] text-[#4b5563]',
  icon: '#6b7280',
};

const SIZES: Record<Size, { className: string; icon: number }> = {
  xs: { className: 'h-[22px] gap-1 rounded-2xl px-2 text-[11px]', icon: 11 },
  sm: { className: 'h-[25px] gap-[5px] rounded-[20px] px-2.5 text-xs', icon: 12 },
  md: { className: 'h-7 gap-1.5 rounded-[20px] px-3 text-[13px]', icon: 14 },
  lg: { className: 'h-8 gap-1.5 rounded-3xl px-3.5 text-sm', icon: 15 },
};

type MatchScoreBadgeProps = {
  score: number;
  pending?: boolean;
  size?: Size;
  onClick?: () => void;
};

export function MatchScoreBadge({ score, pending = false, size = 'sm', onClick }: MatchScoreBadgeProps) {
  const clamped = Math.min(Math.max(Math.round(score), 0), 100);
  const tier = pending ? PENDING_TIER : (TIERS.find((t) => clamped >= t.min) ?? TIERS[TIERS.length - 1]);
  const { className: sizeClass, icon } = SIZES[size];
  const Icon = pending ? Loader2 : Sparkles;
  const className = `jp-match-badge inline-flex items-center justify-center whitespace-nowrap border font-[650] leading-none tracking-[-0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.03)] select-none ${sizeClass} ${tier.className}`;
  const content = (
    <>
      <Icon size={icon} strokeWidth={2.4} className={pending ? 'animate-spin' : undefined} style={{ color: tier.icon }} aria-hidden />
      <span>{pending ? 'Matching…' : `${clamped}% Match`}</span>
    </>
  );

  if (!onClick) {
    return (
      <span className={className} title={pending ? 'Calculating match…' : `AI Match ${clamped}%`}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`${className} is-clickable cursor-pointer`}
      onClick={onClick}
      aria-label={pending ? 'AI Match score: calculating' : `AI Match score: ${clamped}%`}
      title="Click to view AI Match explanation"
    >
      {content}
    </button>
  );
}
