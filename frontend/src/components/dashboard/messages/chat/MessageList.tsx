'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { ChatBubble, ChatThread } from '@/types/messages';
import { layoutBubbles, messageStatus } from '@/utils/messages';
import { ChatIntro } from './ChatIntro';
import { DayDivider } from './DayDivider';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

const LOAD_OLDER_THRESHOLD_PX = 120;
const STICK_TO_BOTTOM_PX = 160;

interface MessageListProps {
  meId: string;
  thread: ChatThread;
  messages: ChatBubble[];
  hasMore: boolean;
  loadingOlder: boolean;
  peerTyping: boolean;
  onLoadOlder: () => void;
  onRetry: (message: ChatBubble) => void;
}

export function MessageList({ meId, thread, messages, hasMore, loadingOlder, peerTyping, onLoadOlder, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<{ height: number; top: number } | null>(null);
  const atBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const now = useNow();

  const firstId = messages[0]?.clientId;
  const lastMessage = messages.at(-1);
  const lastKey = lastMessage ? `${lastMessage.clientId}:${lastMessage.status ?? ''}` : '';

  useLayoutEffect(() => {
    const element = scrollRef.current;
    const anchor = anchorRef.current;
    if (!element || !anchor) return;
    element.scrollTop = anchor.top + (element.scrollHeight - anchor.height);
    anchorRef.current = null;
  }, [firstId]);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const mine = lastMessage?.senderId === meId;
    if (atBottomRef.current || mine) element.scrollTop = element.scrollHeight;
    else setShowJump(true);
  }, [lastKey, peerTyping, meId, lastMessage?.senderId]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [thread.peer.id]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    atBottomRef.current = distance < STICK_TO_BOTTOM_PX;
    if (atBottomRef.current) setShowJump(false);

    if (element.scrollTop < LOAD_OLDER_THRESHOLD_PX && hasMore && !loadingOlder) {
      anchorRef.current = { height: element.scrollHeight, top: element.scrollTop };
      onLoadOlder();
    }
  };

  const jumpToBottom = () => {
    const element = scrollRef.current;
    if (element) element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    setShowJump(false);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto overscroll-contain px-3 pb-3 sm:px-5" aria-live="polite">
        {hasMore ? (
          <div className="flex justify-center py-3 text-[#767f8c]">{loadingOlder && <Loader2 size={18} className="animate-spin" aria-label="Loading older messages" />}</div>
        ) : (
          <ChatIntro peer={thread.peer} canSend={thread.canSend} />
        )}

        {layoutBubbles(messages, now).map(({ message, day, first, last }) => (
          <div key={`${message.senderId}:${message.clientId}`}>
            {day && <DayDivider label={day} />}
            <MessageBubble
              message={message}
              mine={message.senderId === meId}
              first={first}
              last={last}
              status={messageStatus(message, thread)}
              onRetry={onRetry}
            />
          </div>
        ))}

        {peerTyping && <TypingIndicator name={thread.peer.name} />}
      </div>

      {showJump && (
        <button
          type="button"
          onClick={jumpToBottom}
          className="absolute bottom-3 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[#0a65cc] shadow-md ring-1 ring-[#e4e5e8] hover:bg-[#f4f5f7]"
          aria-label="Jump to latest message"
        >
          <ArrowDown size={18} aria-hidden />
        </button>
      )}
    </div>
  );
}
