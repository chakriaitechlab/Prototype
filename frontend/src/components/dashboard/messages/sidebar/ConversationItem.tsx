import Link from 'next/link';
import type { ChatThread } from '@/types/messages';
import { listTime, messagePreview, messageStatus } from '@/utils/messages';
import { MessageTicks } from '../chat/MessageTicks';
import { PeerAvatar } from '../PeerAvatar';

interface ConversationItemProps {
  conversation: ChatThread;
  href: string;
  meId: string;
  active: boolean;
  typing: boolean;
  now: number;
}

export function ConversationItem({ conversation, href, meId, active, typing, now }: ConversationItemProps) {
  const { peer, presence, lastMessage, unreadCount } = conversation;
  const unread = unreadCount > 0;
  const ownLast = lastMessage?.senderId === meId;

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${active ? 'bg-[#e7f0fa]' : 'hover:bg-[#f4f5f7]'}`}
    >
      <PeerAvatar peer={peer} presence={presence} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`truncate text-[14.5px] ${unread ? 'font-bold text-[#18191c]' : 'font-semibold text-[#18191c]'}`}>{peer.name}</p>
          {lastMessage && (
            <span className={`shrink-0 text-[11.5px] ${unread ? 'font-semibold text-[#0a65cc]' : 'text-[#767f8c]'}`} suppressHydrationWarning>
              {listTime(lastMessage.createdAt, now)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {ownLast && !typing && lastMessage && <MessageTicks status={messageStatus(lastMessage, conversation)} />}
          <p className={`min-w-0 flex-1 truncate text-[13px] ${typing ? 'italic text-[#0a65cc]' : unread ? 'font-semibold text-[#18191c]' : 'text-[#5e6670]'}`}>
            {typing ? 'typing…' : lastMessage ? messagePreview(conversation, meId) : 'New message'}
          </p>
          {unread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#0a65cc] px-1.5 text-[11px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
