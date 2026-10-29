import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({ where: { userId, read: false } });

    return { unreadCount };
  }

  async create(userId: string, data: Omit<Prisma.NotificationUncheckedCreateInput, 'userId'>) {
    await this.prisma.notification.create({ data: { ...data, userId } });
  }
}
