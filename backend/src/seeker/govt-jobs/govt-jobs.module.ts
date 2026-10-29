import { Module } from '@nestjs/common';
import { GovtJobsController } from './govt-jobs.controller.js';
import { GovtJobsService } from './govt-jobs.service.js';

@Module({
  controllers: [GovtJobsController],
  providers: [GovtJobsService],
  exports: [GovtJobsService],
})
export class GovtJobsModule {}
