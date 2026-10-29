export function SavedJobsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-white border border-[#e4e5e8] rounded-lg p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-56 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-10 w-36 bg-slate-100 rounded-lg" />
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="h-12 bg-white border border-slate-200 rounded-lg" />

      {/* Job Cards Skeleton */}
      <div className="jp-find-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="jp-fcard p-6 space-y-4">
            <div className="h-5 w-3/4 bg-slate-200 rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-24 bg-slate-100 rounded" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100" />
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
