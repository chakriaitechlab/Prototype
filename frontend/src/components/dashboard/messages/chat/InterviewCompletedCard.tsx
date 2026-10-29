import Link from 'next/link';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import type { ChatMessage } from '@/types/messages';
import { messageTime } from '@/utils/messages';
import { interviewReportPath } from '@/utils/routes';

export function InterviewCompletedCard({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const { jobTitle, company, interviewId } = message.metadata;

  return (
    <div className="w-full max-w-[440px] overflow-hidden border border-[#e4e5e8] bg-white shadow-2xs">
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center bg-[#eaf6ec] text-[#28a745]">
          <ClipboardCheck size={19} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight text-[#18191c]">{mine ? 'You completed the AI interview' : 'AI interview completed'}</p>
          <p className="mt-0.5 truncate text-[12.5px] text-[#767f8c]">
            {jobTitle} · {company}
          </p>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-words px-4 pt-3 text-[14px] leading-[1.5] text-[#18191c]">{message.body}</p>

      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[#e4e5e8] px-4 py-3">
        <span className="text-[10.5px] text-[#767f8c]" suppressHydrationWarning>
          {messageTime(message.createdAt)}
        </span>
        {interviewId && (
          <Link
            href={interviewReportPath(interviewId)}
            className="inline-flex h-9 items-center gap-1.5 bg-[#0a65cc] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#084f9e]"
          >
            View report
            <ArrowRight size={15} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
