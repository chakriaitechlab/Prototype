import type { ChatBubble, ChatMessage, ChatPresence, ChatThread, MessageStatus } from '@/types/messages';

const TIME_ZONE = 'Asia/Dhaka';
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const GROUP_GAP_MS = 5 * MINUTE;

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short' });
const shortDateFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: 'numeric' });
const longDateFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const dayKey = (value: string | number) => dayKeyFormat.format(new Date(value));

function daysBetween(value: string, now: number) {
  const from = Date.parse(`${dayKey(value)}T00:00:00Z`);
  const to = Date.parse(`${dayKey(now)}T00:00:00Z`);
  return Math.round((to - from) / DAY);
}

export function messageTime(value: string) {
  return timeFormat.format(new Date(value));
}

export function listTime(value: string, now: number) {
  const days = daysBetween(value, now);
  if (days <= 0) return messageTime(value);
  if (days === 1) return 'Yesterday';
  if (days < 7) return weekdayFormat.format(new Date(value));
  return shortDateFormat.format(new Date(value));
}

export function dayLabel(value: string, now: number) {
  const days = daysBetween(value, now);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return longDateFormat.format(new Date(value));
}

export function presenceLabel(presence: ChatPresence | null, now: number) {
  if (!presence) return null;
  if (presence.online) return 'Active now';
  if (!presence.lastSeenAt) return 'Offline';

  const elapsed = Math.max(0, now - Date.parse(presence.lastSeenAt));
  if (elapsed < MINUTE) return 'Active just now';
  if (elapsed < HOUR) return `Active ${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `Active ${Math.floor(elapsed / HOUR)}h ago`;
  if (daysBetween(presence.lastSeenAt, now) === 1) return 'Active yesterday';
  const days = Math.floor(elapsed / DAY);
  return days < 7 ? `Active ${days}d ago` : `Active ${shortDateFormat.format(new Date(presence.lastSeenAt))}`;
}

export function messageStatus(message: ChatBubble, thread: Pick<ChatThread, 'peerDeliveredAt' | 'peerReadAt'>): MessageStatus {
  if (message.status) return message.status;
  const sentAt = Date.parse(message.createdAt);
  if (thread.peerReadAt && Date.parse(thread.peerReadAt) >= sentAt) return 'read';
  if (thread.peerDeliveredAt && Date.parse(thread.peerDeliveredAt) >= sentAt) return 'delivered';
  return 'sent';
}

export function mergeMessages<T extends ChatMessage>(current: T[], incoming: T[]) {
  const byKey = new Map<string, T>();
  for (const message of [...current, ...incoming]) {
    byKey.set(`${message.senderId}:${message.clientId}`, message);
  }
  return [...byKey.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export interface BubbleLayout<T> {
  message: T;
  day: string | null;
  first: boolean;
  last: boolean;
}

export function layoutBubbles<T extends ChatMessage>(messages: T[], now: number): BubbleLayout<T>[] {
  return messages.map((message, index) => {
    const prev = messages[index - 1];
    const next = messages[index + 1];
    const newDay = !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt);
    const joinsPrev =
      !newDay &&
      prev?.senderId === message.senderId &&
      prev?.kind === 'TEXT' &&
      message.kind === 'TEXT' &&
      Date.parse(message.createdAt) - Date.parse(prev.createdAt) < GROUP_GAP_MS;
    const joinsNext =
      Boolean(next) &&
      next.senderId === message.senderId &&
      next.kind === 'TEXT' &&
      message.kind === 'TEXT' &&
      dayKey(next.createdAt) === dayKey(message.createdAt) &&
      Date.parse(next.createdAt) - Date.parse(message.createdAt) < GROUP_GAP_MS;

    return { message, day: newDay ? dayLabel(message.createdAt, now) : null, first: !joinsPrev, last: !joinsNext };
  });
}

export function sortConversations<T extends ChatThread>(items: T[]) {
  return [...items].sort((a, b) => Date.parse(b.lastMessage?.createdAt ?? '0') - Date.parse(a.lastMessage?.createdAt ?? '0'));
}

export function messagePreview(thread: ChatThread, meId: string) {
  const { lastMessage } = thread;
  if (!lastMessage) return '';
  const text = lastMessage.body.replace(/\s+/g, ' ').trim();
  return lastMessage.senderId === meId ? `You: ${text}` : text;
}
