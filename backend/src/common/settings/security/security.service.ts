import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { UpdateTwoFactorDto } from './dto/update-two-factor.dto.js';

const LOGIN_SESSIONS_LIMIT = 6;

const DEVICE_PATTERNS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/i, 'iOS'],
  [/Android/i, 'Android'],
  [/Windows/i, 'Windows'],
  [/Macintosh/i, 'macOS'],
  [/Linux/i, 'Linux'],
];

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService) {}

  async getSecurity(userId: string) {
    const [settings, events] = await Promise.all([
      this.prisma.userSettings.upsert({
        where: { userId },
        create: { userId },
        update: {},
        select: { twoFactorEnabled: true },
      }),
      this.prisma.signInEvent.findMany({
        where: { userId, type: 'LOGIN_SUCCESS' },
        orderBy: { createdAt: 'desc' },
        take: LOGIN_SESSIONS_LIMIT,
        select: { id: true, ip: true, userAgent: true, createdAt: true },
      }),
    ]);

    return {
      twoFactorEnabled: settings.twoFactorEnabled,
      sessions: events.map((event) => ({ ...event, device: this.deviceOf(event.userAgent) })),
    };
  }

  async updateTwoFactor(userId: string, dto: UpdateTwoFactorDto) {
    const { enabled } = dto;

    const { twoFactorEnabled } = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, twoFactorEnabled: enabled },
      update: { twoFactorEnabled: enabled },
      select: { twoFactorEnabled: true },
    });

    return { twoFactorEnabled };
  }

  private deviceOf(userAgent: string | null) {
    if (!userAgent) return 'Unknown device';
    return DEVICE_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? 'Web browser';
  }
}
