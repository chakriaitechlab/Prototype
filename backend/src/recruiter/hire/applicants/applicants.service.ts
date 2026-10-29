import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { ApplicationStatus, MessageKind, Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { SystemMessagesService } from '../../../common/messages/system/system-messages.service.js';
import { INTERVIEW_TTL_DAYS } from '../../../common/interviews/sessions/sessions.service.js';
import { ApplicantDecisionDto } from './dto/applicant-decision.dto.js';
import { ListApplicantsDto } from './dto/list-applicants.dto.js';
import type { ApplicantFilter } from './dto/list-applicants.dto.js';

const DAY_MS = 86_400_000;
const FALLBACK_COMPANY = 'the company';

const STATUSES_BY_FILTER: Record<ApplicantFilter, ApplicationStatus[]> = {
  review: ['SUBMITTED'],
  invited: ['VOICE_INTERVIEW', 'INTERVIEW_SUBMITTED'],
  rejected: ['REJECTED'],
};

const APPLICANT_SELECT = {
  id: true,
  status: true,
  appliedAt: true,
  applyMethod: true,
  cvUrl: true,
  cvFileName: true,
  decidedAt: true,
  interview: { select: { id: true, status: true, expiresAt: true, report: { select: { status: true, overallScore: true } } } },
  seeker: {
    select: { id: true, name: true, username: true, avatarUrl: true, seekerProfile: { select: { headline: true } } },
  },
} satisfies Prisma.OpportunityApplicationSelect;

type ApplicantRecord = Prisma.OpportunityApplicationGetPayload<{ select: typeof APPLICANT_SELECT }>;

type Decision = 'invite' | 'reject';

@Injectable()
export class HireApplicantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly systemMessages: SystemMessagesService,
  ) {}

  async list(ownerId: string, jobId: string, dto: ListApplicantsDto) {
    const { page, limit, status, q } = dto;

    const job = await this.prisma.opportunity.findFirst({
      where: { id: jobId, ownerId },
      select: { id: true, title: true, employmentType: true, location: true, status: true, deadline: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    const where: Prisma.OpportunityApplicationWhereInput = {
      opportunityId: jobId,
      ...(status && { status: { in: STATUSES_BY_FILTER[status] } }),
      ...(q && {
        seeker: {
          OR: [{ name: { contains: q, mode: 'insensitive' } }, { username: { contains: q, mode: 'insensitive' } }],
        },
      }),
    };

    const [applicants, total, grouped] = await Promise.all([
      this.prisma.opportunityApplication.findMany({
        where,
        select: APPLICANT_SELECT,
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.opportunityApplication.count({ where }),
      this.prisma.opportunityApplication.groupBy({
        by: ['status'],
        where: { opportunityId: jobId },
        _count: { _all: true },
      }),
    ]);

    const countOf = (filter: ApplicantFilter) =>
      grouped.filter((row) => STATUSES_BY_FILTER[filter].includes(row.status)).reduce((sum, row) => sum + row._count._all, 0);

    return {
      job,
      counts: {
        all: grouped.reduce((sum, row) => sum + row._count._all, 0),
        review: countOf('review'),
        invited: countOf('invited'),
        rejected: countOf('rejected'),
      },
      items: applicants.map((applicant) => this.toApplicant(applicant)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  invite(ownerId: string, jobId: string, applicationId: string, dto: ApplicantDecisionDto) {
    return this.decide(ownerId, jobId, applicationId, dto, 'invite');
  }

  reject(ownerId: string, jobId: string, applicationId: string, dto: ApplicantDecisionDto) {
    return this.decide(ownerId, jobId, applicationId, dto, 'reject');
  }

  private async decide(ownerId: string, jobId: string, applicationId: string, dto: ApplicantDecisionDto, decision: Decision) {
    const { note } = dto;

    const application = await this.prisma.opportunityApplication.findFirst({
      where: { id: applicationId, opportunityId: jobId, opportunity: { ownerId } },
      select: {
        status: true,
        seekerId: true,
        opportunity: {
          select: {
            title: true,
            skills: true,
            interviewDifficulty: true,
            company: { select: { name: true } },
            owner: { select: { name: true, company: { select: { name: true } } } },
          },
        },
      },
    });
    if (!application) throw new NotFoundException('Applicant not found');
    if (application.status !== 'SUBMITTED') throw new ConflictException('This applicant has already been reviewed');

    const { opportunity, seekerId } = application;
    const company = opportunity.company?.name ?? opportunity.owner.company?.name ?? opportunity.owner.name ?? FALLBACK_COMPANY;
    const decidedAt = new Date();
    const expiresAt = new Date(decidedAt.getTime() + INTERVIEW_TTL_DAYS * DAY_MS);
    const status: ApplicationStatus = decision === 'invite' ? 'VOICE_INTERVIEW' : 'REJECTED';
    const kind: MessageKind = decision === 'invite' ? 'INTERVIEW_INVITE' : 'APPLICATION_REJECTED';
    const body =
      decision === 'invite'
        ? `You're invited to an AI interview for ${opportunity.title} at ${company}. Take it any time within ${INTERVIEW_TTL_DAYS} days.`
        : `Thank you for applying to ${opportunity.title} at ${company}. We've decided to move forward with other candidates.`;

    const sent = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.opportunityApplication.updateMany({
        where: { id: applicationId, status: 'SUBMITTED' },
        data: { status, decidedAt },
      });
      if (count === 0) throw new ConflictException('This applicant has already been reviewed');

      const interview =
        decision === 'invite'
          ? await tx.aiInterview.create({
              data: {
                applicationId,
                opportunityId: jobId,
                seekerId,
                skills: opportunity.skills,
                difficulty: opportunity.interviewDifficulty,
                expiresAt,
              },
              select: { id: true },
            })
          : null;

      return this.systemMessages.create(tx, {
        senderId: ownerId,
        recipientId: seekerId,
        kind,
        body,
        metadata: {
          applicationId,
          jobId,
          jobTitle: opportunity.title,
          company,
          interviewId: interview?.id ?? null,
          expiresAt: interview ? expiresAt.toISOString() : null,
          note: note ?? null,
        },
      });
    });

    await this.systemMessages.publish(sent, 'RECRUITER');

    return { id: applicationId, status, decidedAt };
  }

  private toApplicant({ seeker, ...applicant }: ApplicantRecord) {
    return {
      ...applicant,
      seeker: {
        id: seeker.id,
        name: seeker.name,
        username: seeker.username,
        avatarUrl: seeker.avatarUrl,
        headline: seeker.seekerProfile?.headline ?? null,
      },
    };
  }
}
