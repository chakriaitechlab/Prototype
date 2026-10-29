'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { deleteChatAction } from '@/actions/learn.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { LearnChat } from '@/types/learn';
import { learnChatPath, togglePinnedChat } from '@/utils/learn';
import { useLearn } from '../LearnShell';
import { DeleteChatDialog } from './DeleteChatDialog';

const MENU_WIDTH = 160;
const MENU_EST_HEIGHT = 120;

interface ChatItemMenuProps {
  chat: LearnChat;
  pinned: boolean;
  onRename: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ChatItemMenu({ chat, pinned, onRename, onOpenChange }: ChatItemMenuProps) {
  const { id, title } = chat;
  const { remove, startNewChat } = useLearn();
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setOpen = (pos: typeof menuPos) => {
    setMenuPos(pos);
    onOpenChange(Boolean(pos));
  };

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const up = rect.bottom + MENU_EST_HEIGHT > window.innerHeight;
    const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
    setOpen({ top: up ? rect.top - 6 : rect.bottom + 6, left, up });
  };

  useEffect(() => {
    if (!menuPos) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();

    const close = () => {
      setMenuPos(null);
      onOpenChange(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      close();
      buttonRef.current?.focus();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menuPos, onOpenChange]);

  const onMenuKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const runAction = (action: () => void) => {
    setOpen(null);
    action();
  };

  const confirmDelete = () => {
    startTransition(async () => {
      const result = await deleteChatAction(id);
      if (!result.data) {
        setAlert({ message: result.error });
        return;
      }
      setDeleting(false);
      remove(id);
      if (window.location.pathname === learnChatPath(id)) startNewChat();
    });
  };

  return (
    <>
      <FormAlert message={alert?.message} trigger={alert} />
      <button
        ref={buttonRef}
        type="button"
        className="learning-convo__menu-btn"
        aria-label={`Options for ${title}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(menuPos)}
        onClick={() => (menuPos ? setOpen(null) : openMenu())}
      >
        <MoreHorizontal size={15} />
      </button>

      {menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className="learning-convo-menu"
            role="menu"
            aria-label={`Actions for ${title}`}
            style={{ top: menuPos.top, left: menuPos.left, transform: menuPos.up ? 'translateY(-100%)' : undefined }}
            onKeyDown={onMenuKeyDown}
          >
            <button type="button" role="menuitem" className="learning-convo-menu__item" onClick={() => runAction(() => togglePinnedChat(id))}>
              {pinned ? <PinOff size={14} /> : <Pin size={14} />}
              {pinned ? 'Unpin' : 'Pin'}
            </button>
            <button type="button" role="menuitem" className="learning-convo-menu__item" onClick={() => runAction(onRename)}>
              <Pencil size={14} />
              Rename
            </button>
            <div className="learning-convo-menu__divider" role="separator" />
            <button
              type="button"
              role="menuitem"
              className="learning-convo-menu__item learning-convo-menu__item--danger"
              onClick={() => runAction(() => setDeleting(true))}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>,
          document.body,
        )}

      {deleting && <DeleteChatDialog title={title} pending={pending} onConfirm={confirmDelete} onClose={() => setDeleting(false)} />}
    </>
  );
}
