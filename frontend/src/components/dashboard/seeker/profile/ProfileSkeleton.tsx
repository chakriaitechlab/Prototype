export function ProfileSkeleton() {
  return (
    <div className="w-full pb-16 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-slate-200 rounded" />
          <div className="h-4 w-80 bg-slate-100 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-slate-100 rounded" />
          <div className="h-10 w-36 bg-slate-200 rounded" />
        </div>
      </div>

      <div className="flex gap-8 pb-4 mb-6 border-b border-[#e4e5e8] overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-5 w-20 shrink-0 bg-slate-100 rounded" />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 pb-7 border-b border-[#e4e5e8]">
        <div className="h-[104px] w-[104px] rounded-full bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
          <div className="h-4 w-40 bg-slate-100 rounded" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 pt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-12 bg-white border border-[#e4e5e8] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
