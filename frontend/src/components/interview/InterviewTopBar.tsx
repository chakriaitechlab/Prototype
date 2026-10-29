import { LogOut } from 'lucide-react';

interface InterviewTopBarProps {
  context: string;
  onLeave?: () => void;
}

export function InterviewTopBar({ context, onLeave }: InterviewTopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-[#e4e5e8] bg-white px-4 sm:px-6">
      <span className="text-xl font-bold tracking-tight text-[#0a65cc]">
        ch<span className="text-[#18191c]">akri</span>.ai
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden truncate border border-[#b9d3f0] bg-[#e7f0fa] px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wide text-[#0a65cc] sm:inline">
          {context}
        </span>
        {onLeave && (
          <button type="button" onClick={onLeave} className="jp-btn jp-btn--outline h-[38px]! px-3.5! text-sm!">
            <LogOut size={16} aria-hidden />
            Leave
          </button>
        )}
      </div>
    </header>
  );
}
