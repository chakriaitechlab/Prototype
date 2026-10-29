import { ChatSkeleton } from './chat/ChatSkeleton';

export function MessengerSkeleton() {
  return (
    <div className="messenger-page flex h-full min-h-0 w-full overflow-hidden bg-white">
      <div className="flex w-full flex-col border-r border-[#e4e5e8] md:w-[340px] lg:w-[360px] md:shrink-0 animate-pulse" aria-busy="true" aria-label="Loading chats">
        <div className="space-y-3 px-4 pb-3 pt-4">
          <span className="block h-6 w-20 rounded bg-[#eceef1]" />
          <span className="block h-10 rounded-full bg-[#f1f2f4]" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-2.5">
            <span className="h-12 w-12 shrink-0 rounded-full bg-[#eceef1]" />
            <span className="flex-1 space-y-1.5">
              <span className="block h-3.5 w-1/2 rounded bg-[#eceef1]" />
              <span className="block h-3 w-3/4 rounded bg-[#f1f2f4]" />
            </span>
          </div>
        ))}
      </div>
      <div className="hidden min-w-0 flex-1 md:flex">
        <ChatSkeleton />
      </div>
    </div>
  );
}
