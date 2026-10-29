import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { StorageService } from '../../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../../infrastructure/storage/storage.service.js';
import { NotificationsService } from '../../../common/notifications/notifications.service.js';
import { MatchScoreService } from '../match-score/match-score.service.js';
import { ApplyJobDto } from './dto/apply-job.dto.js';

const REF_PREFIX = 'CHK';
const REF_LENGTH = 10;
const CV_FILE_NAME_MAX = 180;

const APPLICATION_INCLUDE = {
  opportunity: {
    include: {
      company: true,
      owner: { select: { avatarUrl: true, company: true } },
    },
  },
} as const satisfies Prisma.OpportunityApplicationInclude;

type ApplicationRecord = Prisma.OpportunityApplicationGetPayload<{ include: typeof APPLICATION_INCLUDE }>;

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
    private readonly matchScoreService: MatchScoreService,
  ) {}

  async listMine(seekerId: string) {
    const applications = await this.prisma.opportunityApplication.findMany({
      where: { seekerId },
      include: APPLICATION_INCLUDE,
      orderBy: { appliedAt: 'desc' },
    });

    return applications.map((application) => this.toApplication(application));
  }

  async getForJob(seekerId: string, opportunityId: string) {
    const [application, seeker] = await Promise.all([
      this.prisma.opportunityApplication.findUnique({
        where: { opportunityId_seekerId: { opportunityId, seekerId } },
      }),
      this.findSeeker(seekerId),
    ]);

    return {
      application: application && this.toSubmitted(application),
      hasProfileCv: Boolean(seeker.seekerProfile?.cvUrl),
    };
  }

  async apply(seekerId: string, opportunityId: string, dto: ApplyJobDto, file?: UploadFile) {
    const { cvSource } = dto;

    const [seeker, opportunity, existing] = await Promise.all([
      this.findSeeker(seekerId),
      this.prisma.opportunity.findFirst({ where: { id: opportunityId, status: 'ACTIVE' } }),
      this.prisma.opportunityApplication.findUnique({
        where: { opportunityId_seekerId: { opportunityId, seekerId } },
        select: { id: true },
      }),
    ]);

    if (!opportunity) {
      throw new NotFoundException('This job is no longer available');
    }
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const { seekerProfile: profile, cvProfile } = seeker;
    if (cvSource === 'profile' && !profile?.cvUrl) {
      throw new BadRequestException('Upload your CV from the dashboard before applying.');
    }
    if (cvSource === 'upload' && !file) {
      throw new BadRequestException('Please upload a CV/Resume to apply with.');
    }

    const matchScore = await this.matchScoreService.currentScore(seekerId, opportunityId);
    const cvUrl = file ? await this.storageService.uploadApplicationCv(file, seeker.email) : profile?.cvUrl;
    const cvFileName = file ? file.originalname.trim().slice(0, CV_FILE_NAME_MAX) : null;

    let application;
    try {
      application = await this.prisma.opportunityApplication.create({
        data: {
          refNo: `${REF_PREFIX}-${randomUUID().replace(/-/g, '').slice(0, REF_LENGTH).toUpperCase()}`,
          opportunityId,
          seekerId,
          matchScore,
          applyMethod: cvSource,
          cvUrl,
          cvFileName,
          cvSnapshot: (cvProfile?.parsedData as Prisma.InputJsonValue | undefined) ?? {
            fullName: seeker.name,
            headline: profile?.headline ?? null,
            skills: profile?.skills ?? [],
            experience: profile?.experience ?? [],
            education: profile?.education ?? [],
          },
        },
      });
    } catch (err) {
      if (file && cvUrl) await this.storageService.deleteFile(cvUrl);
      throw err;
    }

    void this.notificationsService
      .create(opportunity.ownerId, {
        type: 'application',
        title: 'New application',
        body: `${seeker.name ?? 'A candidate'} applied to ${opportunity.title}`,
        link: `/dashboard/recruiter/candidates?candidate=${application.id}&source=application`,
        metadata: { applicationId: application.id, opportunityId, matchScore },
      })
      .catch(() => undefined);

    return this.toSubmitted(application);
  }

  private findSeeker(seekerId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: seekerId },
      include: { seekerProfile: true, cvProfile: true },
    });
  }

  private toSubmitted({ id, refNo, status, matchScore, applyMethod, cvFileName, appliedAt }: Prisma.OpportunityApplicationModel) {
    return { id, refNo, status, matchScore, applyMethod, cvFileName, appliedAt };
  }

  private toApplication({ id, status, appliedAt, opportunity }: ApplicationRecord) {
    const company = opportunity.company ?? opportunity.owner.company;

    return {
      id,
      status,
      appliedAt,
      job: {
        id: opportunity.id,
        title: opportunity.title,
        employmentType: opportunity.employmentType,
        location: opportunity.location,
        company: company && { name: company.name, logoUrl: company.logoUrl ?? opportunity.owner.avatarUrl },
      },
    };
  }
}
