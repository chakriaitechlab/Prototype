import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { AccessService, PEER_SELECT, pairKeyOf, peerSummary } from '../access/access.service.js';
import type { ChatUser, PeerRow } from '../access/access.service.js';
import { MESSAGE_SELECT } from '../chat/chat.service.js';
import type { MessageRow } from '../chat/chat.service.js';
import { PresenceService } from '../presence/presence.service.js';
import type { Presence } from '../presence/presence.service.js';
import { ListConversationsDto } from './dto/list-conversations.dto.js';
import { ReplyAccessDto } from './dto/reply-access.dto.js';

const CONVERSATIONS_PAGE_SIZE = 30;

const MEMBER_STATE_SELECT = {
  userId: true,
  canSend: true,
  lastDeliveredAt: true,
  lastReadAt: true,
  clearedAt: true,
} satisfies Prisma.ConversationMemberSelect;

const CONVERSATION_SELECT = {
  id: true,
  lastMessageAt: true,
  members: { select: { ...MEMBER_STATE_SELECT, user: { select: PEER_SELECT } } },
  messages: { orderBy: { createdAt: 'desc' }, take: 1, select: MESSAGE_SELECT },
} satisfies Prisma.ConversationSelect;

type ConversationRow = Prisma.ConversationGetPayload<{ select: typeof CONVERSATION_SELECT }>;

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly presence: PresenceService,
  ) {}

  async list(viewer: ChatUser, dto: ListConversationsDto) {
    const { cursor } = dto;
    const rows = await this.prisma.conversation.findMany({
      where: {
        members: { some: { userId: viewer.id } },
        lastMessageAt: cursor ? { lt: new Date(cursor) } : { not: null },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: CONVERSATIONS_PAGE_SIZE + 1,
      select: CONVERSATION_SELECT,
    });

    const page = rows.slice(0, CONVERSATIONS_PAGE_SIZE);
    const visible = page.filter((row) => !isCleared(row, viewer.id));
    const items = await this.toItems(viewer, visible);
    const last = page.at(-1);

    return {
      items,
      nextCursor: rows.length > CONVERSATIONS_PAGE_SIZE && last?.lastMessageAt ? last.lastMessageAt.toISOString() : null,
    };
  }

  async findOne(viewer: ChatUser, conversationId: string) {
    const row = await this.prisma.conversation.findFirst({
      where: { id: conversationId, members: { some: { userId: viewer.id } } },
      select: CONVERSATION_SELECT,
    });
    if (!row) throw new NotFoundException('Conversation not found');

    const [item] = await this.toItems(viewer, [row]);
    return item;
  }

  async peerView(viewer: ChatUser, handle: string) {
    const peer = await this.access.findPeer(viewer.id, handle);
    const row = await this.prisma.conversation.findUnique({
      where: { pairKey: pairKeyOf(viewer.id, peer.id) },
      select: CONVERSATION_SELECT,
    });

    if (row) {
      const [item] = await this.toItems(viewer, [row]);
      return item;
    }

    const canSend = this.access.canStart(viewer.role, peer.role);
    const presence = this.access.presenceVisible(viewer.role, peer.role, canSend) ? await this.presenceOf(peer.id) : null;

    return {
      id: null,
      peer: peerSummary(peer),
      presence,
      lastMessage: null,
      unreadCount: 0,
      canSend,
      replyAccess: null,
      peerDeliveredAt: null,
      peerReadAt: null,
    };
  }

  async unreadCount(userId: string) {
    const [row] = await this.prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT cm.conversation_id)::int AS count
      FROM conversation_members AS cm
      JOIN messages AS m
        ON m.conversation_id = cm.conversation_id
       AND m.sender_id <> cm.user_id
       AND m.created_at > COALESCE(GREATEST(cm.last_read_at, cm.cleared_at), '-infinity'::timestamp)
      WHERE cm.user_id = ${userId}
    `;
    return { count: row?.count ?? 0 };
  }

  async setReplyAccess(viewer: ChatUser, conversationId: string, dto: ReplyAccessDto) {
    const { allowed } = dto;
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId },
      select: { id: true, userId: true, user: { select: { role: true } } },
    });
    const self = members.find((member) => member.userId === viewer.id);
    const peer = members.find((member) => member.userId !== viewer.id);
    if (!self || !peer) throw new NotFoundException('Conversation not found');
    if (!this.access.controlsReplies(viewer.role, peer.user.role)) {
      throw new ForbiddenException('Only recruiters can change reply access for candidates');
    }

    await this.prisma.conversationMember.update({ where: { id: peer.id }, data: { canSend: allowed } });
    return { conversationId, peerId: peer.userId, replyAccess: allowed };
  }

  async clear(userId: string, conversationId: string) {
    const now = new Date();
    const { count } = await this.prisma.conversationMember.updateMany({
      where: { conversationId, userId },
      data: { clearedAt: now, lastReadAt: now },
    });
    if (count === 0) throw new NotFoundException('Conversation not found');
    return { conversationId, message: 'Chat deleted' };
  }

  async visiblePeerIds(viewer: ChatUser) {
    const rows = await this.prisma.conversationMember.findMany({
      where: { userId: viewer.id },
      select: {
        canSend: true,
        conversation: { select: { members: { where: { userId: { not: viewer.id } }, select: { userId: true, user: { select: { role: true } } } } } },
      },
    });

    return rows.flatMap(({ canSend, conversation }) => conversation.members.filter(({ user }) => this.access.presenceVisible(viewer.role, user.role, canSend)).map(({ userId }) => userId));
  }

  async canWatch(viewer: ChatUser, userId: string) {
    if (userId === viewer.id) return false;
    const peer = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!peer) return false;

    const self = await this.prisma.conversationMember.findFirst({
      where: { userId: viewer.id, conversation: { pairKey: pairKeyOf(viewer.id, userId) } },
      select: { canSend: true },
    });
    const canSend = self ? self.canSend : this.access.canStart(viewer.role, peer.role);
    return this.access.presenceVisible(viewer.role, peer.role, canSend);
  }

  async presenceOf(userId: string): Promise<Presence> {
    const snapshot = await this.presence.snapshot([userId]);
    return snapshot.get(userId) ?? { online: false, lastSeenAt: null };
  }

  private async toItems(viewer: ChatUser, rows: ConversationRow[]) {
    if (!rows.length) return [];

    const pairs = rows.flatMap((row) => {
      const self = row.members.find((member) => member.userId === viewer.id);
      const peer = row.members.find((member) => member.userId !== viewer.id);
      return self && peer ? [{ row, self, peer }] : [];
    });

    const [unread, presence] = await Promise.all([
      this.unreadByConversation(
        viewer.id,
        pairs.map(({ row }) => row.id),
      ),
      this.presence.snapshot(pairs.map(({ peer }) => peer.userId)),
    ]);

    return pairs.map(({ row, self, peer }) => {
      const peerUser: PeerRow = peer.user;
      const latest: MessageRow | undefined = row.messages[0];
      const visibleLatest = latest && (!self.clearedAt || latest.createdAt > self.clearedAt) ? latest : null;

      return {
        id: row.id,
        peer: peerSummary(peerUser),
        presence: this.access.presenceVisible(viewer.role, peerUser.role, self.canSend) ? (presence.get(peer.userId) ?? null) : null,
        lastMessage: visibleLatest,
        unreadCount: unread.get(row.id) ?? 0,
        canSend: self.canSend,
        replyAccess: this.access.controlsReplies(viewer.role, peerUser.role) ? peer.canSend : null,
        peerDeliveredAt: peer.lastDeliveredAt,
        peerReadAt: peer.lastReadAt,
      };
    });
  }

  private async unreadByConversation(userId: string, conversationIds: string[]) {
    if (!conversationIds.length) return new Map<string, number>();

    const rows = await this.prisma.$queryRaw<{ conversation_id: string; unread: number }[]>`
      SELECT cm.conversation_id, COUNT(m.id)::int AS unread
      FROM conversation_members AS cm
      JOIN messages AS m
        ON m.conversation_id = cm.conversation_id
       AND m.sender_id <> cm.user_id
       AND m.created_at > COALESCE(GREATEST(cm.last_read_at, cm.cleared_at), '-infinity'::timestamp)
      WHERE cm.user_id = ${userId}
        AND cm.conversation_id IN (${Prisma.join(conversationIds)})
      GROUP BY cm.conversation_id
    `;
    return new Map(rows.map(({ conversation_id, unread }) => [conversation_id, unread]));
  }
}

function isCleared(row: ConversationRow, userId: string) {
  const self = row.members.find((member) => member.userId === userId);
  return Boolean(self?.clearedAt && row.lastMessageAt && row.lastMessageAt <= self.clearedAt);
}
