'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { SendHorizontal } from 'lucide-react';

const MESSAGE_MAX_LENGTH = 4000;
const TYPING_THROTTLE_MS = 2_500;
const TYPING_IDLE_MS = 3_000;
const MAX_HEIGHT_PX = 140;

interface ComposerProps {
  peerName: string;
  onSend: (body: string) => void;
  onTyping: (typing: boolean) => void;
}

export function Composer({ peerName, onSend, onTyping }: ComposerProps) {
  const [body, setBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingRef = useRef({ active: false, sentAt: 0, idle: null as ReturnType<typeof setTimeout> | null });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [body]);

  useEffect(() => {
    const typing = typingRef.current;
    return () => {
      if (typing.idle) clearTimeout(typing.idle);
      if (typing.active) onTyping(false);
    };
  }, [onTyping]);

  const stopTyping = () => {
    const typing = typingRef.current;
    if (typing.idle) clearTimeout(typing.idle);
    typing.idle = null;
    if (typing.active) {
      typing.active = false;
      onTyping(false);
    }
  };

  const handleChange = (value: string) => {
    setBody(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }

    const typing = typingRef.current;
    const now = Date.now();
    if (!typing.active || now - typing.sentAt > TYPING_THROTTLE_MS) {
      typing.active = true;
      typing.sentAt = now;
      onTyping(true);
    }
    if (typing.idle) clearTimeout(typing.idle);
    typing.idle = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    onSend(text);
    setBody('');
    stopTyping();
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const canSubmit = Boolean(body.trim());

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex shrink-0 items-end gap-2 border-t border-[#e4e5e8] bg-white px-3 py-2.5 sm:px-4"
    >
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={stopTyping}
        rows={1}
        maxLength={MESSAGE_MAX_LENGTH}
        placeholder={`Message ${peerName}`}
        aria-label={`Message ${peerName}`}
        className="max-h-[140px] min-h-10 flex-1 resize-none rounded-[20px] bg-[#f1f2f4] px-4 py-2.5 text-[14.5px] leading-[1.35] text-[#18191c] outline-none placeholder:text-[#9199a3] focus:bg-white focus:ring-2 focus:ring-[#0a65cc]/30"
        autoFocus
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a65cc] text-white transition hover:bg-[#084f9e] active:scale-95 disabled:bg-[#e4e5e8] disabled:text-[#9199a3]"
        aria-label="Send message"
      >
        <SendHorizontal size={18} aria-hidden />
      </button>
    </form>
  );
}
