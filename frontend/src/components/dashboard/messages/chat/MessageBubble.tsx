import { RotateCw } from 'lucide-react';
import type { ChatBubble, MessageStatus } from '@/types/messages';
import { messageTime } from '@/utils/messages';
import { MessageTicks } from './MessageTicks';
import { InterviewInviteCard } from './InterviewInviteCard';
import { RejectionCard } from './RejectionCard';
import { InterviewCompletedCard } from './InterviewCompletedCard';

interface MessageBubbleProps {
  message: ChatBubble;
  mine: boolean;
  first: boolean;
  last: boolean;
  status: MessageStatus;
  onRetry: (message: ChatBubble) => void;
}

function cornerClass(mine: boolean, first: boolean, last: boolean) {
  if (mine) {
    if (first && last) return 'rounded-2xl rounded-br-xs';
    if (first) return 'rounded-2xl rounded-br-md';
    if (last) return 'rounded-2xl rounded-tr-md rounded-br-xs';
    return 'rounded-2xl rounded-r-md';
  }
  if (first && last) return 'rounded-2xl rounded-bl-xs';
  if (first) return 'rounded-2xl rounded-bl-md';
  if (last) return 'rounded-2xl rounded-tl-md rounded-bl-xs';
  return 'rounded-2xl rounded-l-md';
}

export function MessageBubble({ message, mine, first, last, status, onRetry }: MessageBubbleProps) {
  const failed = status === 'failed';

  if (message.kind !== 'TEXT') {
    return (
      <div className={`flex ${mine ? 'justify-end' : 'justify-start'} my-3 sm:my-3.5`}>
        {message.kind === 'INTERVIEW_INVITE' ? (
          <InterviewInviteCard message={message} mine={mine} />
        ) : message.kind === 'INTERVIEW_COMPLETED' ? (
          <InterviewCompletedCard message={message} mine={mine} />
        ) : (
          <RejectionCard message={message} mine={mine} />
        )}
      </div>
    );
  }

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} ${first ? 'mt-3' : 'mt-1.5'}`}>
      <div className={`flex max-w-[82%] items-end gap-1.5 sm:max-w-[70%] ${mine ? 'flex-row-reverse' : ''}`}>
        <div
          className={`${cornerClass(mine, first, last)} px-3.5 py-2 shadow-2xs ${
            mine ? 'bg-[#0a65cc] text-white' : 'bg-[#f1f2f4] text-[#18191c]'
          } ${failed ? 'opacity-70' : ''}`}
        >
          <div className="flex flex-wrap items-end justify-end gap-x-2.5 gap-y-0.5">
            <p className="whitespace-pre-wrap break-words text-[14.5px] leading-[1.4] text-left flex-1 min-w-0">{message.body}</p>
            <span
              className={`inline-flex items-center gap-1 text-[10.5px] shrink-0 self-end ${mine ? 'text-white/75' : 'text-[#767f8c]'}`}
              suppressHydrationWarning
            >
              {messageTime(message.createdAt)}
              {mine && <MessageTicks status={status} onDark />}
            </span>
          </div>
        </div>
        {failed && (
          <button
            type="button"
            onClick={() => onRetry(message)}
            className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline"
            aria-label="Retry sending message"
          >
            <RotateCw size={12} aria-hidden />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
