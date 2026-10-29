'use client';

import { useEffect, useRef, useState } from 'react';
import type { LearnMessage, ThreadMessage } from '@/types/learn';
import { learnStreamPath, readLearnStream } from '@/utils/learn';

const FALLBACK_ERROR = 'AI service is currently unavailable. Please try again.';
const REVEAL_SMOOTHING = 10;

interface LearnStreamOptions {
  initialMessages: LearnMessage[];
  onTitle: (chatId: string, title: string) => void;
  onError: (message: string) => void;
}

const localKey = () => `local-${crypto.randomUUID()}`;

export function useLearnStream({ initialMessages, onTitle, onError }: LearnStreamOptions) {
  const [messages, setMessages] = useState<ThreadMessage[]>(() => initialMessages.map((message) => ({ ...message, key: message.id })));
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = async (chatId: string, url: string, init: RequestInit, thread: ThreadMessage[], userKey: string) => {
    const previous = messages;
    const controller = new AbortController();
    controllerRef.current = controller;
    const assistantKey = localKey();

    const update = (key: string, changes: Partial<ThreadMessage>) =>
      setMessages((items) => items.map((item) => (item.key === key ? { ...item, ...changes } : item)));

    let target = '';
    let shown = 0;
    let frame = 0;
    let drained: (() => void) | null = null;

    const tick = () => {
      frame = 0;
      const pending = target.length - shown;
      if (pending <= 0) {
        drained?.();
        return;
      }
      shown += Math.max(1, Math.ceil(pending / REVEAL_SMOOTHING));
      update(assistantKey, { content: target.slice(0, shown) });
      frame = requestAnimationFrame(tick);
    };
    const reveal = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const drain = () =>
      new Promise<void>((resolve) => {
        if (shown >= target.length) return resolve();
        drained = resolve;
        reveal();
      });

    setMessages([...thread, { key: assistantKey, id: assistantKey, role: 'assistant', content: '', local: true, streaming: true }]);
    setStreaming(true);

    try {
      const response = await fetch(url, {
        ...init,
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { message?: string | string[] };
        setMessages(previous);
        onError((Array.isArray(data.message) ? data.message[0] : data.message) || FALLBACK_ERROR);
        return;
      }

      await readLearnStream(response.body, (event) => {
        if (event.type === 'delta') {
          target += event.content;
          reveal();
        } else if (event.type === 'message' && event.role === 'user') {
          update(userKey, { id: event.id, content: event.content, local: false });
        } else if (event.type === 'message') {
          target = event.content;
          shown = Math.min(shown, target.length);
          update(assistantKey, { id: event.id, local: false });
          reveal();
        } else if (event.type === 'title') {
          onTitle(chatId, event.title);
        } else if (event.type === 'error') {
          onError(event.message);
        }
      });
      await drain();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) onError(FALLBACK_ERROR);
    } finally {
      cancelAnimationFrame(frame);
      if (controllerRef.current === controller) controllerRef.current = null;
      setMessages((items) =>
        items
          .map((item) => (item.key === assistantKey ? { ...item, content: target.trim(), streaming: false } : item))
          .filter((item) => item.key !== assistantKey || item.content),
      );
      setStreaming(false);
    }
  };

  const send = (chatId: string, content: string) => {
    const key = localKey();
    const user: ThreadMessage = { key, id: key, role: 'user', content, local: true };
    return run(chatId, learnStreamPath.message(chatId), { method: 'POST', body: JSON.stringify({ content }) }, [...messages, user], key);
  };

  const edit = (chatId: string, messageId: string, content: string) => {
    const index = messages.findIndex((item) => item.id === messageId);
    if (index === -1) return;
    const thread = [...messages.slice(0, index), { ...messages[index], content }];
    return run(chatId, learnStreamPath.edit(chatId, messageId), { method: 'PATCH', body: JSON.stringify({ content }) }, thread, messages[index].key);
  };

  const regenerate = (chatId: string) => {
    const index = messages.map((item) => item.role).lastIndexOf('user');
    if (index === -1) return;
    return run(chatId, learnStreamPath.regenerate(chatId), { method: 'POST' }, messages.slice(0, index + 1), messages[index].key);
  };

  const stop = () => controllerRef.current?.abort();

  return { messages, streaming, send, edit, regenerate, stop };
}
