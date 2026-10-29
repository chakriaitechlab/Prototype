import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { StorageService } from '../../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../../infrastructure/storage/storage.service.js';
import { DetailsService } from '../details/details.service.js';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly detailsService: DetailsService,
  ) {}

  async uploadLogo(userId: string, file: UploadFile) {
    const { id, user } = await this.findCompanyOwner(userId);
    const logoUrl = await this.storageService.uploadCompanyLogo(file, user.email);

    await this.prisma.$transaction([
      this.prisma.company.update({ where: { id }, data: { logoUrl } }),
      this.prisma.user.update({ where: { id: userId }, data: { avatarUrl: logoUrl } }),
    ]);

    return { message: 'Company logo updated', logoUrl };
  }

  async uploadBanner(userId: string, file: UploadFile) {
    const { id, user } = await this.findCompanyOwner(userId);
    const bannerUrl = await this.storageService.uploadCompanyBanner(file, user.email);

    await this.prisma.company.update({ where: { id }, data: { bannerUrl } });

    return { message: 'Cover photo uploaded', bannerUrl };
  }

  private async findCompanyOwner(userId: string) {
    const { id } = await this.detailsService.findCompany(userId);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
    return { id, user };
  }
}
