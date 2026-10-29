const BUBBLES = ['w-40', 'ml-auto w-56', 'w-64', 'ml-auto w-32', 'w-48'];

export function ChatSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-pulse" aria-busy="true" aria-label="Loading chat">
      <div className="flex h-[64px] shrink-0 items-center gap-3 border-b border-[#e4e5e8] px-4">
        <span className="h-10 w-10 rounded-full bg-[#eceef1]" />
        <span className="space-y-1.5">
          <span className="block h-3.5 w-32 rounded bg-[#eceef1]" />
          <span className="block h-3 w-20 rounded bg-[#f1f2f4]" />
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden px-5 py-6">
        {BUBBLES.map((width, index) => (
          <span key={index} className={`block h-9 rounded-[18px] bg-[#f1f2f4] ${width}`} />
        ))}
      </div>
      <div className="h-[61px] shrink-0 border-t border-[#e4e5e8]" />
    </div>
  );
}
