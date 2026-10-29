import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type JobApplyCvOptionProps = {
  selected: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onSelect: () => void;
  children?: ReactNode;
};

export function JobApplyCvOption({ selected, disabled, icon: Icon, title, description, onSelect, children }: JobApplyCvOptionProps) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onSelect}
      onKeyDown={(event) => {
        if (disabled || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onSelect();
      }}
      className={`flex w-full items-start gap-3 rounded-none p-3.5 text-left transition ${
        disabled
          ? 'cursor-not-allowed border border-slate-200 bg-slate-50 opacity-60'
          : selected
            ? 'cursor-pointer border-2 border-[#0a65cc] bg-blue-50/40 shadow-xs'
            : 'cursor-pointer border border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100/50'
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-none transition-colors ${
          selected ? 'border border-[#0a65cc] bg-[#0a65cc] text-white' : 'border border-slate-400 bg-white'
        }`}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-none bg-white" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold ${selected ? 'text-[#0a65cc]' : 'text-slate-900'}`}>
          <Icon size={14} aria-hidden />
          <span>{title}</span>
        </div>
        <p className="m-0 mb-2 text-xs leading-normal text-slate-500">{description}</p>
        {children}
      </div>
    </div>
  );
}
