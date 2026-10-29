import { BadRequestException, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES, StorageService } from './storage.service.js';
import type { UploadFile } from './storage.service.js';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('api/upload')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: AVATAR_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        AVATAR_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only JPG, PNG, WEBP, and GIF images are allowed'), false),
    }),
  )
  async uploadAvatar(
    @CurrentUser('sub') userId: string,
    @CurrentUser('email') userEmail: string,
    @UploadedFile() file?: UploadFile,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const avatarUrl = await this.storageService.uploadAvatar(file, userEmail);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    return { message: 'Avatar uploaded successfully', avatarUrl };
  }
}
