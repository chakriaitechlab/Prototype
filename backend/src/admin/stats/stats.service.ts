import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [seekers, recruiters, jobs, applications, govtJobs, totalCompanies, verifiedCompanies] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { role: 'SEEKER' } }),
        this.prisma.user.count({ where: { role: 'RECRUITER' } }),
        this.prisma.opportunity.count(),
        this.prisma.opportunityApplication.count(),
        this.prisma.govtJob.count(),
        this.prisma.company.count(),
        this.prisma.company.count({ where: { isVerified: true } }),
      ]);

    return {
      users: { seekers, recruiters },
      jobs,
      applications,
      govtJobs,
      companies: { total: totalCompanies, verified: verifiedCompanies },
    };
  }
}
