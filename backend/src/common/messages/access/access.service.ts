import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Role } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FALLBACK_NAME = 'Chakri user';
const CHAT_ROLES: Role[] = ['SEEKER', 'RECRUITER'];

export const PEER_SELECT = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  role: true,
  seekerProfile: { select: { headline: true } },
  company: { select: { name: true, username: true, logoUrl: true } },
} satisfies Prisma.UserSelect;

export type PeerRow = Prisma.UserGetPayload<{ select: typeof PEER_SELECT }>;

export interface ChatUser {
  id: string;
  role: Role | null;
}

export const ACTIVE_CHAT_USER = {
  isBanned: false,
  onboardingCompleted: true,
  role: { in: CHAT_ROLES },
} satisfies Prisma.UserWhereInput;

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async findPeer(viewerId: string, handle: string) {
    const key = handle.trim().toLowerCase();
    const peer = await this.prisma.user.findFirst({
      where: {
        ...ACTIVE_CHAT_USER,
        id: { not: viewerId },
        OR: UUID_PATTERN.test(key) ? [{ id: key }] : [{ username: key }, { company: { username: key } }],
      },
      select: PEER_SELECT,
    });
    if (!peer) throw new NotFoundException('User not found');
    return peer;
  }

  async findRecipient(senderId: string, recipientId: string) {
    const recipient = await this.prisma.user.findFirst({
      where: { ...ACTIVE_CHAT_USER, id: recipientId, NOT: { id: senderId } },
      select: PEER_SELECT,
    });
    if (!recipient) throw new NotFoundException('User not found');
    return recipient;
  }

  canStart(senderRole: Role | null, recipientRole: Role | null) {
    if (senderRole === 'RECRUITER') return true;
    return senderRole === 'SEEKER' && recipientRole === 'SEEKER';
  }

  presenceVisible(viewerRole: Role | null, peerRole: Role | null, viewerCanSend: boolean) {
    return !(viewerRole === 'SEEKER' && peerRole === 'RECRUITER' && !viewerCanSend);
  }

  controlsReplies(viewerRole: Role | null, peerRole: Role | null) {
    return viewerRole === 'RECRUITER' && peerRole === 'SEEKER';
  }
}

export function pairKeyOf(userA: string, userB: string) {
  return [userA, userB].sort().join(':');
}

export function peerSummary(peer: PeerRow) {
  const { id, name, username, avatarUrl, role, seekerProfile, company } = peer;
  const isRecruiter = role === 'RECRUITER';

  return {
    id,
    name: name?.trim() || username || company?.name || FALLBACK_NAME,
    username: username ?? company?.username ?? null,
    avatarUrl: avatarUrl ?? (isRecruiter ? (company?.logoUrl ?? null) : null),
    role: isRecruiter ? ('RECRUITER' as const) : ('SEEKER' as const),
    subtitle: isRecruiter ? (company?.name ?? 'Recruiter') : seekerProfile?.headline?.trim() || 'Job Seeker',
  };
}
