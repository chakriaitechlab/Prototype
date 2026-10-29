'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, MoreVertical, Trash2 } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import type { ChatThread } from '@/types/messages';
import { presenceLabel } from '@/utils/messages';
import { candidateProfilePath } from '@/utils/routes';
import { PeerAvatar } from '../PeerAvatar';
import { ReplyAccessToggle } from './ReplyAccessToggle';

const ITEM_CLASS = 'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60';

interface ChatHeaderProps {
  thread: ChatThread;
  backHref: string;
  peerTyping: boolean;
  replyPending: boolean;
  onToggleReplies: () => void;
  onDelete: () => void;
}

export function ChatHeader({ thread, backHref, peerTyping, replyPending, onToggleReplies, onDelete }: ChatHeaderProps) {
  const { id, peer, presence, replyAccess } = thread;
  const [menuOpen, setMenuOpen] = useState(false);
  const now = useNow();
  const close = () => setMenuOpen(false);

  const status = peerTyping ? 'typing…' : presenceLabel(presence, now);
  const profileHref = peer.role === 'SEEKER' && peer.username ? candidateProfilePath(peer.username) : null;
  const hasMenu = Boolean(profileHref || id);

  return (
    <header className="flex h-[64px] shrink-0 items-center gap-2 border-b border-[#e4e5e8] bg-white px-2 sm:px-4">
      <Link href={backHref} className="flex h-9 w-9 items-center justify-center rounded-full text-[#0a65cc] hover:bg-[#f1f2f4] md:hidden" aria-label="Back to chats">
        <ArrowLeft size={20} aria-hidden />
      </Link>

      <PeerAvatar peer={peer} presence={presence} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-tight text-[#18191c]">{peer.name}</p>
        <p className={`truncate text-xs ${peerTyping ? 'italic text-[#0a65cc]' : presence?.online ? 'text-[#31a24c]' : 'text-[#767f8c]'}`} suppressHydrationWarning>
          {status ?? peer.subtitle}
        </p>
      </div>

      {hasMenu && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Chat options"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#5e6670] hover:bg-[#f1f2f4]"
          >
            <MoreVertical size={18} aria-hidden />
          </button>

          {menuOpen && (
            <>
              <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={close} />
              <div className="absolute right-0 z-20 mt-1 w-48 border border-[#e4e5e8] bg-white py-1 shadow-md">
                {profileHref && (
                  <Link href={profileHref} onClick={close} className={ITEM_CLASS}>
                    <Eye size={15} aria-hidden />
                    View profile
                  </Link>
                )}
                {id && replyAccess !== null && (
                  <ReplyAccessToggle
                    replyAccess={replyAccess}
                    pending={replyPending}
                    className={ITEM_CLASS}
                    onToggle={() => {
                      close();
                      onToggleReplies();
                    }}
                  />
                )}
                {id && (
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onDelete();
                    }}
                    className={`${ITEM_CLASS} !text-red-600 hover:!bg-red-50`}
                  >
                    <Trash2 size={15} aria-hidden />
                    Delete chat
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
