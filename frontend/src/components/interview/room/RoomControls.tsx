import { Mic, PhoneOff } from 'lucide-react';

export function RoomControls({ leaving, onLeave }: { leaving: boolean; onLeave: () => void }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <span className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/15 bg-slate-800/85 text-slate-200" title="Microphone on">
        <Mic size={20} aria-label="Microphone on" />
      </span>
      <button
        type="button"
        onClick={onLeave}
        disabled={leaving}
        aria-label="Leave interview"
        title="Leave interview"
        className="flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full border border-red-600 bg-red-700 text-white transition hover:bg-red-800 disabled:opacity-60"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}
