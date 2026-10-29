export function UsageSkeleton() {
  return (
    <div className="cdash-content max-w-6xl mx-auto space-y-10 pb-16 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>

      <div className="h-64 rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
