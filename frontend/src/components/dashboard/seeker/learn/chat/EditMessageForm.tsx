'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const MESSAGE_MAX_LENGTH = 8000;
const MAX_TEXTAREA_HEIGHT = 200;

interface EditMessageFormProps {
  initialContent: string;
  onCancel: () => void;
  onSubmit: (content: string) => void;
}

export function EditMessageForm({ initialContent, onCancel, onSubmit }: EditMessageFormProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = content.trim();
  const canSubmit = Boolean(trimmed) && trimmed !== initialContent;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [content]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') onCancel();
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSubmit) onSubmit(trimmed);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit(trimmed);
      }}
      className="learning-composer__card w-full"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={MESSAGE_MAX_LENGTH}
        aria-label="Edit message"
        autoFocus
        onFocus={(event) => event.target.setSelectionRange(event.target.value.length, event.target.value.length)}
        className="learning-composer__textarea"
      />
      <div className="learning-composer__row justify-end gap-2">
        <button type="button" onClick={onCancel} className="user-modal__btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={!canSubmit} className="learning-composer__send w-auto! px-4">
          Send
        </button>
      </div>
    </form>
  );
}
