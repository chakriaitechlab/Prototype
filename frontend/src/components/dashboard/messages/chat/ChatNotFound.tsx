import Link from 'next/link';
import { UserX } from 'lucide-react';

export function ChatNotFound({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f2f4] text-[#767f8c]">
        <UserX size={28} aria-hidden />
      </span>
      <h2 className="text-lg font-bold text-[#18191c]">This account isn&apos;t available</h2>
      <p className="mt-1 max-w-xs text-sm text-[#5e6670]">The user may not exist or can&apos;t receive messages right now.</p>
      <Link href={backHref} className="mt-4 text-sm font-semibold text-[#0a65cc] hover:underline">
        Back to chats
      </Link>
    </div>
  );
}
