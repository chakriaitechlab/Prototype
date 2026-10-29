'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import type { AgentSessionStatus } from '@/types/agent';

const MESSAGE_MAX_LENGTH = 4000;
const MAX_TEXTAREA_HEIGHT = 180;

interface ChatComposerProps {
  status: AgentSessionStatus | null;
  onSend: (message: string) => Promise<boolean>;
  onStop: () => Promise<void>;
}

export function ChatComposer({ status, onSend, onStop }: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const running = status === 'RUNNING';
  const waiting = status === 'WAITING_INPUT';
  const canSend = Boolean(message.trim()) && !running && !pending;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [message]);

  const placeholder = waiting
    ? 'Answer the agent…'
    : running
      ? 'The agent is working… you can stop it anytime'
      : status
        ? 'Ask a follow-up or give a new task…'
        : 'Ask anything, or give the agent a task to do on the web…';

  const submit = async () => {
    const text = message.trim();
    if (!canSend) return;
    setPending(true);
    setMessage('');
    if (!(await onSend(text))) setMessage(text);
    setPending(false);
    textareaRef.current?.focus();
  };

  const stop = async () => {
    setPending(true);
    await onStop();
    setPending(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="px-4 pt-2 pb-4 sm:px-6">
      <div
        className={`mx-auto flex max-w-3xl items-end gap-2 rounded-[28px] border bg-white py-2 pr-2 pl-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-colors ${waiting ? 'border-[#f5c46b]' : 'border-[#e4e5e8] focus-within:border-[#0a65cc]'}`}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder={placeholder}
          aria-label="Message the agent"
          className="max-h-[180px] min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-[#18191c] outline-none placeholder:text-[#9199a3]"
          autoFocus
        />
        {(running || waiting) && (
          <button
            type="button"
            onClick={() => void stop()}
            disabled={pending}
            aria-label="Stop the agent"
            title="Stop"
            className="cursor-pointer disabled:cursor-not-allowed flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18191c] text-white transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            <Square size={13} fill="currentColor" />
          </button>
        )}
        {!running && (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSend}
            aria-label="Send message"
            title="Send · Enter"
            className="cursor-pointer disabled:cursor-not-allowed flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a65cc] text-white transition-colors hover:bg-[#094e9f] disabled:bg-[#cee0f5]"
          >
            <ArrowUp size={17} />
          </button>
        )}
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-[#9199a3]">
        The agent works in its own browser and never submits applications or payments for you.
      </p>
    </div>
  );
}
