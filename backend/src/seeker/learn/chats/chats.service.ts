import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import type { CreateChatDto } from './dto/create-chat.dto.js';
import type { RenameChatDto } from './dto/rename-chat.dto.js';

const CHAT_SELECT = { id: true, title: true, createdAt: true, updatedAt: true } as const;
const MESSAGE_SELECT = { id: true, role: true, content: true, createdAt: true } as const;

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const chats = await this.prisma.learnChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { ...CHAT_SELECT, _count: { select: { messages: true } } },
    });

    return chats.map(({ _count, ...chat }) => ({ ...chat, messageCount: _count.messages }));
  }

  create(userId: string, dto: CreateChatDto) {
    const { title } = dto;

    return this.prisma.learnChat.create({
      data: { userId, title },
      select: CHAT_SELECT,
    });
  }

  async get(userId: string, chatId: string) {
    const chat = await this.prisma.learnChat.findFirst({
      where: { id: chatId, userId },
      select: { ...CHAT_SELECT, messages: { orderBy: { createdAt: 'asc' }, select: MESSAGE_SELECT } },
    });
    if (!chat) throw new NotFoundException('Chat not found');

    return chat;
  }

  async rename(userId: string, chatId: string, dto: RenameChatDto) {
    const { title } = dto;
    await this.assertOwner(userId, chatId);

    return this.prisma.learnChat.update({
      where: { id: chatId },
      data: { title },
      select: CHAT_SELECT,
    });
  }

  async remove(userId: string, chatId: string) {
    const { count } = await this.prisma.learnChat.deleteMany({ where: { id: chatId, userId } });
    if (count === 0) throw new NotFoundException('Chat not found');

    return { message: 'Chat deleted' };
  }

  private async assertOwner(userId: string, chatId: string) {
    const chat = await this.prisma.learnChat.findFirst({ where: { id: chatId, userId }, select: { id: true } });
    if (!chat) throw new NotFoundException('Chat not found');
  }
}
