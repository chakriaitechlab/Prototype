import { UserAvatar } from '@/components/ui/UserAvatar';
import type { ChatPeer, ChatPresence } from '@/types/messages';
import { PresenceDot } from './PresenceDot';

const SIZES = {
  sm: { avatar: 'h-10 w-10 text-sm', dot: 'bottom-0 right-0 h-3 w-3' },
  md: { avatar: 'h-12 w-12 text-base', dot: 'bottom-0.5 right-0.5 h-3.5 w-3.5' },
  lg: { avatar: 'h-20 w-20 text-2xl', dot: 'bottom-1 right-1 h-4 w-4' },
};

interface PeerAvatarProps {
  peer: Pick<ChatPeer, 'name' | 'avatarUrl'>;
  presence?: ChatPresence | null;
  size?: keyof typeof SIZES;
}

export function PeerAvatar({ peer, presence, size = 'md' }: PeerAvatarProps) {
  const { avatar, dot } = SIZES[size];

  return (
    <span className="relative inline-flex shrink-0">
      <UserAvatar
        src={peer.avatarUrl}
        name={peer.name}
        className={`${avatar} rounded-full border border-[#e4e5e8] font-bold`}
        fallbackClassName="bg-[#e7f0fa] text-[#0a65cc]"
      />
      <PresenceDot online={Boolean(presence?.online)} className={dot} />
    </span>
  );
}
