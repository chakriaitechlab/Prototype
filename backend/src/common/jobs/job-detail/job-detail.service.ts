import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

const COMPANY_SELECT = { name: true, username: true, logoUrl: true, isVerified: true } as const;

@Injectable()
export class JobDetailService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(jobId: string) {
    const job = await this.prisma.opportunity.findFirst({
      where: { id: jobId, status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        description: true,
        skills: true,
        employmentType: true,
        salary: true,
        salaryMode: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        salaryType: true,
        experience: true,
        education: true,
        jobLevel: true,
        vacancies: true,
        deadline: true,
        country: true,
        city: true,
        isRemote: true,
        benefits: true,
        applyMethods: true,
        featured: true,
        createdAt: true,
        company: { select: COMPANY_SELECT },
        owner: { select: { avatarUrl: true, company: { select: COMPANY_SELECT } } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');

    const { company, owner, ...rest } = job;
    const source = company ?? owner.company;
    return { ...rest, company: source && { ...source, logoUrl: source.logoUrl ?? owner.avatarUrl } };
  }
}
