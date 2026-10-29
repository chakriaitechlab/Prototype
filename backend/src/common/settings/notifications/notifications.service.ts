import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { UpdateNotificationsDto } from './dto/update-notifications.dto.js';

const NOTIFICATION_SELECT = {
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: true,
  applicationUpdates: true,
  interviewReminders: true,
  jobMatches: true,
} as const satisfies Prisma.UserSettingsSelect;

@Injectable()
export class NotificationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  getNotifications(userId: string) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: NOTIFICATION_SELECT,
    });
  }

  updateNotifications(userId: string, dto: UpdateNotificationsDto) {
    const { emailEnabled, pushEnabled, smsEnabled, applicationUpdates, interviewReminders, jobMatches } = dto;
    const data = { emailEnabled, pushEnabled, smsEnabled, applicationUpdates, interviewReminders, jobMatches };

    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
      select: NOTIFICATION_SELECT,
    });
  }
}
