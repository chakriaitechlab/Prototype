const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

export function CompletionRing({ percent }: { percent: number }) {
  const value = Math.min(100, Math.max(0, percent));
  const tone = value >= 100 ? 'text-emerald-600' : 'text-[#0a65cc]';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0 w-9 h-9"
      title={`${value}% Complete`}
      aria-label={`${value}% Profile Completion`}
    >
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
        <path className="text-slate-200" strokeWidth="3.2" stroke="currentColor" fill="none" d={RING_PATH} />
        <path
          className={`${tone} transition-all duration-700 ease-out`}
          strokeDasharray={`${value}, 100`}
          strokeWidth="3.2"
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d={RING_PATH}
        />
      </svg>
      <span className={`absolute text-[11px] font-bold ${tone}`}>{value}%</span>
    </div>
  );
}
