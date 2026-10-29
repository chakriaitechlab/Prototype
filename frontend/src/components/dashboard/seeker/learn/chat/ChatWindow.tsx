'use client';

import { useCallback, useState } from 'react';
import { createChatAction } from '@/actions/learn.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import { useLearnStream } from '@/hooks/useLearnStream';
import type { LearnChatDetail } from '@/types/learn';
import { learnChatPath } from '@/utils/learn';
import { useLearn } from '../LearnShell';
import { Composer } from '../composer/Composer';
import { MessageList } from './MessageList';

export function ChatWindow({ initialChat }: { initialChat: LearnChatDetail | null }) {
  const { upsert, patch } = useLearn();
  const [chatId, setChatId] = useState(initialChat?.id ?? null);
  const [starting, setStarting] = useState(false);
  const [alert, setAlert] = useState<{ message: string } | null>(null);

  const showError = useCallback((message: string) => setAlert({ message }), []);
  const onTitle = useCallback((id: string, title: string) => patch(id, { title }), [patch]);
  const { messages, streaming, send, edit, regenerate, stop } = useLearnStream({
    initialMessages: initialChat?.messages ?? [],
    onTitle,
    onError: showError,
  });

  const touch = (id: string, added: number) =>
    patch(id, { updatedAt: new Date().toISOString(), messageCount: messages.filter((item) => !item.streaming).length + added });

  const handleSend = async (content: string) => {
    let id = chatId;
    if (!id) {
      setStarting(true);
      const result = await createChatAction();
      setStarting(false);
      if (!result.data) {
        showError(result.error);
        return false;
      }
      id = result.data.id;
      setChatId(id);
      upsert(result.data);
      window.history.replaceState(null, '', learnChatPath(id));
    }
    touch(id, 2);
    void send(id, content);
    return true;
  };

  const handleEdit = (messageId: string, content: string) => {
    if (!chatId) return;
    const index = messages.findIndex((item) => item.id === messageId);
    patch(chatId, { updatedAt: new Date().toISOString(), messageCount: index + 2 });
    void edit(chatId, messageId, content);
  };

  const handleRegenerate = () => {
    if (!chatId) return;
    patch(chatId, { updatedAt: new Date().toISOString() });
    void regenerate(chatId);
  };

  const landing = !messages.length && !streaming;

  return (
    <div className={`learning-shell__main${landing ? ' is-empty-landing' : ''}`}>
      <FormAlert message={alert?.message} trigger={alert} />
      <MessageList messages={messages} streaming={streaming} onEdit={handleEdit} onRegenerate={handleRegenerate} />
      <Composer
        streaming={streaming}
        disabled={starting}
        hasMessages={messages.length > 0}
        onSend={handleSend}
        onStop={stop}
      />
    </div>
  );
}
