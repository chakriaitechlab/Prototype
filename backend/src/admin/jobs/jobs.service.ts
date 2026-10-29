import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { ListJobsDto } from './dto/list-jobs.dto.js';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: ListJobsDto) {
    const { q, status, page, limit } = dto;

    const where: Prisma.OpportunityWhereInput = {
      ...(status && { status }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    };

    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where,
        select: {
          id: true,
          title: true,
          employmentType: true,
          status: true,
          createdAt: true,
          company: { select: { name: true, isVerified: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return {
      items: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        employmentType: job.employmentType,
        status: job.status,
        company: job.company,
        applicantCount: job._count.applications,
        createdAt: job.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async get(jobId: string) {
    const job = await this.prisma.opportunity.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        description: true,
        skills: true,
        employmentType: true,
        salary: true,
        experience: true,
        status: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        owner: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, username: true, isVerified: true } },
        _count: { select: { applications: true, matchScores: true } },
      },
    });

    if (!job) throw new NotFoundException('Job not found');

    return job;
  }

  async remove(jobId: string) {
    const job = await this.prisma.opportunity.findUnique({
      where: { id: jobId },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Job not found');

    await this.prisma.opportunity.delete({ where: { id: job.id } });

    return { id: job.id };
  }
}
