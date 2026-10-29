import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { HireJobsService } from './jobs/jobs.service.js';
import { CreateJobDto } from './jobs/dto/create-job.dto.js';
import { ListJobsDto } from './jobs/dto/list-jobs.dto.js';
import { UpdateJobDto } from './jobs/dto/update-job.dto.js';
import { HireApplicantsService } from './applicants/applicants.service.js';
import { ListApplicantsDto } from './applicants/dto/list-applicants.dto.js';
import { ApplicantDecisionDto } from './applicants/dto/applicant-decision.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECRUITER')
@Controller('api/hire')
export class HireController {
  constructor(
    private readonly jobsService: HireJobsService,
    private readonly applicantsService: HireApplicantsService,
  ) {}

  @Get('jobs')
  listJobs(@CurrentUser('sub') userId: string, @Query() dto: ListJobsDto) {
    return this.jobsService.list(userId, dto);
  }

  @Post('jobs')
  createJob(@CurrentUser('sub') userId: string, @Body() dto: CreateJobDto) {
    return this.jobsService.create(userId, dto);
  }

  @Get('jobs/:id')
  getJob(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) jobId: string) {
    return this.jobsService.findOne(userId, jobId);
  }

  @Put('jobs/:id')
  updateJob(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobsService.update(userId, jobId, dto);
  }

  @Patch('jobs/:id')
  updateJobStatus(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.updateStatus(userId, jobId, dto);
  }

  @Delete('jobs/:id')
  deleteJob(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) jobId: string) {
    return this.jobsService.remove(userId, jobId);
  }

  @Get('jobs/:id/applicants')
  listApplicants(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Query() dto: ListApplicantsDto,
  ) {
    return this.applicantsService.list(userId, jobId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('jobs/:id/applicants/:applicationId/invite')
  inviteApplicant(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: ApplicantDecisionDto,
  ) {
    return this.applicantsService.invite(userId, jobId, applicationId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('jobs/:id/applicants/:applicationId/reject')
  rejectApplicant(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: ApplicantDecisionDto,
  ) {
    return this.applicantsService.reject(userId, jobId, applicationId, dto);
  }
}
