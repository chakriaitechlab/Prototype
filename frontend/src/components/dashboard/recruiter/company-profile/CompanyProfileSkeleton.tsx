export function CompanyProfileSkeleton() {
  return (
    <div className="w-full animate-pulse pb-16">
      <div className="mb-6 border-b border-[#e4e5e8] pb-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded bg-slate-200" />
            <div className="h-3 w-80 rounded bg-slate-100" />
          </div>
          <div className="h-10 w-36 rounded bg-slate-200" />
        </div>
        <div className="flex gap-8">
          {Array.from({ length: 4 }, (_, idx) => (
            <div key={idx} className="h-5 w-28 rounded bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="mb-8 overflow-hidden rounded-2xl border border-[#e4e5e8] bg-white">
        <div className="h-48 bg-slate-100 sm:h-64 md:h-72" />
        <div className="-mt-16 flex flex-col items-center px-4 pb-6 sm:-mt-20">
          <div className="h-[132px] w-[132px] rounded-full bg-slate-200 ring-4 ring-white" />
          <div className="mt-4 h-7 w-56 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-72 rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-40 rounded border border-[#e4e5e8] bg-white" />
    </div>
  );
}
