import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { MessageKind, Prisma, Role } from '../../../../generated/prisma/client.js';
import { pairKeyOf } from '../access/access.service.js';
import { MESSAGE_SELECT } from '../chat/chat.service.js';
import type { MessageRow } from '../chat/chat.service.js';
import { MessagesGateway } from '../messages.gateway.js';

export interface SystemMessageInput {
  senderId: string;
  recipientId: string;
  kind: MessageKind;
  body: string;
  metadata: Prisma.InputJsonObject;
}

export interface SystemMessageResult {
  senderId: string;
  message: MessageRow;
  recipientId: string;
  isNewConversation: boolean;
}

@Injectable()
export class SystemMessagesService {
  constructor(private readonly gateway: MessagesGateway) {}

  async create(tx: Prisma.TransactionClient, input: SystemMessageInput): Promise<SystemMessageResult> {
    const { senderId, recipientId, kind, body, metadata } = input;
    const pairKey = pairKeyOf(senderId, recipientId);
    const now = new Date();

    const existing = await tx.conversation.findUnique({ where: { pairKey }, select: { id: true } });
    const { id: conversationId } = await tx.conversation.upsert({
      where: { pairKey },
      create: { pairKey, lastMessageAt: now, members: { create: [{ userId: senderId }, { userId: recipientId }] } },
      update: { lastMessageAt: now },
      select: { id: true },
    });
    const message = await tx.message.create({
      data: { conversationId, senderId, clientId: randomUUID(), body, kind, metadata, createdAt: now },
      select: MESSAGE_SELECT,
    });
    await tx.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId: senderId } },
      data: { lastReadAt: now, lastDeliveredAt: now },
    });

    return { senderId, message, recipientId, isNewConversation: !existing };
  }

  publish({ senderId, ...result }: SystemMessageResult, senderRole: Role) {
    return this.gateway.publishMessage({ id: senderId, role: senderRole }, result);
  }
}
