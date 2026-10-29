export function ApplicationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting Skeleton */}
      <div className="space-y-2 mb-6">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-72 bg-slate-100 rounded" />
      </div>

      {/* Metrics Skeleton */}
      <div className="cdash-metrics">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="cdash-metric flex items-center justify-between p-5 bg-white border border-[#e4e5e8] rounded-lg">
            <div className="space-y-2">
              <div className="h-7 w-12 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="cdash-filter-bar flex gap-3">
        <div className="flex-1 h-12 bg-white border border-[#e4e5e8] rounded-md" />
        <div className="w-44 h-12 bg-white border border-[#e4e5e8] rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="cdash-table-wrap bg-white border border-[#e4e5e8] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-6 w-20 bg-slate-100 rounded-full" />
            <div className="h-6 w-24 bg-slate-100 rounded-full" />
            <div className="h-8 w-24 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
