'use client';

import Link from 'next/link';
import { ArrowRight, Clock3, Video } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { ChatMessage } from '@/types/messages';
import { formatDateTime } from '@/utils/format';
import { messageTime } from '@/utils/messages';
import { interviewLobbyPath, SEEKER_AI_INTERVIEW_PATH } from '@/utils/routes';

const DAY_MS = 86_400_000;

export function InterviewInviteCard({ message, mine }: { message: ChatMessage; mine: boolean }) {
  const now = useNow();
  const { jobTitle, company, expiresAt, note, interviewId } = message.metadata;
  const daysLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - now) / DAY_MS) : 0;
  const expired = daysLeft <= 0;

  return (
    <div className="w-full max-w-[440px] overflow-hidden border border-[#e4e5e8] bg-white shadow-2xs">
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center bg-[#e7f0fa] text-[#0a65cc]">
          <Video size={19} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold leading-tight text-[#18191c]">
            {mine ? 'AI interview invite sent' : "You're invited to an AI interview"}
          </p>
          <p className="mt-0.5 truncate text-[12.5px] text-[#767f8c]">
            {jobTitle} · {company}
          </p>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-words px-4 pt-3 text-[14px] leading-[1.5] text-[#18191c]">{note || message.body}</p>

      {expiresAt && (
        <div className="mx-4 mt-3 grid gap-1.5 border border-[#e4e5e8] bg-[#f8fafc] px-3 py-2.5 text-[12.5px]">
          <div className="flex justify-between gap-3">
            <span className="text-[#767f8c]">Interview</span>
            <span className="font-semibold text-[#18191c]">AI interview · any time</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#767f8c]">Expires</span>
            <span className="font-semibold text-[#18191c]" suppressHydrationWarning>
              {formatDateTime(expiresAt)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[#e4e5e8] px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${expired ? 'text-[#e05151]' : 'text-[#d97706]'}`} suppressHydrationWarning>
          <Clock3 size={14} aria-hidden />
          {expired ? 'Invite expired' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
        </span>
        {mine || expired ? (
          <span className="text-[10.5px] text-[#767f8c]" suppressHydrationWarning>
            {messageTime(message.createdAt)}
          </span>
        ) : (
          <Link
            href={interviewId ? interviewLobbyPath(interviewId) : SEEKER_AI_INTERVIEW_PATH}
            style={{ color: '#ffffff' }}
            className="inline-flex h-9 items-center gap-1.5 bg-[#0a65cc] px-4 text-[13px] font-semibold !text-white text-white no-underline transition-colors hover:bg-[#084f9e] hover:!text-white"
          >
            <span>Start Interview</span>
            <ArrowRight size={15} className="!text-white text-white" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
