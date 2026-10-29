'use client';

import { useEffect, useState } from 'react';
import { unreadMessagesAction } from '@/actions/messages.actions';
import { useSocketEvent } from '@/hooks/useMessengerSocket';
import type { UnreadMessages } from '@/types/messages';

export function MessagesNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void unreadMessagesAction().then((result) => {
      if (!cancelled && result.data) setCount(result.data.count);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useSocketEvent<UnreadMessages>('unread', ({ count: next }) => setCount(next));

  if (count <= 0) return null;

  return (
    <span className="cdash-side-badge !bg-[#e05151] !text-white" aria-label={`${count} unread chats`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
