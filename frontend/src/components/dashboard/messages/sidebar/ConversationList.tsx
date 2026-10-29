'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, WifiOff } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { ChatPeer, ChatThread } from '@/types/messages';
import { useMessenger } from '../MessengerShell';
import { ConversationItem } from './ConversationItem';
import { UserSearchInput, UserSearchResults } from './UserSearch';

const draftThread = (peer: ChatPeer): ChatThread => ({
  id: null,
  peer,
  presence: null,
  lastMessage: null,
  unreadCount: 0,
  canSend: true,
  replyAccess: null,
  peerDeliveredAt: null,
  peerReadAt: null,
});

interface ConversationListProps {
  hasMore: boolean;
  loadingMore: boolean;
  loadFailed: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function ConversationList({ hasMore, loadingMore, loadFailed, onLoadMore, onRetry }: ConversationListProps) {
  const { me, basePath, connected, conversations, typing, activeId, draftPeer } = useMessenger();
  const [query, setQuery] = useState('');
  const sentinelRef = useRef<HTMLLIElement>(null);
  const now = useNow();

  const draft = draftPeer && !conversations.some((item) => item.peer.id === draftPeer.id) ? draftThread(draftPeer) : null;

  const hrefFor = (peer: Pick<ChatPeer, 'id' | 'username'>) => `${basePath}/${encodeURIComponent(peer.username ?? peer.id)}`;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && onLoadMore(), { rootMargin: '120px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <>
      <header className="shrink-0 space-y-3 px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold tracking-tight text-[#18191c]">Chats</h1>
          {!connected && (
            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#767f8c]" title="Reconnecting to messages">
              <WifiOff size={13} aria-hidden />
              Connecting…
            </span>
          )}
        </div>
        <UserSearchInput query={query} onQueryChange={setQuery} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 pb-3">
        {query ? (
          <UserSearchResults query={query} ownUsername={me.username} onQueryChange={setQuery} hrefFor={hrefFor} />
        ) : loadFailed && !conversations.length ? (
          <div className="px-4 py-10 text-center text-sm text-rose-700">
            <p className="font-semibold">Couldn&apos;t load your chats.</p>
            <button type="button" onClick={onRetry} className="mt-2 font-semibold text-[#0a65cc] hover:underline">
              Try again
            </button>
          </div>
        ) : conversations.length || draft ? (
          <ul className="space-y-0.5">
            {draft && (
              <li>
                <ConversationItem conversation={draft} href={hrefFor(draft.peer)} meId={me.id} active typing={false} now={now} />
              </li>
            )}
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <ConversationItem
                  conversation={conversation}
                  href={hrefFor(conversation.peer)}
                  meId={me.id}
                  active={conversation.id === activeId}
                  typing={Boolean(typing[conversation.id])}
                  now={now}
                />
              </li>
            ))}
            <li ref={sentinelRef} aria-hidden />
            {loadingMore && (
              <li className="flex justify-center py-3 text-[#767f8c]">
                <Loader2 size={18} className="animate-spin" aria-label="Loading more chats" />
              </li>
            )}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f0fa] text-[#0a65cc]">
              <MessageCircle size={26} aria-hidden />
            </span>
            <p className="text-sm font-semibold text-[#18191c]">No chats yet</p>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-[#767f8c]">Search someone by their username to start a conversation.</p>
          </div>
        )}
      </div>
    </>
  );
}
