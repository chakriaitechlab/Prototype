import { Module } from '@nestjs/common';
import { AuthModule } from '../common/auth/auth.module.js';
import { AdminController } from './admin.controller.js';
import { StatsService } from './stats/stats.service.js';
import { UsersService } from './users/users.service.js';
import { JobsService } from './jobs/jobs.service.js';
import { GovtJobsService } from './govt-jobs/govt-jobs.service.js';
import { CompaniesService } from './companies/companies.service.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [StatsService, UsersService, JobsService, GovtJobsService, CompaniesService],
})
export class AdminModule {}
