import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { MeService } from '../../auth/me/me.service.js';
import { UsernameDto } from '../username/dto/username.dto.js';
import { UsernameService } from '../username/username.service.js';
import { CompanyDto } from './dto/company.dto.js';

@Injectable()
export class RecruiterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meService: MeService,
    private readonly usernameService: UsernameService,
  ) {}

  async saveCompany(userId: string, dto: CompanyDto) {
    const { name } = dto;

    await this.assertRecruiter(userId);

    await this.prisma.company.upsert({
      where: { userId },
      create: { userId, name },
      update: { name },
    });

    return this.meService.getMe(userId);
  }

  checkUsername(userId: string, dto: UsernameDto) {
    const { username } = dto;

    return this.usernameService.availability(userId, username);
  }

  async setUsername(userId: string, dto: UsernameDto) {
    const { username } = dto;

    await this.assertRecruiter(userId);

    const company = await this.prisma.company.findUnique({ where: { userId }, select: { id: true } });
    if (!company) {
      throw new ForbiddenException('Add your company before choosing a username');
    }

    if (await this.usernameService.isTaken(userId, username)) {
      throw new ConflictException('This username is already taken');
    }

    await this.prisma.$transaction([
      this.prisma.company.update({ where: { userId }, data: { username } }),
      this.prisma.user.update({ where: { id: userId }, data: { onboardingCompleted: true } }),
    ]);

    return this.meService.getMe(userId);
  }

  private async assertRecruiter(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.role !== 'RECRUITER') {
      throw new ForbiddenException('This step is only available for recruiters');
    }

    return user;
  }
}
