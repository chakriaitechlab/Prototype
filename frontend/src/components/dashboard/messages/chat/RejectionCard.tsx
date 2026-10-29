import Link from 'next/link';
import { ArrowRight, XCircle } from 'lucide-react';
import type { ChatMessage } from '@/types/messages';
import { messageTime } from '@/utils/messages';

const SEEKER_JOBS_PATH = '/dashboard/seeker/jobs';

export function RejectionCard({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const { jobTitle, company, note } = message.metadata;

  return (
    <div className="w-full max-w-[440px] overflow-hidden border border-[#e4e5e8] bg-white shadow-2xs">
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center bg-[#fdf2f2] text-[#e05151]">
          <XCircle size={19} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight text-[#18191c]">
            {mine ? 'Application rejected' : 'Application not selected'}
          </p>
          <p className="mt-0.5 truncate text-[12.5px] text-[#767f8c]">
            {jobTitle} · {company}
          </p>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-words px-4 pt-3 text-[14px] leading-[1.5] text-[#18191c]">{note || message.body}</p>

      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[#e4e5e8] px-4 py-3">
        <span className="text-[10.5px] text-[#767f8c]" suppressHydrationWarning>
          {messageTime(message.createdAt)}
        </span>
        {!mine && (
          <Link
            href={SEEKER_JOBS_PATH}
            className="inline-flex h-9 items-center gap-1.5 border border-[#e4e5e8] bg-white px-4 text-[13px] font-semibold text-[#18191c] transition-colors hover:bg-[#f8fafc]"
          >
            Browse jobs
            <ArrowRight size={15} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
