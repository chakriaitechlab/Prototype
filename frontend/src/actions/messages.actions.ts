'use server';

import { errorMessage } from '@/lib/client';
import { messagesApi } from '@/lib/messages';
import { getCurrentUser } from '@/utils/session';
import type {
  ActionResult,
  ClearConversationResult,
  Conversation,
  ConversationPage,
  MessagePage,
  ReplyAccessResult,
  SendMessageInput,
  SentMessage,
  SocketToken,
  UnreadMessages,
  UserSearchResult,
} from '@/types/messages';

const SIGNED_OUT = 'Your session has expired. Please sign in again.';

async function withChatUser<T>(request: () => Promise<T>, fallback: string): Promise<ActionResult<T>> {
  const user = await getCurrentUser().catch(() => null);
  if (!user?.role || user.nextStep !== 'done') return { error: SIGNED_OUT };

  try {
    return { data: await request() };
  } catch (err) {
    return { error: errorMessage(err, fallback) };
  }
}

export async function getSocketTokenAction(): Promise<ActionResult<SocketToken>> {
  return withChatUser(() => messagesApi.socketToken(), 'Could not connect to messages');
}

export async function loadConversationsAction(cursor?: string): Promise<ActionResult<ConversationPage>> {
  return withChatUser(() => messagesApi.conversations(cursor), 'Could not load chats');
}

export async function loadConversationAction(id: string): Promise<ActionResult<Conversation>> {
  return withChatUser(() => messagesApi.conversation(id), 'Could not load chat');
}

export async function loadMessagesAction(id: string, before?: string): Promise<ActionResult<MessagePage>> {
  return withChatUser(() => messagesApi.messages(id, before), 'Could not load messages');
}

export async function searchUsersAction(username: string): Promise<ActionResult<UserSearchResult>> {
  return withChatUser(() => messagesApi.search(username), 'Could not search users');
}

export async function sendMessageAction(input: SendMessageInput): Promise<ActionResult<SentMessage>> {
  return withChatUser(() => messagesApi.send(input), 'Message not sent');
}

export async function markReadAction(id: string): Promise<ActionResult<{ ok: boolean }>> {
  return withChatUser(() => messagesApi.markRead(id), 'Could not update chat');
}

export async function setReplyAccessAction(id: string, allowed: boolean): Promise<ActionResult<ReplyAccessResult>> {
  return withChatUser(() => messagesApi.setReplyAccess(id, allowed), 'Could not change reply access');
}

export async function clearConversationAction(id: string): Promise<ActionResult<ClearConversationResult>> {
  return withChatUser(() => messagesApi.clear(id), 'Could not delete chat');
}

export async function unreadMessagesAction(): Promise<ActionResult<UnreadMessages>> {
  return withChatUser(() => messagesApi.unreadCount(), 'Could not load unread messages');
}
