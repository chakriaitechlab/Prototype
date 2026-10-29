const SKELETON_ROWS = 6;

export function MyPostsSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="mb-5 flex flex-col gap-4 pt-2 sm:pt-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="h-8 w-48 bg-[#eceef1]" />
          <div className="mt-2 h-4 w-80 max-w-full bg-[#f1f2f4]" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-11 border border-[#e4e5e8] bg-white sm:w-72" />
          <div className="h-11 border border-[#e4e5e8] bg-white sm:w-48" />
        </div>
      </div>
      <div className="cdash-table-wrap">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-[#f1f2f4] px-5 py-4">
            <div className="flex-1">
              <div className="h-4 w-56 max-w-full bg-[#eceef1]" />
              <div className="mt-2 h-3 w-36 bg-[#f1f2f4]" />
            </div>
            <div className="hidden h-4 w-20 bg-[#f1f2f4] sm:block" />
            <div className="hidden h-4 w-28 bg-[#f1f2f4] md:block" />
            <div className="h-9 w-40 bg-[#f1f2f4]" />
          </div>
        ))}
      </div>
    </div>
  );
}
