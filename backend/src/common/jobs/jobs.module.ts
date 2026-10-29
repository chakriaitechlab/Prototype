import { Module } from '@nestjs/common';
import { PublicJobsController } from './jobs.controller.js';
import { JobDetailService } from './job-detail/job-detail.service.js';

@Module({
  controllers: [PublicJobsController],
  providers: [JobDetailService],
})
export class PublicJobsModule {}
