import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(ownerId: string) {
    const [applicants, hired] = await this.prisma.$transaction([
      this.prisma.opportunityApplication.count({
        where: { opportunity: { ownerId } },
      }),
      this.prisma.opportunityApplication.count({
        where: { opportunity: { ownerId }, status: 'ASSIGNED' },
      }),
    ]);

    return { applicants, hired };
  }
}
