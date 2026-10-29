import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { ListJobsDto } from './dto/list-jobs.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';

const SALARY_NEGOTIABLE_LABEL = 'Salary negotiable';
const DEFAULT_CATEGORY = 'General';
const REMOTE_LOCATION = 'Remote';

const JOB_SUMMARY_SELECT = { id: true, title: true, status: true } as const;

function salaryLabel({ salaryMode, salaryMin, salaryMax, salaryCurrency, salaryType }: CreateJobDto) {
  if (salaryMode === 'negotiable') return SALARY_NEGOTIABLE_LABEL;

  const symbol = salaryCurrency === 'USD' ? '$' : '৳';
  const period = salaryType.toLowerCase();
  if (salaryMin !== undefined && salaryMax !== undefined) return `${symbol}${salaryMin}–${symbol}${salaryMax} / ${period}`;
  if (salaryMin !== undefined) return `${symbol}${salaryMin}+ / ${period}`;
  if (salaryMax !== undefined) return `Up to ${symbol}${salaryMax} / ${period}`;
  return null;
}

function toJobData(dto: CreateJobDto) {
  const {
    title,
    jobRole,
    tags,
    description,
    jobType,
    salaryMode,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryType,
    education,
    experience,
    jobLevel,
    vacancies,
    deadline,
    country,
    city,
    isRemote,
    benefits,
    applyMethods,
    interviewDifficulty,
    autoPilotMode,
    interviewThreshold,
  } = dto;
  const isRange = salaryMode === 'range';

  return {
    title,
    category: jobRole || DEFAULT_CATEGORY,
    location: isRemote ? REMOTE_LOCATION : `${city}, ${country}`,
    description,
    skills: tags,
    employmentType: jobType,
    salary: salaryLabel(dto),
    salaryMode,
    salaryMin: isRange ? (salaryMin ?? null) : null,
    salaryMax: isRange ? (salaryMax ?? null) : null,
    salaryCurrency: isRange ? salaryCurrency : null,
    salaryType: isRange ? salaryType : null,
    experience: experience ?? null,
    education: education ?? null,
    jobLevel: jobLevel ?? null,
    vacancies,
    deadline: deadline ? new Date(deadline) : null,
    country,
    city,
    isRemote,
    benefits,
    applyMethods,
    interviewDifficulty,
    autoPilotMode,
    interviewThreshold,
  } satisfies Prisma.OpportunityUncheckedUpdateInput;
}

@Injectable()
export class HireJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateJobDto) {
    const company = await this.prisma.company.findUnique({
      where: { userId: ownerId },
      select: { id: true },
    });

    return this.prisma.opportunity.create({
      data: { ownerId, companyId: company?.id, ...toJobData(dto) },
      select: JOB_SUMMARY_SELECT,
    });
  }

  async list(ownerId: string, dto: ListJobsDto) {
    const { page, limit, status, search } = dto;

    const where: Prisma.OpportunityWhereInput = {
      ownerId,
      ...(status && { status }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const [jobs, total, allTotal] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where,
        select: {
          id: true,
          title: true,
          employmentType: true,
          status: true,
          deadline: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.opportunity.count({ where }),
      this.prisma.opportunity.count({ where: { ownerId } }),
    ]);

    return {
      items: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        employmentType: job.employmentType,
        status: job.status,
        deadline: job.deadline,
        applicantCount: job._count.applications,
        createdAt: job.createdAt,
      })),
      total,
      allTotal,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(ownerId: string, jobId: string) {
    const job = await this.prisma.opportunity.findFirst({
      where: { id: jobId, ownerId },
      select: {
        id: true,
        title: true,
        category: true,
        skills: true,
        description: true,
        employmentType: true,
        salaryMode: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        salaryType: true,
        education: true,
        experience: true,
        jobLevel: true,
        vacancies: true,
        deadline: true,
        country: true,
        city: true,
        isRemote: true,
        benefits: true,
        applyMethods: true,
        interviewDifficulty: true,
        autoPilotMode: true,
        interviewThreshold: true,
        status: true,
      },
    });
    if (!job) throw new NotFoundException('Job not found');

    return job;
  }

  async update(ownerId: string, jobId: string, dto: CreateJobDto) {
    await this.assertOwned(ownerId, jobId);

    return this.prisma.opportunity.update({
      where: { id: jobId },
      data: toJobData(dto),
      select: JOB_SUMMARY_SELECT,
    });
  }

  async updateStatus(ownerId: string, jobId: string, dto: UpdateJobDto) {
    const { status } = dto;

    await this.assertOwned(ownerId, jobId);

    await this.prisma.opportunity.update({
      where: { id: jobId },
      data: { status },
    });

    return { id: jobId, status };
  }

  async remove(ownerId: string, jobId: string) {
    const { count } = await this.prisma.opportunity.deleteMany({ where: { id: jobId, ownerId } });
    if (count === 0) throw new NotFoundException('Job not found');

    return { id: jobId };
  }

  private async assertOwned(ownerId: string, jobId: string) {
    const job = await this.prisma.opportunity.findFirst({
      where: { id: jobId, ownerId },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Job not found');
  }
}
