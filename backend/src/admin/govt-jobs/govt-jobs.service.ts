import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { ListGovtJobsDto } from './dto/list-govt-jobs.dto.js';

@Injectable()
export class GovtJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto: ListGovtJobsDto) {
    const { q, page, limit } = dto;

    const where: Prisma.GovtJobWhereInput = {
      ...(q && {
        OR: [
          { jobTitle: { contains: q, mode: 'insensitive' } },
          { jobTitleBn: { contains: q } },
          { jobId: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await this.prisma.$transaction([
      this.prisma.govtJob.findMany({
        where,
        select: {
          id: true,
          jobId: true,
          jobTitle: true,
          jobTitleBn: true,
          publishedDate: true,
          deadlineDate: true,
          status: true,
          viewCount: true,
          organization: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.govtJob.count({ where }),
    ]);

    return {
      items: jobs,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async remove(govtJobId: number) {
    const job = await this.prisma.govtJob.findUnique({
      where: { id: govtJobId },
      select: { id: true },
    });
    if (!job) throw new NotFoundException('Govt job not found');

    await this.prisma.govtJob.delete({ where: { id: job.id } });

    return { id: job.id };
  }
}
