'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArrowUp, File as FileIcon, Mic, Square } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';
import type { LearnMode } from '@/types/learn';
import { ModeSelector } from './ModeSelector';
import { ModelSelector } from './ModelSelector';

const MESSAGE_MAX_LENGTH = 8000;
const MAX_TEXTAREA_HEIGHT = 200;
const ATTACH_UNAVAILABLE = 'File attachments are coming soon.';
const VOICE_UNAVAILABLE = 'Voice input is coming soon.';

const MODE_PLACEHOLDERS: Record<LearnMode, string> = {
  fast: 'Ask anything…',
  thinking: 'Ask something complex — I’ll reason through it step by step…',
  expert: 'Ask in depth — thorough, expert-level answers…',
};

interface ComposerProps {
  streaming: boolean;
  disabled: boolean;
  hasMessages: boolean;
  onSend: (content: string) => Promise<boolean>;
  onStop: () => void;
}

export function Composer({ streaming, disabled, hasMessages, onSend, onStop }: ComposerProps) {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<LearnMode>('fast');
  const [notice, setNotice] = useState<{ message: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = Boolean(content.trim()) && !streaming && !disabled;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [content]);

  const placeholder = streaming
    ? 'Generating… you can draft your next message'
    : hasMessages
      ? 'Ask a follow-up…'
      : MODE_PLACEHOLDERS[mode];

  const submit = async () => {
    const text = content.trim();
    if (!canSend) return;
    setContent('');
    textareaRef.current?.focus();
    if (!(await onSend(text))) setContent(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className="learning-composer">
      <FormAlert message={notice?.message} trigger={notice} />
      <div className="learning-composer__frame">
        <div className="learning-composer__card" data-generating={streaming ? 'true' : 'false'}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MESSAGE_MAX_LENGTH}
            placeholder={placeholder}
            aria-label="Message"
            className="learning-composer__textarea"
            autoFocus
          />

          <div className="learning-composer__row">
            <div className="learning-composer__tools">
              <button
                type="button"
                className="learning-composer__util"
                aria-label="Attach files"
                title="Attach files"
                disabled={disabled}
                onClick={() => setNotice({ message: ATTACH_UNAVAILABLE })}
              >
                <FileIcon size={17} strokeWidth={1.75} />
              </button>
              <ModeSelector value={mode} onChange={setMode} disabled={streaming} />
            </div>

            <div className="learning-composer__actions">
              <ModelSelector disabled={streaming} />
              <button
                type="button"
                className="learning-composer__util"
                aria-label="Start voice input"
                title="Voice input"
                disabled={disabled}
                onClick={() => setNotice({ message: VOICE_UNAVAILABLE })}
              >
                <Mic size={17} strokeWidth={1.75} />
              </button>
              {streaming ? (
                <button type="button" onClick={onStop} className="learning-composer__stop" aria-label="Stop generating" title="Stop generating">
                  <Square size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!canSend}
                  className="learning-composer__send"
                  aria-label="Send message"
                  title="Send · Enter"
                >
                  <ArrowUp size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="learning-composer__hint">AI can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}
