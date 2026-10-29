import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { InterviewLanguage, Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { NotificationsService } from '../../notifications/notifications.service.js';
import { SystemMessagesService } from '../../messages/system/system-messages.service.js';
import { ConversationService, type NextStep } from '../conversation/conversation.service.js';
import { SubmitAnswerDto } from '../conversation/dto/submit-answer.dto.js';
import { ReportService } from '../report/report.service.js';
import { CompleteInterviewDto, type CompleteReason } from './dto/complete-interview.dto.js';
import { ReportViolationDto } from './dto/report-violation.dto.js';
import { StartInterviewDto } from './dto/start-interview.dto.js';
import type { InterviewLanguageCode } from './dto/start-interview.dto.js';

const MAX_WARNINGS = 3;
const DAY_MS = 86_400_000;

export const INTERVIEW_TTL_DAYS = 7;
const FALLBACK_COMPANY = 'Company';

const SESSION_INCLUDE = {
  opportunity: {
    select: {
      id: true,
      title: true,
      employmentType: true,
      location: true,
      ownerId: true,
      company: { select: { name: true, logoUrl: true } },
      owner: { select: { name: true, avatarUrl: true, company: { select: { name: true, logoUrl: true } } } },
    },
  },
  report: { select: { status: true, overallScore: true } },
} satisfies Prisma.AiInterviewInclude;

type SessionRecord = Prisma.AiInterviewGetPayload<{ include: typeof SESSION_INCLUDE }>;

export const LANGUAGE_BY_CODE: Record<InterviewLanguageCode, InterviewLanguage> = { english: 'ENGLISH', bangla: 'BANGLA' };

export function languageCode(language: InterviewLanguage): InterviewLanguageCode {
  return language === 'BANGLA' ? 'bangla' : 'english';
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversation: ConversationService,
    private readonly reports: ReportService,
    private readonly notifications: NotificationsService,
    private readonly systemMessages: SystemMessagesService,
  ) {}

  async list(seekerId: string) {
    await this.expireStale({ seekerId });
    const interviews = await this.prisma.aiInterview.findMany({
      where: { seekerId },
      include: SESSION_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return interviews.map((interview) => this.toSession(interview));
  }

  async get(seekerId: string, interviewId: string) {
    await this.expireStale({ id: interviewId, seekerId });
    return this.toSession(await this.findOwned(seekerId, interviewId));
  }

  async start(seekerId: string, interviewId: string, dto: StartInterviewDto) {
    const { language } = dto;

    await this.expireStale({ id: interviewId, seekerId });
    const interview = await this.findOwned(seekerId, interviewId);

    if (interview.status === 'INVITED') {
      const { count } = await this.prisma.aiInterview.updateMany({
        where: { id: interviewId, status: 'INVITED' },
        data: { status: 'IN_PROGRESS', startedAt: new Date(), language: LANGUAGE_BY_CODE[language] },
      });
      if (count === 0) throw new ConflictException('This interview has already started');
    } else if (interview.status !== 'IN_PROGRESS') {
      throw new ConflictException(interview.status === 'EXPIRED' ? 'This interview invite has expired' : 'This interview is already completed');
    }

    const active = await this.findOwned(seekerId, interviewId);
    return { language: languageCode(active.language), turn: await this.conversation.currentTurn(this.contextOf(active)) };
  }

  async answer(seekerId: string, interviewId: string, dto: SubmitAnswerDto): Promise<NextStep> {
    const interview = await this.findActive(seekerId, interviewId);
    return this.conversation.answer(this.contextOf(interview), dto);
  }

  async reportViolation(seekerId: string, interviewId: string, dto: ReportViolationDto) {
    const { type } = dto;

    const interview = await this.findActive(seekerId, interviewId);
    const { warnings } = await this.prisma.aiInterview.update({
      where: { id: interview.id },
      data: { warnings: { increment: 1 } },
      select: { warnings: true },
    });
    this.logger.log(`Interview ${interviewId} warning ${warnings}: ${type}`);

    if (warnings >= MAX_WARNINGS) await this.finish(interview, 'proctoring');
    return { warnings, maxWarnings: MAX_WARNINGS, ended: warnings >= MAX_WARNINGS };
  }

  async reset(seekerId: string, interviewId: string) {
    const interview = await this.findOwned(seekerId, interviewId);

    await this.prisma.$transaction([
      this.prisma.aiInterviewTurn.deleteMany({ where: { interviewId } }),
      this.prisma.aiInterviewReport.deleteMany({ where: { interviewId } }),
      this.prisma.aiInterview.update({
        where: { id: interviewId },
        data: {
          status: 'INVITED',
          startedAt: null,
          completedAt: null,
          durationSeconds: null,
          warnings: 0,
          endReason: null,
          expiresAt: new Date(Date.now() + INTERVIEW_TTL_DAYS * DAY_MS),
        },
      }),
      this.prisma.opportunityApplication.update({ where: { id: interview.applicationId }, data: { status: 'VOICE_INTERVIEW' } }),
    ]);

    return this.get(seekerId, interviewId);
  }

  async complete(seekerId: string, interviewId: string, dto: CompleteInterviewDto) {
    const { reason } = dto;

    const interview = await this.findOwned(seekerId, interviewId);
    if (interview.status === 'COMPLETED') return { status: interview.status };
    if (interview.status !== 'IN_PROGRESS') throw new ConflictException('This interview has not started');

    await this.finish(interview, reason);
    return { status: 'COMPLETED' as const };
  }

  async findActive(seekerId: string, interviewId: string) {
    const interview = await this.findOwned(seekerId, interviewId);
    if (interview.status !== 'IN_PROGRESS') throw new ConflictException('This interview is not in progress');
    return interview;
  }

  private async finish(interview: SessionRecord, reason: CompleteReason) {
    const completedAt = new Date();
    const durationSeconds = interview.startedAt ? Math.round((completedAt.getTime() - interview.startedAt.getTime()) / 1000) : null;

    const { count } = await this.prisma.aiInterview.updateMany({
      where: { id: interview.id, status: 'IN_PROGRESS' },
      data: { status: 'COMPLETED', completedAt, durationSeconds, endReason: reason },
    });
    if (count === 0) return;

    await this.prisma.$transaction([
      this.prisma.opportunityApplication.update({ where: { id: interview.applicationId }, data: { status: 'INTERVIEW_SUBMITTED' } }),
      this.prisma.aiInterviewReport.upsert({ where: { interviewId: interview.id }, create: { interviewId: interview.id }, update: {} }),
    ]);

    void this.reports.generate(interview.id);
    void this.notifyRecruiter(interview).catch((error: unknown) =>
      this.logger.error(`Interview ${interview.id} notify failed: ${(error as Error).message}`),
    );
  }

  private async notifyRecruiter(interview: SessionRecord) {
    const { opportunity } = interview;
    const seeker = await this.prisma.user.findUniqueOrThrow({ where: { id: interview.seekerId }, select: { name: true, username: true } });
    const name = seeker.name ?? seeker.username ?? 'A candidate';
    const company = this.companyOf(interview).name;
    const reportPath = `/interview/${interview.id}/report`;

    await this.notifications.create(opportunity.ownerId, {
      type: 'interview',
      title: 'Interview completed',
      body: `${name} completed the AI interview for ${opportunity.title}`,
      link: reportPath,
      metadata: { interviewId: interview.id, applicationId: interview.applicationId, opportunityId: opportunity.id },
    });

    const sent = await this.prisma.$transaction((tx) =>
      this.systemMessages.create(tx, {
        senderId: interview.seekerId,
        recipientId: opportunity.ownerId,
        kind: 'INTERVIEW_COMPLETED',
        body: `${name} completed the AI interview for ${opportunity.title}. The report will be ready shortly.`,
        metadata: {
          applicationId: interview.applicationId,
          interviewId: interview.id,
          jobId: opportunity.id,
          jobTitle: opportunity.title,
          company,
          expiresAt: null,
          note: null,
        },
      }),
    );
    await this.systemMessages.publish(sent, 'SEEKER');
  }

  private async findOwned(seekerId: string, interviewId: string) {
    const interview = await this.prisma.aiInterview.findUnique({ where: { id: interviewId }, include: SESSION_INCLUDE });
    if (!interview) throw new NotFoundException('Interview not found');
    if (interview.seekerId !== seekerId) throw new ForbiddenException('This interview belongs to another candidate');
    return interview;
  }

  private expireStale(where: Prisma.AiInterviewWhereInput) {
    return this.prisma.aiInterview.updateMany({
      where: { ...where, status: 'INVITED', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
  }

  private contextOf(interview: SessionRecord) {
    return {
      id: interview.id,
      language: interview.language,
      skills: interview.skills,
      difficulty: interview.difficulty,
      jobTitle: interview.opportunity.title,
    };
  }

  companyOf({ opportunity }: SessionRecord) {
    const company = opportunity.company ?? opportunity.owner.company;
    return {
      name: company?.name ?? opportunity.owner.name ?? FALLBACK_COMPANY,
      logoUrl: company?.logoUrl ?? opportunity.owner.avatarUrl,
    };
  }

  private toSession(interview: SessionRecord) {
    const { opportunity, report } = interview;
    return {
      id: interview.id,
      status: interview.status,
      language: languageCode(interview.language),
      skills: interview.skills,
      difficulty: interview.difficulty,
      expiresAt: interview.expiresAt,
      startedAt: interview.startedAt,
      completedAt: interview.completedAt,
      durationSeconds: interview.durationSeconds,
      job: {
        id: opportunity.id,
        title: opportunity.title,
        employmentType: opportunity.employmentType,
        location: opportunity.location,
        company: this.companyOf(interview),
      },
      report: report && { status: report.status, overallScore: report.overallScore },
    };
  }
}
