const SKELETON_CARDS = 6;

export function FavoritesSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 flex items-center gap-3 border border-[#e4e5e8] bg-white p-4">
        <div className="h-11 w-11 shrink-0 bg-slate-100" />
        <div className="space-y-2">
          <div className="h-5 w-44 bg-slate-200" />
          <div className="h-3.5 w-72 bg-slate-100" />
        </div>
      </div>
      <div className="mb-5 h-[58px] border border-[#e4e5e8] bg-white" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_CARDS }, (_, idx) => (
          <div key={idx} className="space-y-3 border border-[#e4e5e8] bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200" />
                <div className="h-3 w-1/2 bg-slate-100" />
              </div>
            </div>
            <div className="h-8 border-t border-[#f1f2f4] bg-slate-50" />
          </div>
        ))}
      </div>
    </div>
  );
}
