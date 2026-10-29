'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearConversationAction, loadMessagesAction, markReadAction, sendMessageAction, setReplyAccessAction } from '@/actions/messages.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import { emitEvent, emitWithAck, useSocketEvent } from '@/hooks/useMessengerSocket';
import type { ChatBubble, ChatMessage, ChatPresence, ChatThread, MessagePage, PresenceEvent, SentMessage } from '@/types/messages';
import { mergeMessages } from '@/utils/messages';
import { Composer } from '../composer/Composer';
import { LockedComposer } from '../composer/LockedComposer';
import { useMessenger } from '../MessengerShell';
import { ChatHeader } from './ChatHeader';
import { DeleteChatDialog } from './DeleteChatDialog';
import { MessageList } from './MessageList';

type Alert = { type: 'success' | 'error'; message: string; trigger: number };

interface ChatWindowProps {
  initialThread: ChatThread;
  initialPage: MessagePage | null;
}

export function ChatWindow({ initialThread, initialPage }: ChatWindowProps) {
  const router = useRouter();
  const { me, basePath, connected, conversations, typing, setActiveId, setDraftPeer, upsert, patch, remove } = useMessenger();
  const [conversationId, setConversationId] = useState(initialThread.id);
  const [watchedPresence, setWatchedPresence] = useState<ChatPresence | null>(initialThread.presence);
  const [messages, setMessages] = useState<ChatBubble[]>(initialPage?.items ?? []);
  const [hasMore, setHasMore] = useState(initialPage?.hasMore ?? false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [replyPending, setReplyPending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const pendingIds = useRef(new Set<string>());

  const live = conversations.find((item) => item.id === conversationId);
  const thread: ChatThread = live ?? { ...initialThread, id: conversationId, presence: watchedPresence };
  const peer = thread.peer;
  const peerTyping = Boolean(conversationId && typing[conversationId]);

  const showError = (message: string) => setAlert({ type: 'error', message, trigger: Date.now() });

  useEffect(() => {
    setActiveId(conversationId);
    return () => setActiveId(null);
  }, [conversationId, setActiveId]);

  // Until the first message creates the conversation, keep the peer pinned in the sidebar.
  useEffect(() => {
    if (live) return;
    setDraftPeer(initialThread.peer);
    return () => setDraftPeer(null);
  }, [live, initialThread.peer, setDraftPeer]);

  useEffect(() => {
    if (initialThread.id) upsert({ ...initialThread, id: initialThread.id });
  }, [initialThread, upsert]);

  useEffect(() => {
    if (!connected || live) return;
    emitWithAck<{ presence: ChatPresence | null }>('presence:watch', { userId: peer.id })
      .then(({ presence }) => setWatchedPresence(presence))
      .catch(() => undefined);
  }, [connected, live, peer.id]);

  const markRead = useCallback(() => {
    if (!conversationId || document.visibilityState !== 'visible') return;
    if (connected) emitEvent('conversation:read', { conversationId });
    else void markReadAction(conversationId);
  }, [conversationId, connected]);

  const unread = live?.unreadCount ?? 0;
  useEffect(() => {
    if (unread > 0) markRead();
  }, [unread, markRead]);

  useEffect(() => {
    document.addEventListener('visibilitychange', markRead);
    return () => document.removeEventListener('visibilitychange', markRead);
  }, [markRead]);

  useSocketEvent<{ message: ChatMessage }>('message:new', ({ message }) => {
    const ours = message.conversationId === conversationId;
    const startsThread = !conversationId && (message.senderId === peer.id || pendingIds.current.has(message.clientId));
    if (!ours && !startsThread) return;

    if (startsThread) setConversationId(message.conversationId);
    pendingIds.current.delete(message.clientId);
    setMessages((current) => mergeMessages(current, [message]));
    if (message.senderId === peer.id) markRead();
  });

  useSocketEvent<PresenceEvent>('presence', ({ userId, online, lastSeenAt }) => {
    if (userId === peer.id && !live) setWatchedPresence({ online, lastSeenAt });
  });

  useSocketEvent<{ conversationId: string }>('conversation:cleared', ({ conversationId: cleared }) => {
    if (cleared === conversationId) setMessages([]);
  });

  const deliver = async (bubble: ChatBubble) => {
    const input = { recipientId: peer.id, clientId: bubble.clientId, body: bubble.body };
    pendingIds.current.add(bubble.clientId);
    setMessages((current) => mergeMessages(current, [{ ...bubble, status: 'sending' }]));

    try {
      const { message } = connected ? await emitWithAck<SentMessage>('message:send', input) : await viaAction(input);
      pendingIds.current.delete(bubble.clientId);
      setMessages((current) => mergeMessages(current, [message]));
      if (!conversationId) setConversationId(message.conversationId);
    } catch (err) {
      pendingIds.current.delete(bubble.clientId);
      setMessages((current) => mergeMessages(current, [{ ...bubble, status: 'failed' }]));
      showError(err instanceof Error && err.message !== 'offline' ? err.message : 'Message not sent. Tap retry.');
    }
  };

  const send = (body: string) => {
    const clientId = crypto.randomUUID();
    void deliver({ id: clientId, conversationId: conversationId ?? '', senderId: me.id, clientId, body, kind: 'TEXT', metadata: {}, createdAt: new Date().toISOString() });
  };

  const sendTyping = useCallback(
    (value: boolean) => {
      if (conversationId) emitEvent('typing', { conversationId, typing: value });
    },
    [conversationId],
  );

  const loadOlder = async () => {
    const oldest = messages.find((message) => !message.status);
    if (!conversationId || !oldest || loadingOlder) return;

    setLoadingOlder(true);
    const result = await loadMessagesAction(conversationId, oldest.id);
    setLoadingOlder(false);
    if (!result.data) {
      showError(result.error);
      return;
    }
    setMessages((current) => mergeMessages(result.data.items, current));
    setHasMore(result.data.hasMore);
  };

  const toggleReplies = async () => {
    if (!conversationId || thread.replyAccess === null) return;
    setReplyPending(true);
    const result = await setReplyAccessAction(conversationId, !thread.replyAccess);
    setReplyPending(false);
    if (!result.data) {
      showError(result.error);
      return;
    }
    patch(conversationId, { replyAccess: result.data.replyAccess });
    setAlert({ type: 'success', message: result.data.message, trigger: Date.now() });
  };

  const deleteChat = async () => {
    if (!conversationId) return;
    setDeleting(true);
    const result = await clearConversationAction(conversationId);
    setDeleting(false);
    if (!result.data) {
      showError(result.error);
      return;
    }
    setDeleteOpen(false);
    remove(conversationId);
    router.push(basePath);
  };

  return (
    <>
      <FormAlert message={alert?.message} type={alert?.type} trigger={alert?.trigger} />
      <ChatHeader
        thread={thread}
        backHref={basePath}
        peerTyping={peerTyping}
        replyPending={replyPending}
        onToggleReplies={toggleReplies}
        onDelete={() => setDeleteOpen(true)}
      />
      <MessageList
        meId={me.id}
        thread={thread}
        messages={messages}
        hasMore={hasMore}
        loadingOlder={loadingOlder}
        peerTyping={peerTyping}
        onLoadOlder={loadOlder}
        onRetry={(bubble) => void deliver(bubble)}
      />
      {thread.replyAccess === false && (
        <p className="shrink-0 border-t border-[#e4e5e8] bg-[#fff8e6] px-4 py-2 text-center text-xs text-[#8a5a00]">
          Replies are off. {peer.name} can read your messages but can&apos;t reply.
        </p>
      )}
      {thread.canSend ? <Composer key={peer.id} peerName={peer.name} onSend={send} onTyping={sendTyping} /> : <LockedComposer />}
      {deleteOpen && <DeleteChatDialog name={peer.name} pending={deleting} onConfirm={deleteChat} onClose={() => setDeleteOpen(false)} />}
    </>
  );
}

async function viaAction(input: { recipientId: string; clientId: string; body: string }) {
  const result = await sendMessageAction(input);
  if (!result.data) throw new Error(result.error);
  return result.data;
}
