import { MessageCircle } from 'lucide-react';

export function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#f8f9fb] px-6 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f0fa] text-[#0a65cc]">
        <MessageCircle size={30} aria-hidden />
      </span>
      <h2 className="text-lg font-bold text-[#18191c]">Your messages</h2>
      <p className="mt-1 max-w-xs text-sm text-[#5e6670]">Pick a chat from the list or search someone by username to start a conversation.</p>
    </div>
  );
}
