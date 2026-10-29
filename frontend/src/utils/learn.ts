import type { LearnChat, LearnStreamEvent } from '@/types/learn';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const PINNED_CHATS_KEY = 'learning-chat:pinned-chats';
const PINNED_CHATS_EVENT = 'learning-chat:pinned-changed';
const EMPTY: string[] = [];

let cachedRaw: string | null = null;
let cachedPins: string[] = EMPTY;

export const LEARN_PATH = '/dashboard/seeker/learn';

export const learnChatPath = (id: string) => `${LEARN_PATH}/${encodeURIComponent(id)}`;

const streamBase = (chatId: string) => `/api/learn/chats/${encodeURIComponent(chatId)}`;

export const learnStreamPath = {
  message: (chatId: string) => `${streamBase(chatId)}/messages/stream`,
  edit: (chatId: string, messageId: string) => `${streamBase(chatId)}/messages/${encodeURIComponent(messageId)}/stream`,
  regenerate: (chatId: string) => `${streamBase(chatId)}/regenerate/stream`,
};

export async function readLearnStream(body: ReadableStream<Uint8Array>, onEvent: (event: LearnStreamEvent) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as LearnStreamEvent);
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer) as LearnStreamEvent);
}

export function sortChats(chats: LearnChat[]) {
  return [...chats].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function relativeTime(iso: string, now: number) {
  const diff = now - Date.parse(iso);
  if (diff < MINUTE_MS) return 'just now';
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}m ago`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}h ago`;
  if (diff < 7 * DAY_MS) return `${Math.floor(diff / DAY_MS)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function getPinnedChatIds(): string[] {
  try {
    const raw = window.localStorage.getItem(PINNED_CHATS_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedPins = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    }
  } catch {
    return cachedPins;
  }
  return cachedPins;
}

export function getServerPinnedChatIds(): string[] {
  return EMPTY;
}

export function subscribePinnedChats(onChange: () => void) {
  window.addEventListener(PINNED_CHATS_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(PINNED_CHATS_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function togglePinnedChat(id: string) {
  const current = getPinnedChatIds();
  const next = current.includes(id) ? current.filter((pinnedId) => pinnedId !== id) : [id, ...current];

  try {
    window.localStorage.setItem(PINNED_CHATS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(PINNED_CHATS_EVENT));
  } catch {
    // Pins are a per-browser convenience; ignore unavailable storage.
  }
}
