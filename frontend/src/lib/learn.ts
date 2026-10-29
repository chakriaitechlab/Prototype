import 'server-only';
import { apiFetch, apiStream } from './client';
import type { LearnChat, LearnChatDetail } from '@/types/learn';

const chatPath = (id: string) => `/api/learn/chats/${encodeURIComponent(id)}`;

export const learnApi = {
  list: (): Promise<LearnChat[]> => apiFetch('/api/learn/chats'),

  get: (id: string): Promise<LearnChatDetail> => apiFetch(chatPath(id)),

  create: (): Promise<LearnChat> => apiFetch('/api/learn/chats', { method: 'POST', body: {} }),

  rename: (id: string, title: string): Promise<LearnChat> => apiFetch(chatPath(id), { method: 'PATCH', body: { title } }),

  remove: (id: string): Promise<{ message: string }> => apiFetch(chatPath(id), { method: 'DELETE' }),

  streamMessage: (id: string, content: unknown, signal: AbortSignal) =>
    apiStream(`${chatPath(id)}/messages/stream`, { method: 'POST', body: { content }, signal }),

  streamEdit: (id: string, messageId: string, content: unknown, signal: AbortSignal) =>
    apiStream(`${chatPath(id)}/messages/${encodeURIComponent(messageId)}/stream`, { method: 'PATCH', body: { content }, signal }),

  streamRegenerate: (id: string, signal: AbortSignal) => apiStream(`${chatPath(id)}/regenerate/stream`, { method: 'POST', signal }),
};
