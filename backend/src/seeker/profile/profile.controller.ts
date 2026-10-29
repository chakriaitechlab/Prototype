import { BadRequestException, Body, Controller, Delete, Get, Param, HttpCode, HttpStatus, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { CV_MAX_BYTES, CV_MIME_TYPES, PROJECT_PHOTO_MAX_BYTES, PROJECT_PHOTO_MIME_TYPES } from '../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../infrastructure/storage/storage.service.js';
import { CompletionService } from './completion/completion.service.js';
import { DetailsService } from './details/details.service.js';
import { UpdateDetailsDto } from './details/dto/update-details.dto.js';
import { PortfolioService } from './portfolio/portfolio.service.js';
import { UsernameParamDto } from './portfolio/dto/username-param.dto.js';

@Controller('api/profile')
export class ProfileController {
  constructor(
    private readonly completionService: CompletionService,
    private readonly detailsService: DetailsService,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get('public/:username')
  getPublicProfile(@Param() dto: UsernameParamDto) {
    return this.portfolioService.getPublicProfile(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Get()
  getProfile(@CurrentUser('sub') userId: string) {
    return this.detailsService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Patch()
  updateProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateDetailsDto) {
    return this.detailsService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Get('completion')
  getCompletion(@CurrentUser('sub') userId: string) {
    return this.completionService.getCompletion(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @HttpCode(HttpStatus.OK)
  @Post('resume')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: CV_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        CV_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only PDF, DOC, and DOCX files are allowed'), false),
    }),
  )
  uploadResume(@CurrentUser('sub') userId: string, @UploadedFile() file?: UploadFile) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }
    return this.detailsService.uploadResume(userId, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Delete('resume')
  deleteResume(@CurrentUser('sub') userId: string) {
    return this.detailsService.deleteResume(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @HttpCode(HttpStatus.OK)
  @Post('project-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: PROJECT_PHOTO_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        PROJECT_PHOTO_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only JPG, PNG, and WEBP images are allowed'), false),
    }),
  )
  uploadProjectPhoto(@CurrentUser('sub') userId: string, @UploadedFile() file?: UploadFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    return this.detailsService.uploadProjectPhoto(userId, file);
  }
}
