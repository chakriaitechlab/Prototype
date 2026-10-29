const SKELETON_CARDS = 10;

export function CandidatesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border border-[#e4e5e8] bg-white p-4 shadow-xs">
        <div className="h-11 w-full border border-[#e4e5e8] bg-[#f8f9fa]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: SKELETON_CARDS }, (_, idx) => (
          <div
            key={idx}
            className="flex animate-pulse flex-col items-center border border-[#e4e5e8] bg-white px-4 pb-4 pt-5 text-center"
          >
            <div className="mb-2.5 h-16 w-16 rounded-full bg-[#e4e5e8]" />
            <div className="mb-2 h-4 w-3/4 bg-[#e4e5e8]" />
            <div className="mb-3 h-3 w-1/2 bg-[#f1f2f4]" />
            <div className="h-3 w-2/3 bg-[#f1f2f4]" />
          </div>
        ))}
      </div>
    </div>
  );
}
