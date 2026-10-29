import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import { AccessService, pairKeyOf } from '../access/access.service.js';
import type { ChatUser } from '../access/access.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { ListMessagesDto } from './dto/list-messages.dto.js';

const MESSAGES_PAGE_SIZE = 40;
const SEND_LIMIT = { max: 30, windowSeconds: 10 };

export const MESSAGE_SELECT = {
  id: true,
  conversationId: true,
  senderId: true,
  clientId: true,
  body: true,
  kind: true,
  metadata: true,
  createdAt: true,
} satisfies Prisma.MessageSelect;

export type MessageRow = Prisma.MessageGetPayload<{ select: typeof MESSAGE_SELECT }>;

export interface ReceiptChange {
  conversationId: string;
  userId: string;
  peerId: string;
  deliveredAt: Date | null;
  readAt: Date | null;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly rateLimit: RateLimitService,
  ) {}

  async send(sender: ChatUser, dto: SendMessageDto) {
    const { recipientId, clientId, body } = dto;
    await this.rateLimit.consume(`chat:send:${sender.id}`, SEND_LIMIT);

    const duplicate = await this.findByClientId(sender.id, clientId);
    if (duplicate) return { message: duplicate, recipientId, isNewConversation: false };

    const recipient = await this.access.findRecipient(sender.id, recipientId);
    const pairKey = pairKeyOf(sender.id, recipient.id);
    const existing = await this.prisma.conversation.findUnique({
      where: { pairKey },
      select: { id: true, members: { where: { userId: sender.id }, select: { canSend: true } } },
    });

    if (existing ? !existing.members[0]?.canSend : !this.access.canStart(sender.role, recipient.role)) {
      throw new ForbiddenException('You can’t reply to this conversation');
    }

    const now = new Date();
    try {
      const message = await this.prisma.$transaction(async (tx) => {
        const { id: conversationId } = await tx.conversation.upsert({
          where: { pairKey },
          create: { pairKey, members: { create: [{ userId: sender.id }, { userId: recipient.id }] } },
          update: {},
          select: { id: true },
        });
        const created = await tx.message.create({
          data: { conversationId, senderId: sender.id, clientId, body, createdAt: now },
          select: MESSAGE_SELECT,
        });
        await tx.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } });
        await tx.conversationMember.update({
          where: { conversationId_userId: { conversationId, userId: sender.id } },
          data: { lastReadAt: now, lastDeliveredAt: now },
        });
        return created;
      });
      return { message, recipientId: recipient.id, isNewConversation: !existing };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const message = await this.findByClientId(sender.id, clientId);
        if (message) return { message, recipientId: recipient.id, isNewConversation: false };
      }
      throw error;
    }
  }

  async list(userId: string, conversationId: string, dto: ListMessagesDto) {
    const { before } = dto;
    const member = await this.memberOf(userId, conversationId);
    const cursor = before ? await this.prisma.message.findFirst({ where: { id: before, conversationId }, select: { createdAt: true } }) : null;

    const rows = await this.prisma.message.findMany({
      where: {
        conversationId,
        createdAt: {
          ...(member.clearedAt && { gt: member.clearedAt }),
          ...(cursor && { lt: cursor.createdAt }),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: MESSAGES_PAGE_SIZE + 1,
      select: MESSAGE_SELECT,
    });

    return {
      items: rows.slice(0, MESSAGES_PAGE_SIZE).reverse(),
      hasMore: rows.length > MESSAGES_PAGE_SIZE,
    };
  }

  async markRead(userId: string, conversationId: string): Promise<ReceiptChange> {
    await this.memberOf(userId, conversationId);
    const now = new Date();
    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: now, lastDeliveredAt: now },
    });
    return { conversationId, userId, peerId: await this.peerOf(userId, conversationId), deliveredAt: now, readAt: now };
  }

  async markDelivered(userId: string, conversationId: string): Promise<ReceiptChange> {
    const member = await this.memberOf(userId, conversationId);
    const now = new Date();
    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastDeliveredAt: now },
    });
    return { conversationId, userId, peerId: await this.peerOf(userId, conversationId), deliveredAt: now, readAt: member.lastReadAt };
  }

  async markAllDelivered(userId: string): Promise<ReceiptChange[]> {
    const now = new Date();
    const rows = await this.prisma.$queryRaw<{ conversation_id: string; last_read_at: Date | null }[]>`
      UPDATE conversation_members AS cm
      SET last_delivered_at = ${now}
      FROM conversations AS c
      WHERE cm.conversation_id = c.id
        AND cm.user_id = ${userId}
        AND c.last_message_at IS NOT NULL
        AND (cm.last_delivered_at IS NULL OR cm.last_delivered_at < c.last_message_at)
      RETURNING cm.conversation_id, cm.last_read_at
    `;
    if (!rows.length) return [];

    const peers = await this.prisma.conversationMember.findMany({
      where: { conversationId: { in: rows.map((row) => row.conversation_id) }, userId: { not: userId } },
      select: { conversationId: true, userId: true },
    });
    const peerByConversation = new Map(peers.map((peer) => [peer.conversationId, peer.userId]));

    return rows.flatMap(({ conversation_id: conversationId, last_read_at: readAt }) => {
      const peerId = peerByConversation.get(conversationId);
      return peerId ? [{ conversationId, userId, peerId, deliveredAt: now, readAt }] : [];
    });
  }

  async assertCanType(userId: string, conversationId: string) {
    const member = await this.memberOf(userId, conversationId);
    if (!member.canSend) throw new ForbiddenException('You can’t reply to this conversation');
    return this.peerOf(userId, conversationId);
  }

  private async memberOf(userId: string, conversationId: string) {
    const member = await this.prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
      select: { canSend: true, clearedAt: true, lastReadAt: true },
    });
    if (!member) throw new NotFoundException('Conversation not found');
    return member;
  }

  private async peerOf(userId: string, conversationId: string) {
    const peer = await this.prisma.conversationMember.findFirstOrThrow({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true },
    });
    return peer.userId;
  }

  private findByClientId(senderId: string, clientId: string) {
    return this.prisma.message.findUnique({
      where: { senderId_clientId: { senderId, clientId } },
      select: MESSAGE_SELECT,
    });
  }
}
