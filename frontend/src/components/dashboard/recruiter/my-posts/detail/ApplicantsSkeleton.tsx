const SKELETON_ROWS = 6;
const STAT_CARDS = 4;

export function ApplicantsSkeleton() {
  return (
    <div className="animate-pulse pt-2 sm:pt-3" aria-hidden>
      <div className="mb-3 h-4 w-28 bg-[#f1f2f4]" />
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="h-8 w-64 max-w-full bg-[#eceef1]" />
          <div className="mt-2 h-4 w-80 max-w-full bg-[#f1f2f4]" />
        </div>
        <div className="h-11 w-40 border border-[#e4e5e8] bg-white" />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: STAT_CARDS }, (_, i) => (
          <div key={i} className="flex items-center gap-3.5 border border-[#e4e5e8] bg-white px-4 py-4">
            <div className="h-11 w-11 bg-[#f1f2f4]" />
            <div>
              <div className="h-5 w-10 bg-[#eceef1]" />
              <div className="mt-2 h-3 w-24 bg-[#f1f2f4]" />
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:justify-between">
        <div className="h-11 w-full border border-[#e4e5e8] bg-white lg:w-[440px]" />
        <div className="h-11 w-full border border-[#e4e5e8] bg-white lg:w-72" />
      </div>
      <div className="border border-[#e4e5e8] bg-white">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-[#f1f2f4] px-5 py-4 last:border-b-0">
            <div className="flex flex-1 items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#f1f2f4]" />
              <div>
                <div className="h-4 w-40 max-w-full bg-[#eceef1]" />
                <div className="mt-2 h-3 w-32 bg-[#f1f2f4]" />
              </div>
            </div>
            <div className="hidden h-4 w-24 bg-[#f1f2f4] sm:block" />
            <div className="hidden h-4 w-20 bg-[#f1f2f4] md:block" />
            <div className="h-[42px] w-64 rounded-lg bg-[#f1f2f4]" />
          </div>
        ))}
      </div>
    </div>
  );
}
