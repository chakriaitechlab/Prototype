import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/auth/guards/roles.guard.js';
import { Roles } from '../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../common/auth/decorators/current-user.decorator.js';
import { StatsService } from './stats/stats.service.js';
import { UsersService } from './users/users.service.js';
import { JobsService } from './jobs/jobs.service.js';
import { GovtJobsService } from './govt-jobs/govt-jobs.service.js';
import { CompaniesService } from './companies/companies.service.js';
import { ListUsersDto } from './users/dto/list-users.dto.js';
import { UpdateUserStatusDto } from './users/dto/update-user-status.dto.js';
import { ListJobsDto } from './jobs/dto/list-jobs.dto.js';
import { ListGovtJobsDto } from './govt-jobs/dto/list-govt-jobs.dto.js';
import { ListCompaniesDto } from './companies/dto/list-companies.dto.js';
import { UpdateCompanyVerificationDto } from './companies/dto/update-company-verification.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/admin')
export class AdminController {
  constructor(
    private readonly statsService: StatsService,
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
    private readonly govtJobsService: GovtJobsService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Get('stats')
  stats() {
    return this.statsService.stats();
  }

  @Get('users')
  listUsers(@Query() dto: ListUsersDto) {
    return this.usersService.list(dto);
  }

  @Get('users/:id')
  getUser(@Param('id', ParseUUIDPipe) userId: string) {
    return this.usersService.get(userId);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @CurrentUser('sub') actorId: string,
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(actorId, userId, dto);
  }

  @Get('jobs')
  listJobs(@Query() dto: ListJobsDto) {
    return this.jobsService.list(dto);
  }

  @Get('jobs/:id')
  getJob(@Param('id', ParseUUIDPipe) jobId: string) {
    return this.jobsService.get(jobId);
  }

  @Delete('jobs/:id')
  deleteJob(@Param('id', ParseUUIDPipe) jobId: string) {
    return this.jobsService.remove(jobId);
  }

  @Get('govt-jobs')
  listGovtJobs(@Query() dto: ListGovtJobsDto) {
    return this.govtJobsService.list(dto);
  }

  @Delete('govt-jobs/:id')
  deleteGovtJob(@Param('id', ParseIntPipe) govtJobId: number) {
    return this.govtJobsService.remove(govtJobId);
  }

  @Get('companies')
  listCompanies(@Query() dto: ListCompaniesDto) {
    return this.companiesService.list(dto);
  }

  @Get('companies/:id')
  getCompany(@Param('id', ParseUUIDPipe) companyId: string) {
    return this.companiesService.get(companyId);
  }

  @Patch('companies/:id/verification')
  updateCompanyVerification(
    @Param('id', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateCompanyVerificationDto,
  ) {
    return this.companiesService.updateVerification(companyId, dto);
  }
}
