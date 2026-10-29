import type { ChatPeer } from '@/types/messages';
import { PeerAvatar } from '../PeerAvatar';

export function ChatIntro({ peer, canSend }: { peer: ChatPeer; canSend: boolean }) {
  return (
    <div className="flex flex-col items-center px-4 pb-6 pt-10 text-center">
      <PeerAvatar peer={peer} size="lg" />
      <h2 className="mt-3 text-lg font-bold text-[#18191c]">{peer.name}</h2>
      <p className="text-sm text-[#5e6670]">{peer.subtitle}</p>
      {peer.username && <p className="mt-0.5 text-xs text-[#767f8c]">@{peer.username}</p>}
      {canSend && <p className="mt-4 text-xs text-[#767f8c]">Say hi and start the conversation.</p>}
    </div>
  );
}
