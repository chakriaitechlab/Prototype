import type { UserRole } from './auth';

export interface ChatPeer {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: UserRole;
  subtitle: string;
}

export interface ChatPresence {
  online: boolean;
  lastSeenAt: string | null;
}

export type MessageKind = 'TEXT' | 'INTERVIEW_INVITE' | 'APPLICATION_REJECTED' | 'INTERVIEW_COMPLETED';

export interface HiringMessageMetadata {
  applicationId: string;
  interviewId: string | null;
  jobId: string;
  jobTitle: string;
  company: string;
  expiresAt: string | null;
  note: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  clientId: string;
  body: string;
  kind: MessageKind;
  metadata: Partial<HiringMessageMetadata>;
  createdAt: string;
}

export interface ChatThread {
  id: string | null;
  peer: ChatPeer;
  presence: ChatPresence | null;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  canSend: boolean;
  replyAccess: boolean | null;
  peerDeliveredAt: string | null;
  peerReadAt: string | null;
}

export type Conversation = ChatThread & { id: string };

export interface ConversationPage {
  items: Conversation[];
  nextCursor: string | null;
}

export interface MessagePage {
  items: ChatMessage[];
  hasMore: boolean;
}

export interface UserSearchResult {
  items: ChatPeer[];
}

export interface SocketToken {
  token: string;
  expiresIn: number;
}

export interface SendMessageInput {
  recipientId: string;
  clientId: string;
  body: string;
}

export interface SentMessage {
  message: ChatMessage;
}

export interface ReplyAccessResult {
  replyAccess: boolean;
  message: string;
}

export interface ClearConversationResult {
  conversationId: string;
  message: string;
}

export interface UnreadMessages {
  count: number;
}

export interface ChatUser {
  id: string;
  role: UserRole;
  username: string | null;
}

export type MessageStatus = 'sending' | 'failed' | 'sent' | 'delivered' | 'read';

export interface ChatBubble extends ChatMessage {
  status?: 'sending' | 'failed';
}

export interface ReceiptEvent {
  conversationId: string;
  userId: string;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  typing: boolean;
}

export interface PresenceEvent extends ChatPresence {
  userId: string;
}

export interface ConversationUpdatedEvent {
  conversationId: string;
  canSend?: boolean;
  presence?: ChatPresence | null;
  replyAccess?: boolean;
}

export type ActionResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };
