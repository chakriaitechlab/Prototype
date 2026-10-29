import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { DetailsService } from '../details/details.service.js';
import { UsernameParamDto } from './dto/username-param.dto.js';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly detailsService: DetailsService,
  ) {}

  async getPublicProfile(dto: UsernameParamDto) {
    const { username } = dto;

    const user = await this.prisma.user.findFirst({
      where: { username, role: 'SEEKER', isBanned: false },
      select: {
        username: true,
        name: true,
        avatarUrl: true,
        phoneVerified: true,
        createdAt: true,
        seekerProfile: true,
      },
    });

    if (!user?.username) {
      throw new NotFoundException('Profile not found');
    }

    const { cvUrl: _cvUrl, fullName, jobPreferences, ...profile } = this.detailsService.toProfile(
      user.name,
      user.seekerProfile,
    );
    const { preferred_roles, work_preference, employment_types } = jobPreferences;

    return {
      username: user.username,
      displayName: fullName || user.username,
      avatarUrl: user.avatarUrl,
      phoneVerified: user.phoneVerified,
      memberSince: user.createdAt.toISOString(),
      ...profile,
      jobPreferences: { preferred_roles, work_preference, employment_types },
    };
  }
}
