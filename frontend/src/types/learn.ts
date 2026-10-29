export type LearnRole = 'user' | 'assistant';

export interface LearnChat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

export interface LearnMessage {
  id: string;
  role: LearnRole;
  content: string;
}

export interface LearnChatDetail extends LearnChat {
  messages: LearnMessage[];
}

export interface ThreadMessage extends LearnMessage {
  key: string;
  local?: boolean;
  streaming?: boolean;
}

export type LearnMode = 'fast' | 'thinking' | 'expert';

export type LearnStreamEvent =
  | { type: 'message'; id: string; role: LearnRole; content: string }
  | { type: 'delta'; content: string }
  | { type: 'title'; title: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

export type LearnActionResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };
