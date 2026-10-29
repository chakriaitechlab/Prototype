import 'server-only';
import { apiFetch } from './client';
import type {
  ClearConversationResult,
  Conversation,
  ConversationPage,
  ChatThread,
  MessagePage,
  ReplyAccessResult,
  SendMessageInput,
  SentMessage,
  SocketToken,
  UnreadMessages,
  UserSearchResult,
} from '@/types/messages';

const conversationPath = (id: string) => `/api/messages/conversations/${encodeURIComponent(id)}`;

export const messagesApi = {
  socketToken: (): Promise<SocketToken> => apiFetch('/api/messages/socket-token', { method: 'POST' }),

  conversations: (cursor?: string): Promise<ConversationPage> =>
    apiFetch('/api/messages/conversations', { query: cursor ? { cursor } : undefined }),

  conversation: (id: string): Promise<Conversation> => apiFetch(conversationPath(id)),

  unreadCount: (): Promise<UnreadMessages> => apiFetch('/api/messages/unread-count'),

  search: (username: string): Promise<UserSearchResult> => apiFetch('/api/messages/search', { query: { username } }),

  peer: (handle: string): Promise<ChatThread> => apiFetch(`/api/messages/peer/${encodeURIComponent(handle)}`),

  messages: (id: string, before?: string): Promise<MessagePage> =>
    apiFetch(`${conversationPath(id)}/messages`, { query: before ? { before } : undefined }),

  send: (input: SendMessageInput): Promise<SentMessage> => apiFetch('/api/messages', { method: 'POST', body: input }),

  markRead: (id: string): Promise<{ ok: boolean }> => apiFetch(`${conversationPath(id)}/read`, { method: 'POST' }),

  setReplyAccess: (id: string, allowed: boolean): Promise<ReplyAccessResult> =>
    apiFetch(`${conversationPath(id)}/reply-access`, { method: 'PATCH', body: { allowed } }),

  clear: (id: string): Promise<ClearConversationResult> => apiFetch(conversationPath(id), { method: 'DELETE' }),
};
