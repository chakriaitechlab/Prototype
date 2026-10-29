import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

// Seeker and company usernames share one namespace: messaging resolves a handle against both.
@Injectable()
export class UsernameService {
  constructor(private readonly prisma: PrismaService) {}

  async isTaken(userId: string, username: string) {
    const [user, company] = await Promise.all([
      this.prisma.user.findUnique({ where: { username }, select: { id: true } }),
      this.prisma.company.findUnique({ where: { username }, select: { userId: true } }),
    ]);

    return Boolean((user && user.id !== userId) || (company && company.userId !== userId));
  }

  async availability(userId: string, username: string) {
    const taken = await this.isTaken(userId, username);

    return {
      username,
      available: !taken,
      message: taken ? 'This username is already taken' : 'Username is available',
    };
  }
}
