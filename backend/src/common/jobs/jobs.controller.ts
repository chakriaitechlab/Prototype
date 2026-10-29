import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { JobDetailService } from './job-detail/job-detail.service.js';

@Controller('api/jobs')
export class PublicJobsController {
  constructor(private readonly jobDetailService: JobDetailService) {}

  @Get(':id')
  getJob(@Param('id', ParseUUIDPipe) jobId: string) {
    return this.jobDetailService.findPublic(jobId);
  }
}
