import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { MeService } from '../../auth/me/me.service.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meService: MeService,
  ) {}

  async updateRole(userId: string, dto: UpdateRoleDto) {
    const { role } = dto;

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.onboardingCompleted && user.role !== role) {
      throw new BadRequestException('Role cannot be changed after onboarding is complete');
    }

    await this.prisma.user.update({ where: { id: userId }, data: { role } });

    return this.meService.getMe(userId);
  }
}
