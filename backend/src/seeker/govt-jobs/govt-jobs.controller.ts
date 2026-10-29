import { Body, Controller, Get, Param, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WorkerKeyGuard } from '../../common/auth/guards/worker-key.guard.js';
import { GovtJobsService } from './govt-jobs.service.js';

@Controller('api/govt-jobs/v1')
export class GovtJobsController {
  constructor(private readonly govtJobsService: GovtJobsService) {}

  @Get()
  async getAllJobs(
    @Query('search') search?: string,
    @Query('organization') organization?: string,
    @Query('status') status?: 'all' | 'active' | 'expired',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'deadline' | 'latest' | 'published',
  ) {
    return this.govtJobsService.getAllJobList({
      search,
      organization,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy,
    });
  }

  @Get(':id')
  async getJobDetails(@Param('id') id: string) {
    return this.govtJobsService.getJobDetails(id);
  }

  @UseGuards(WorkerKeyGuard)
  @Post(':id/details')
  @UsePipes(new ValidationPipe({ whitelist: false }))
  async updateCircularDetails(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const details = body?.circularDetails !== undefined ? body.circularDetails : body;
    return this.govtJobsService.updateCircularDetails(id, details);
  }
}
