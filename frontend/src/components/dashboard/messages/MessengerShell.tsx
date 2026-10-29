'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { loadConversationAction, loadConversationsAction } from '@/actions/messages.actions';
import { emitEvent, useSocketEvent } from '@/hooks/useMessengerSocket';
import type {
  ChatMessage,
  ChatPeer,
  ChatUser,
  Conversation,
  ConversationPage,
  ConversationUpdatedEvent,
  PresenceEvent,
  ReceiptEvent,
  TypingEvent,
} from '@/types/messages';
import { sortConversations } from '@/utils/messages';
import { ConversationList } from './sidebar/ConversationList';

const TYPING_TIMEOUT_MS = 6_000;

interface MessengerContextValue {
  me: ChatUser;
  basePath: string;
  connected: boolean;
  conversations: Conversation[];
  typing: Record<string, boolean>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  draftPeer: ChatPeer | null;
  setDraftPeer: (peer: ChatPeer | null) => void;
  upsert: (conversation: Conversation) => void;
  patch: (id: string, changes: Partial<Conversation>) => void;
  remove: (id: string) => void;
}

const MessengerContext = createContext<MessengerContextValue | null>(null);

export function useMessenger() {
  const value = useContext(MessengerContext);
  if (!value) throw new Error('useMessenger must be used inside MessengerShell');
  return value;
}

const isLater = (next: string | null, current: string | null) => Boolean(next && (!current || Date.parse(next) > Date.parse(current)));

interface MessengerShellProps {
  me: ChatUser;
  basePath: string;
  initial: ConversationPage | null;
  children: React.ReactNode;
}

export function MessengerShell({ me, basePath, initial, children }: MessengerShellProps) {
  const segment = useSelectedLayoutSegment();
  const [conversations, setConversations] = useState<Conversation[]>(initial?.items ?? []);
  const [nextCursor, setNextCursor] = useState(initial?.nextCursor ?? null);
  const [loadFailed, setLoadFailed] = useState(!initial);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typing, setTyping] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftPeer, setDraftPeer] = useState<ChatPeer | null>(null);
  const typingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const loadingIds = useRef(new Set<string>());

  const upsert = useCallback((conversation: Conversation) => {
    setConversations((items) => sortConversations([conversation, ...items.filter((item) => item.id !== conversation.id)]));
  }, []);

  const patch = useCallback((id: string, changes: Partial<Conversation>) => {
    setConversations((items) => items.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const remove = useCallback((id: string) => {
    setConversations((items) => items.filter((item) => item.id !== id));
  }, []);

  const setPeerTyping = useCallback((conversationId: string, value: boolean) => {
    const timers = typingTimers.current;
    clearTimeout(timers.get(conversationId));
    timers.delete(conversationId);
    if (value) {
      const expire = () => {
        timers.delete(conversationId);
        setTyping((state) => ({ ...state, [conversationId]: false }));
      };
      timers.set(conversationId, setTimeout(expire, TYPING_TIMEOUT_MS));
    }
    setTyping((state) => ({ ...state, [conversationId]: value }));
  }, []);

  const fetchConversation = useCallback(
    async (id: string) => {
      if (loadingIds.current.has(id)) return;
      loadingIds.current.add(id);
      const result = await loadConversationAction(id);
      loadingIds.current.delete(id);
      if (result.data) upsert(result.data);
    },
    [upsert],
  );

  const refresh = useCallback(async () => {
    const result = await loadConversationsAction();
    if (!result.data) return;
    const { items, nextCursor: cursor } = result.data;
    setLoadFailed(false);
    setConversations((current) => {
      const fresh = new Set(items.map((item) => item.id));
      return sortConversations([...items, ...current.filter((item) => !fresh.has(item.id))]);
    });
    setNextCursor((existing) => existing ?? cursor);
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    const result = await loadConversationsAction(nextCursor);
    setLoadingMore(false);
    if (!result.data) return;
    const { items, nextCursor: cursor } = result.data;
    setConversations((current) => {
      const known = new Set(current.map((item) => item.id));
      return sortConversations([...current, ...items.filter((item) => !known.has(item.id))]);
    });
    setNextCursor(cursor);
  }, [nextCursor, loadingMore]);

  const handleMessage = ({ message }: { message: ChatMessage }) => {
    const { conversationId, senderId } = message;
    const fromPeer = senderId !== me.id;
    const viewing = activeId === conversationId && document.visibilityState === 'visible';

    if (fromPeer) {
      setPeerTyping(conversationId, false);
      emitEvent('message:delivered', { conversationId });
    }

    if (!conversations.some((item) => item.id === conversationId)) {
      void fetchConversation(conversationId);
      return;
    }

    setConversations((items) =>
      sortConversations(
        items.map((item) =>
          item.id === conversationId
            ? { ...item, lastMessage: message, unreadCount: fromPeer && !viewing ? item.unreadCount + 1 : item.unreadCount }
            : item,
        ),
      ),
    );
  };

  const handleReceipt = ({ conversationId, userId, deliveredAt, readAt }: ReceiptEvent) => {
    setConversations((items) =>
      items.map((item) => {
        if (item.id !== conversationId) return item;
        if (userId === me.id) return readAt ? { ...item, unreadCount: 0 } : item;
        return {
          ...item,
          peerDeliveredAt: isLater(deliveredAt, item.peerDeliveredAt) ? deliveredAt : item.peerDeliveredAt,
          peerReadAt: isLater(readAt, item.peerReadAt) ? readAt : item.peerReadAt,
        };
      }),
    );
  };

  const handlePresence = ({ userId, online, lastSeenAt }: PresenceEvent) => {
    setConversations((items) => items.map((item) => (item.peer.id === userId && item.presence ? { ...item, presence: { online, lastSeenAt } } : item)));
  };

  const handleUpdated = ({ conversationId, ...changes }: ConversationUpdatedEvent) => {
    patch(conversationId, changes);
  };

  const connected = useSocketEvent('message:new', handleMessage);
  useSocketEvent('receipt', handleReceipt);
  useSocketEvent('presence', handlePresence);
  useSocketEvent('conversation:updated', handleUpdated);
  useSocketEvent<{ conversationId: string }>('conversation:cleared', ({ conversationId }) => remove(conversationId));
  useSocketEvent<TypingEvent>('typing', ({ conversationId, userId, typing: value }) => {
    if (userId !== me.id) setPeerTyping(conversationId, value);
  });
  useSocketEvent('connect', () => void refresh());

  const value = useMemo(
    () => ({ me, basePath, connected, conversations, typing, activeId, setActiveId, draftPeer, setDraftPeer, upsert, patch, remove }),
    [me, basePath, connected, conversations, typing, activeId, draftPeer, upsert, patch, remove],
  );

  const chatOpen = segment !== null;

  return (
    <MessengerContext.Provider value={value}>
      <div className="messenger-page flex h-full min-h-0 w-full overflow-hidden bg-white">
        <aside
          className={`${chatOpen ? 'hidden md:flex' : 'flex'} w-full min-h-0 flex-col border-r border-[#e4e5e8] md:w-[340px] lg:w-[360px] md:shrink-0`}
        >
          <ConversationList
            hasMore={Boolean(nextCursor)}
            loadingMore={loadingMore}
            loadFailed={loadFailed}
            onLoadMore={loadMore}
            onRetry={refresh}
          />
        </aside>
        <section className={`${chatOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col`}>{children}</section>
      </div>
    </MessengerContext.Provider>
  );
}
