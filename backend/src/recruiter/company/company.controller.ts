import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  COMPANY_BANNER_MAX_BYTES,
  COMPANY_BANNER_MIME_TYPES,
} from '../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../infrastructure/storage/storage.service.js';
import { DetailsService } from './details/details.service.js';
import { UpdateCompanyDto } from './details/dto/update-company.dto.js';
import { MediaService } from './media/media.service.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECRUITER')
@Controller('api/company')
export class CompanyController {
  constructor(
    private readonly detailsService: DetailsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  getCompany(@CurrentUser('sub') userId: string) {
    return this.detailsService.getCompany(userId);
  }

  @Patch()
  updateCompany(@CurrentUser('sub') userId: string, @Body() dto: UpdateCompanyDto) {
    return this.detailsService.updateCompany(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: AVATAR_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        AVATAR_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only JPG, PNG, WEBP, and GIF images are allowed'), false),
    }),
  )
  uploadLogo(@CurrentUser('sub') userId: string, @UploadedFile() file?: UploadFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.mediaService.uploadLogo(userId, file);
  }

  @HttpCode(HttpStatus.OK)
  @Post('banner')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: COMPANY_BANNER_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        COMPANY_BANNER_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only JPG, PNG, and WEBP images are allowed'), false),
    }),
  )
  uploadBanner(@CurrentUser('sub') userId: string, @UploadedFile() file?: UploadFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.mediaService.uploadBanner(userId, file);
  }
}
