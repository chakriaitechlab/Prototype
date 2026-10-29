'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Pin, X } from 'lucide-react';
import { renameChatAction } from '@/actions/learn.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { LearnChat } from '@/types/learn';
import { learnChatPath, relativeTime } from '@/utils/learn';
import { useLearn } from '../LearnShell';
import { ChatItemMenu } from './ChatItemMenu';

interface ChatItemProps {
  chat: LearnChat;
  active: boolean;
  pinned: boolean;
  now: number;
}

export function ChatItem({ chat, active, pinned, now }: ChatItemProps) {
  const { id, title, updatedAt, messageCount = 0 } = chat;
  const { patch, closeSidebar } = useLearn();
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [alert, setAlert] = useState<{ message: string } | null>(null);
  const [, startTransition] = useTransition();

  const rootClass = `learning-convo${active ? ' is-active' : ''}`;

  const startRename = () => {
    setRenameValue(title);
    setRenaming(true);
  };

  const commitRename = () => {
    const next = renameValue.trim();
    setRenaming(false);
    if (!next || next === title) return;

    patch(id, { title: next });
    startTransition(async () => {
      const result = await renameChatAction(id, next);
      if (result.data) return;
      patch(id, { title });
      setAlert({ message: result.error });
    });
  };

  return (
    <>
      <FormAlert message={alert?.message} trigger={alert} />
      {renaming ? (
        <div className={rootClass} role="listitem">
          <div className="learning-convo__rename">
            <input
              autoFocus
              value={renameValue}
              maxLength={80}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitRename();
                if (event.key === 'Escape') setRenaming(false);
              }}
              aria-label="Chat name"
            />
            <button type="button" aria-label="Save name" onClick={commitRename}>
              <Check size={13} />
            </button>
            <button type="button" aria-label="Cancel rename" onClick={() => setRenaming(false)}>
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className={rootClass} role="listitem" data-menu-open={menuOpen ? 'true' : 'false'}>
          <Link
            href={learnChatPath(id)}
            onClick={closeSidebar}
            className="learning-convo__main"
            title={title}
            aria-current={active ? 'page' : undefined}
          >
            <span className="learning-convo__title">
              {pinned && <Pin size={12} className="learning-convo__pin" aria-hidden="true" />}
              <span className="learning-convo__title-text">{title}</span>
            </span>
            <span className="learning-convo__meta" suppressHydrationWarning>
              {relativeTime(updatedAt, now)}
              {messageCount > 0 && ` · ${messageCount} message${messageCount === 1 ? '' : 's'}`}
            </span>
          </Link>
          <ChatItemMenu chat={chat} pinned={pinned} onRename={startRename} onOpenChange={setMenuOpen} />
        </div>
      )}
    </>
  );
}
