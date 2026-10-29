export function DashboardNotFound() {
  return (
    <div className="relative flex h-full min-h-[calc(100vh-120px)] w-full flex-1 items-center justify-center overflow-hidden select-none px-4 py-8">
      {/* Background Atmosphere matching Chakri.ai theme */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[260px] w-[340px] rounded-full bg-sky-400/10 blur-[90px]" />
      </div>

      {/* Only 404 across the full UI */}
      <h1 className="text-[26vw] sm:text-[240px] md:text-[300px] lg:text-[360px] font-black tracking-tighter text-slate-300 leading-none select-none drop-shadow-xs">
        404
      </h1>
    </div>
  );
}
