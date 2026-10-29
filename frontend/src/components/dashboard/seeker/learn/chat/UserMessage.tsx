'use client';

import { useState } from 'react';
import type { ThreadMessage } from '@/types/learn';
import { EditMessageForm } from './EditMessageForm';
import { MessageActions } from './MessageActions';

interface UserMessageProps {
  message: ThreadMessage;
  isLast: boolean;
  canEdit: boolean;
  onEdit: (messageId: string, content: string) => void;
}

export function UserMessage({ message, isLast, canEdit, onEdit }: UserMessageProps) {
  const { id, content } = message;
  const [editing, setEditing] = useState(false);

  return (
    <div className="learning-msg" data-role="user">
      <div className="learning-msg__body">
        {editing ? (
          <EditMessageForm
            initialContent={content}
            onCancel={() => setEditing(false)}
            onSubmit={(next) => {
              setEditing(false);
              onEdit(id, next);
            }}
          />
        ) : (
          <>
            <div className="learning-msg__user-text">{content}</div>
            <MessageActions content={content} visible={isLast} onEdit={canEdit ? () => setEditing(true) : undefined} />
          </>
        )}
      </div>
    </div>
  );
}
