import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { StorageService } from '../../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../../infrastructure/storage/storage.service.js';
import { MeService } from '../../auth/me/me.service.js';
import { UsernameDto } from '../username/dto/username.dto.js';
import { UsernameService } from '../username/username.service.js';
import { CareerDto } from './dto/career.dto.js';

@Injectable()
export class SeekerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly meService: MeService,
    private readonly usernameService: UsernameService,
  ) {}

  checkUsername(userId: string, dto: UsernameDto) {
    const { username } = dto;

    return this.usernameService.availability(userId, username);
  }

  async setUsername(userId: string, dto: UsernameDto) {
    const { username } = dto;

    await this.assertSeeker(userId);

    if (await this.usernameService.isTaken(userId, username)) {
      throw new ConflictException('This username is already taken');
    }

    await this.prisma.user.update({ where: { id: userId }, data: { username } });

    return this.meService.getMe(userId);
  }

  async uploadCv(userId: string, file: UploadFile) {
    const { email } = await this.assertSeeker(userId);

    const cvUrl = await this.storageService.uploadCv(file, email);

    await this.prisma.seekerProfile.upsert({
      where: { userId },
      create: { userId, cvUrl },
      update: { cvUrl, cvSkipped: false },
    });

    return this.meService.getMe(userId);
  }

  async skipCv(userId: string) {
    await this.assertSeeker(userId);

    await this.prisma.seekerProfile.upsert({
      where: { userId },
      create: { userId, cvSkipped: true },
      update: { cvSkipped: true },
    });

    return this.meService.getMe(userId);
  }

  async saveCareer(userId: string, dto: CareerDto) {
    const { headline, about } = dto;

    await this.assertSeeker(userId);

    await this.prisma.$transaction([
      this.prisma.seekerProfile.upsert({
        where: { userId },
        create: { userId, headline, about },
        update: { headline, about },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { onboardingCompleted: true },
      }),
    ]);

    return this.meService.getMe(userId);
  }

  private async assertSeeker(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (user.role !== 'SEEKER') {
      throw new ForbiddenException('This step is only available for job seekers');
    }

    return user;
  }
}
