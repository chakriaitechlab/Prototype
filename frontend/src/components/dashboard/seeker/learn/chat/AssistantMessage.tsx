'use client';

import type { ThreadMessage } from '@/types/learn';
import { LearningChatIcon } from '../../LearningChatIcon';
import { Markdown } from './Markdown';
import { MessageActions } from './MessageActions';

interface AssistantMessageProps {
  message: ThreadMessage;
  isLast: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
}

export function AssistantMessage({ message, isLast, canRegenerate, onRegenerate }: AssistantMessageProps) {
  const { content, streaming } = message;

  return (
    <div className="learning-msg" data-role="assistant">
      <span className="learning-msg__avatar" data-role="assistant">
        <LearningChatIcon size={18} />
      </span>
      <div className="learning-msg__body">
        {content ? (
          <>
            <Markdown content={content} streaming={streaming} />
            {streaming ? (
              <div className="learning-msg__footer" aria-hidden="true" />
            ) : (
              <MessageActions content={content} visible={isLast} onRegenerate={canRegenerate ? onRegenerate : undefined} />
            )}
          </>
        ) : (
          <div className="learning-msg__thinking">
            <span className="learning-msg__dot" />
            <span className="learning-msg__dot" />
            <span className="learning-msg__dot" />
            <span className="learning-msg__thinking-label">Thinking…</span>
          </div>
        )}
      </div>
    </div>
  );
}
