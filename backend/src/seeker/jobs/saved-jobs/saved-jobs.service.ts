import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import type { SaveJobDto } from './dto/save-job.dto.js';

const OPPORTUNITY_INCLUDE = {
  company: { select: { name: true, logoUrl: true } },
  owner: { select: { avatarUrl: true, company: { select: { name: true, logoUrl: true } } } },
} as const satisfies Prisma.OpportunityInclude;

@Injectable()
export class SavedJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const savedRecords = await this.prisma.savedJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (savedRecords.length === 0) {
      return {
        ids: [],
        privateJobs: [],
        govtJobs: [],
        total: 0,
      };
    }

    const savedIds = savedRecords.map((s) => s.jobId);
    const privateIds: string[] = [];
    const govtIds: number[] = [];

    for (const record of savedRecords) {
      if (record.jobType === 'govt') {
        const numId = Number(record.jobId);
        if (!isNaN(numId)) govtIds.push(numId);
      } else {
        privateIds.push(record.jobId);
      }
    }

    const [opportunities, govtJobs] = await Promise.all([
      privateIds.length > 0
        ? this.prisma.opportunity.findMany({
            where: { id: { in: privateIds } },
            include: OPPORTUNITY_INCLUDE,
          })
        : [],
      govtIds.length > 0
        ? this.prisma.govtJob.findMany({
            where: { id: { in: govtIds } },
            include: { organization: true },
          })
        : [],
    ]);

    const formattedPrivateJobs = opportunities.map((job) => {
      const company = job.company ?? job.owner.company;
      return {
        id: job.id,
        title: job.title,
        category: job.category,
        location: job.location,
        employmentType: job.employmentType,
        salary: job.salary,
        featured: job.featured,
        company: company ? { name: company.name, logoUrl: company.logoUrl ?? job.owner.avatarUrl } : null,
        createdAt: job.createdAt.toISOString(),
      };
    });

    const formattedGovtJobs = govtJobs.map((job) => ({
      id: job.id,
      job_title: job.jobTitle,
      job_title_bn: job.jobTitleBn,
      job_id: job.jobId,
      job_type: job.jobType,
      vacancy: job.vacancy,
      gender: job.gender,
      min_age: job.minAge,
      max_age: job.maxAge,
      application_site: job.applicationSite,
      advertisement_file: job.advertisementFile,
      published_date: job.publishedDate?.toISOString(),
      deadline_date: job.deadlineDate?.toISOString(),
      advertisement_no: job.advertisementNo,
      status: job.status,
      view_count: job.viewCount,
      vacancy_not_specific: job.vacancyNotSpecific,
      job_utilities_govtorganization: job.organization
        ? {
            id: job.organization.id,
            name: job.organization.name,
            name_bn: job.organization.nameBn,
            short_name: job.organization.shortName,
            logo: job.organization.logo,
            website: job.organization.website,
          }
        : null,
    }));

    return {
      ids: savedIds,
      privateJobs: formattedPrivateJobs,
      govtJobs: formattedGovtJobs,
      total: savedRecords.length,
    };
  }

  async toggle(userId: string, jobId: string, dto?: SaveJobDto) {
    const existing = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existing) {
      await this.prisma.savedJob.delete({
        where: { id: existing.id },
      });

      return {
        saved: false,
        message: 'Removed from saved jobs',
      };
    }

    const jobType = dto?.jobType || 'private';

    await this.prisma.savedJob.create({
      data: {
        userId,
        jobId,
        jobType,
      },
    });

    return {
      saved: true,
      message: 'Job saved successfully',
    };
  }
}
