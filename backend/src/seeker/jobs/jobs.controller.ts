import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { CV_MAX_BYTES, CV_MIME_TYPES } from '../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../infrastructure/storage/storage.service.js';
import { JobListService } from './job-list/job-list.service.js';
import { ApplicationsService } from './applications/applications.service.js';
import { MatchScoreService } from './match-score/match-score.service.js';
import { SavedJobsService } from './saved-jobs/saved-jobs.service.js';
import { JobListQueryDto } from './job-list/dto/job-list-query.dto.js';
import { MatchScoreIdsDto } from './match-score/dto/match-score-ids.dto.js';
import { SaveJobDto } from './saved-jobs/dto/save-job.dto.js';
import { ApplyJobDto } from './applications/dto/apply-job.dto.js';

@Controller('api/jobs')
export class JobsController {
  constructor(
    private readonly jobListService: JobListService,
    private readonly applicationsService: ApplicationsService,
    private readonly matchScoreService: MatchScoreService,
    private readonly savedJobsService: SavedJobsService,
  ) {}

  @Get()
  listJobs(@Query() dto: JobListQueryDto) {
    return this.jobListService.list(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Get('applications')
  listApplications(@CurrentUser('sub') userId: string) {
    return this.applicationsService.listMine(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Get('saved')
  listSaved(@CurrentUser('sub') userId: string) {
    return this.savedJobsService.list(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @HttpCode(HttpStatus.OK)
  @Post('save/:id')
  toggleSave(
    @CurrentUser('sub') userId: string,
    @Param('id') jobId: string,
    @Body() dto: SaveJobDto,
  ) {
    return this.savedJobsService.toggle(userId, jobId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @HttpCode(HttpStatus.OK)
  @Post('match-scores')
  getMatchScores(@CurrentUser('sub') userId: string, @Body() dto: MatchScoreIdsDto) {
    return this.matchScoreService.getScores(userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Get(':id/application')
  getApplication(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) opportunityId: string) {
    return this.applicationsService.getForJob(userId, opportunityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @HttpCode(HttpStatus.CREATED)
  @Post(':id/apply')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: CV_MAX_BYTES },
      fileFilter: (_req, file, cb) =>
        CV_MIME_TYPES.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Only PDF, DOC, and DOCX files are allowed'), false),
    }),
  )
  apply(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) opportunityId: string,
    @Body() dto: ApplyJobDto,
    @UploadedFile() file?: UploadFile,
  ) {
    return this.applicationsService.apply(userId, opportunityId, dto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER')
  @Get(':id/match-explanation')
  getMatchExplanation(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) opportunityId: string) {
    return this.matchScoreService.getExplanation(userId, opportunityId);
  }
}
