import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { AgentSessionStatus, AgentStepKind } from '../../../../generated/prisma/client.js';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import type { AiMessage } from '../../../infrastructure/ai/ai.service.js';

const TITLE_MAX_LENGTH = 80;
const NOTE_MAX_LENGTH = 8000;
const URL_MAX_LENGTH = 2000;

const SESSION_SELECT = { id: true, title: true, status: true, stepCount: true, createdAt: true, updatedAt: true } as const;
const STEP_SELECT = { index: true, kind: true, note: true, url: true, data: true, createdAt: true } as const;

const ACTIVE_STATUSES: AgentSessionStatus[] = [AgentSessionStatus.RUNNING, AgentSessionStatus.WAITING_INPUT];

const CONVERSATION_ROLES = new Map<AgentStepKind, 'user' | 'assistant'>([
  [AgentStepKind.USER, 'user'],
  [AgentStepKind.ASSISTANT, 'assistant'],
  [AgentStepKind.ASK, 'assistant'],
]);

export interface NewStep {
  kind: AgentStepKind;
  note: string;
  url?: string | null;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class SessionService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.agentSession.updateMany({
      where: { status: { in: ACTIVE_STATUSES } },
      data: { status: AgentSessionStatus.IDLE },
    });
  }

  async create(userId: string, message: string) {
    const { id } = await this.prisma.agentSession.create({
      data: { userId, title: message.replace(/\s+/g, ' ').slice(0, TITLE_MAX_LENGTH) },
      select: { id: true },
    });
    await this.addStep(id, { kind: AgentStepKind.USER, note: message });

    return this.get(userId, id);
  }

  list(userId: string) {
    return this.prisma.agentSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: SESSION_SELECT,
    });
  }

  async get(userId: string, sessionId: string) {
    const session = await this.prisma.agentSession.findFirst({
      where: { id: sessionId, userId },
      select: { ...SESSION_SELECT, steps: { orderBy: { index: 'asc' }, select: STEP_SELECT } },
    });
    if (!session) throw new NotFoundException('Session not found');

    return session;
  }

  async remove(userId: string, sessionId: string) {
    const session = await this.prisma.agentSession.findFirst({ where: { id: sessionId, userId }, select: { status: true } });
    if (!session) throw new NotFoundException('Session not found');
    if (ACTIVE_STATUSES.includes(session.status)) throw new ConflictException('Stop the agent before deleting this chat');

    await this.prisma.agentSession.delete({ where: { id: sessionId } });
    return { message: 'Chat deleted' };
  }

  addStep(sessionId: string, { kind, note, url, data }: NewStep) {
    return this.prisma.$transaction(async (tx) => {
      const { stepCount } = await tx.agentSession.update({
        where: { id: sessionId },
        data: { stepCount: { increment: 1 } },
        select: { stepCount: true },
      });

      return tx.agentStep.create({
        data: {
          sessionId,
          index: stepCount - 1,
          kind,
          note: note.slice(0, NOTE_MAX_LENGTH),
          url: url ? url.slice(0, URL_MAX_LENGTH) : null,
          ...(data === undefined ? {} : { data }),
        },
        select: STEP_SELECT,
      });
    });
  }

  async setStatus(sessionId: string, status: AgentSessionStatus) {
    await this.prisma.agentSession.update({ where: { id: sessionId }, data: { status } });
  }

  async conversation(sessionId: string): Promise<AiMessage[]> {
    const steps = await this.prisma.agentStep.findMany({
      where: { sessionId, kind: { in: [...CONVERSATION_ROLES.keys()] } },
      orderBy: { index: 'asc' },
      select: { kind: true, note: true },
    });

    return steps.map(({ kind, note }) => ({ role: CONVERSATION_ROLES.get(kind) ?? 'user', content: note }));
  }
}
