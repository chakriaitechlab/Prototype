import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CV_MAX_BYTES, CV_MIME_TYPES } from '../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../infrastructure/storage/storage.service.js';
import { RoleService } from './role/role.service.js';
import { SeekerService } from './seeker/seeker.service.js';
import { RecruiterService } from './recruiter/recruiter.service.js';
import { PhoneService } from './phone/phone.service.js';
import { UpdateRoleDto } from './role/dto/update-role.dto.js';
import { UsernameDto } from './username/dto/username.dto.js';
import { CareerDto } from './seeker/dto/career.dto.js';
import { CompanyDto } from './recruiter/dto/company.dto.js';
import { SendPhoneOtpDto } from './phone/dto/send-phone-otp.dto.js';
import { VerifyPhoneOtpDto } from './phone/dto/verify-phone-otp.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('api/onboarding')
export class OnboardingController {
  constructor(
    private readonly roleService: RoleService,
    private readonly seekerService: SeekerService,
    private readonly recruiterService: RecruiterService,
    private readonly phoneService: PhoneService,
  ) {}

  @Patch('role')
  updateRole(@CurrentUser('sub') userId: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.updateRole(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('phone/send-otp')
  sendPhoneOtp(@CurrentUser('sub') userId: string, @Body() dto: SendPhoneOtpDto) {
    return this.phoneService.sendOtp(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('phone/verify-otp')
  verifyPhoneOtp(@CurrentUser('sub') userId: string, @Body() dto: VerifyPhoneOtpDto) {
    return this.phoneService.verifyOtp(userId, dto);
  }

  @Get('seeker/check-username')
  checkUsername(@CurrentUser('sub') userId: string, @Query() dto: UsernameDto) {
    return this.seekerService.checkUsername(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('seeker/username')
  setUsername(@CurrentUser('sub') userId: string, @Body() dto: UsernameDto) {
    return this.seekerService.setUsername(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('seeker/cv')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: CV_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        CV_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only PDF, DOC, and DOCX files are allowed'), false),
    }),
  )
  uploadCv(@CurrentUser('sub') userId: string, @UploadedFile() file?: UploadFile) {
    if (!file) {
      throw new BadRequestException('CV file is required');
    }
    return this.seekerService.uploadCv(userId, file);
  }

  @HttpCode(HttpStatus.OK)
  @Post('seeker/cv/skip')
  skipCv(@CurrentUser('sub') userId: string) {
    return this.seekerService.skipCv(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('seeker/career')
  saveCareer(@CurrentUser('sub') userId: string, @Body() dto: CareerDto) {
    return this.seekerService.saveCareer(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('recruiter/company')
  saveCompany(@CurrentUser('sub') userId: string, @Body() dto: CompanyDto) {
    return this.recruiterService.saveCompany(userId, dto);
  }

  @Get('recruiter/check-username')
  checkCompanyUsername(@CurrentUser('sub') userId: string, @Query() dto: UsernameDto) {
    return this.recruiterService.checkUsername(userId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('recruiter/username')
  setCompanyUsername(@CurrentUser('sub') userId: string, @Body() dto: UsernameDto) {
    return this.recruiterService.setUsername(userId, dto);
  }
}
