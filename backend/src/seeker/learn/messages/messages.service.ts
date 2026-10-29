import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { LearnMessageRole } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { AiService, type AiMessage, type AiStream } from '../../../infrastructure/ai/ai.service.js';
import { ChatsService } from '../chats/chats.service.js';
import { CHAT_TITLE_MAX_LENGTH } from '../chats/dto/rename-chat.dto.js';
import type { SendMessageDto } from './dto/send-message.dto.js';
import type { EditMessageDto } from './dto/edit-message.dto.js';

const NEW_CHAT_TITLE = 'New chat';

const SYSTEM_PROMPT =
  'You are Chakri Learning AI, a friendly, intelligent tutor dedicated to job seekers, career development, coding, and interview preparation. Answer clearly, accurately, and encourage learning.';

const TITLE_PROMPT =
  'Summarize the user question into a concise title of exactly 2 to 3 words. Do not use quotes, punctuation, or any other words. Return ONLY the 2-3 word title.';

const MESSAGE_SELECT = { id: true, role: true, content: true, createdAt: true } as const;

interface HistoryMessage {
  id: string;
  role: LearnMessageRole;
  content: string;
}

type StreamEvent =
  | { type: 'message'; id: string; role: LearnMessageRole; content: string }
  | { type: 'delta'; content: string }
  | { type: 'title'; title: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly chatsService: ChatsService,
  ) {}

  async stream(userId: string, chatId: string, dto: SendMessageDto, res: Response) {
    const { content } = dto;
    const chat = await this.chatsService.get(userId, chatId);

    const userMessage = await this.saveMessage(chatId, LearnMessageRole.user, content);
    await this.streamReply(res, chatId, chat.messages, userMessage, chat.title === NEW_CHAT_TITLE);
  }

  async edit(userId: string, chatId: string, messageId: string, dto: EditMessageDto, res: Response) {
    const { content } = dto;
    const chat = await this.chatsService.get(userId, chatId);

    const index = chat.messages.findIndex((message) => message.id === messageId);
    if (index === -1) throw new NotFoundException('Message not found');
    if (chat.messages[index].role !== LearnMessageRole.user) {
      throw new BadRequestException('Only your own messages can be edited');
    }

    const [userMessage] = await this.prisma.$transaction([
      this.prisma.learnMessage.update({ where: { id: messageId }, data: { content }, select: MESSAGE_SELECT }),
      this.prisma.learnMessage.deleteMany({
        where: { id: { in: chat.messages.slice(index + 1).map((message) => message.id) } },
      }),
    ]);
    await this.streamReply(res, chatId, chat.messages.slice(0, index), userMessage, false);
  }

  async regenerate(userId: string, chatId: string, res: Response) {
    const chat = await this.chatsService.get(userId, chatId);

    const index = chat.messages.map((message) => message.role).lastIndexOf(LearnMessageRole.user);
    if (index === -1) throw new BadRequestException('There is no message to regenerate');

    await this.prisma.learnMessage.deleteMany({
      where: { id: { in: chat.messages.slice(index + 1).map((message) => message.id) } },
    });
    await this.streamReply(res, chatId, chat.messages.slice(0, index), chat.messages[index], false);
  }

  private async streamReply(
    res: Response,
    chatId: string,
    history: HistoryMessage[],
    question: HistoryMessage,
    withTitle: boolean,
  ) {
    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (event: StreamEvent) => {
      if (!res.writableEnded && !res.destroyed) res.write(`${JSON.stringify(event)}\n`);
    };

    send({ type: 'message', id: question.id, role: question.role, content: question.content });

    const titleTask = withTitle
      ? this.generateTitle(chatId, question.content).then((title) => title && send({ type: 'title', title }))
      : Promise.resolve();

    let stream: AiStream | null = null;
    let clientGone = false;
    res.on('close', () => {
      if (res.writableFinished) return;
      clientGone = true;
      stream?.abort();
    });

    let reply = '';
    try {
      stream = await this.aiService.stream(this.buildPrompt(history, question.content));
      for await (const token of stream) {
        reply += token;
        send({ type: 'delta', content: token });
      }
    } catch (error) {
      if (!clientGone) {
        this.logger.error(`❌ Learn stream failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    reply = reply.trim();
    if (reply) {
      const assistantMessage = await this.saveMessage(chatId, LearnMessageRole.assistant, reply);
      send({ type: 'message', ...assistantMessage });
    } else if (!clientGone) {
      send({ type: 'error', message: 'AI service is currently unavailable. Please try again.' });
    }

    await titleTask;
    send({ type: 'done' });
    res.end();
  }

  private buildPrompt(history: HistoryMessage[], question: string): AiMessage[] {
    return [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map(({ role, content }) => ({ role, content })),
      { role: 'user', content: question },
    ];
  }

  private async saveMessage(chatId: string, role: LearnMessageRole, content: string) {
    const [message] = await this.prisma.$transaction([
      this.prisma.learnMessage.create({ data: { chatId, role, content }, select: { id: true, role: true, content: true } }),
      this.prisma.learnChat.update({ where: { id: chatId }, data: { updatedAt: new Date() } }),
    ]);

    return message;
  }

  private async generateTitle(chatId: string, question: string) {
    try {
      const title = (
        await this.aiService.chat([
          { role: 'system', content: TITLE_PROMPT },
          { role: 'user', content: question },
        ])
      )
        .replace(/^["'`]|["'`]$/g, '')
        .slice(0, CHAT_TITLE_MAX_LENGTH);
      if (!title) return null;

      await this.prisma.learnChat.update({ where: { id: chatId }, data: { title } });
      return title;
    } catch {
      return null;
    }
  }
}
