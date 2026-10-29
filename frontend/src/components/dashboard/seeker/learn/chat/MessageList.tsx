'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import type { ThreadMessage } from '@/types/learn';
import { AssistantMessage } from './AssistantMessage';
import { EmptyChat } from './EmptyChat';
import { UserMessage } from './UserMessage';

const STICK_THRESHOLD_PX = 80;

interface MessageListProps {
  messages: ThreadMessage[];
  streaming: boolean;
  onEdit: (messageId: string, content: string) => void;
  onRegenerate: () => void;
}

export function MessageList({ messages, streaming, onEdit, onRegenerate }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const [stick, setStick] = useState(true);

  const setSticky = useCallback((value: boolean) => {
    stickRef.current = value;
    setStick(value);
  }, []);

  const pinToBottom = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
    lastScrollTopRef.current = scroller.scrollTop;
  }, []);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => {
      if (stickRef.current) pinToBottom();
    });
    observer.observe(inner);
    return () => observer.disconnect();
  }, [pinToBottom]);

  const lastUser = messages.map((message) => message.role).lastIndexOf('user');
  const lastAssistant = messages.map((message) => message.role).lastIndexOf('assistant');
  const lastUserKey = messages[lastUser]?.key;

  useEffect(() => {
    if (!lastUserKey) return;
    stickRef.current = true;
    pinToBottom();
  }, [lastUserKey, pinToBottom]);

  const handleScroll = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const scrolledUp = scroller.scrollTop < lastScrollTopRef.current - 2;
    lastScrollTopRef.current = scroller.scrollTop;
    if (scrolledUp && distance > STICK_THRESHOLD_PX) setSticky(false);
    else if (distance < STICK_THRESHOLD_PX) setSticky(true);
  };

  return (
    <div className="learning-messages" ref={scrollRef} onScroll={handleScroll}>
      <div className="learning-messages__inner" ref={innerRef}>
        {!messages.length && <EmptyChat />}

        {messages.map((message, index) =>
          message.role === 'user' ? (
            <UserMessage
              key={message.key}
              message={message}
              isLast={index === lastUser}
              canEdit={!streaming && !message.local}
              onEdit={onEdit}
            />
          ) : (
            <AssistantMessage
              key={message.key}
              message={message}
              isLast={index === lastAssistant}
              canRegenerate={!streaming && index === lastAssistant}
              onRegenerate={onRegenerate}
            />
          ),
        )}

        {!stick && (
          <button
            type="button"
            className="learning-messages__scroll-btn"
            aria-label="Scroll to latest message"
            title="Scroll to latest"
            onClick={() => {
              setSticky(true);
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }}
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
