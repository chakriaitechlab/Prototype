import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { JobListQueryDto } from './dto/job-list-query.dto.js';

const JOB_INCLUDE = {
  company: { select: { name: true, logoUrl: true } },
  owner: { select: { avatarUrl: true, company: { select: { name: true, logoUrl: true } } } },
} as const satisfies Prisma.OpportunityInclude;

type JobRecord = Prisma.OpportunityGetPayload<{ include: typeof JOB_INCLUDE }>;

@Injectable()
export class JobListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: JobListQueryDto) {
    const { q, location, company, page, limit } = dto;

    const where: Prisma.OpportunityWhereInput = {
      status: 'ACTIVE',
      AND: [
        q ? { OR: [{ title: contains(q) }, { category: contains(q) }, ...companyNameMatches(q)] } : {},
        location ? { location: contains(location) } : {},
        company ? { OR: companyNameMatches(company) } : {},
      ],
    };

    const [jobs, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        include: JOB_INCLUDE,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      items: jobs.map((job) => this.toJob(job)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private toJob(job: JobRecord) {
    const company = job.company ?? job.owner.company;

    return {
      id: job.id,
      title: job.title,
      category: job.category,
      location: job.location,
      employmentType: job.employmentType,
      salary: job.salary,
      featured: job.featured,
      createdAt: job.createdAt,
      company: company && { name: company.name, logoUrl: company.logoUrl ?? job.owner.avatarUrl },
    };
  }
}

function contains(value: string) {
  return { contains: value, mode: 'insensitive' as const };
}

function companyNameMatches(value: string): Prisma.OpportunityWhereInput[] {
  return [{ company: { name: contains(value) } }, { owner: { company: { name: contains(value) } } }];
}
