import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { StorageModule } from '../../infrastructure/storage/storage.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ProfileController } from './profile.controller.js';
import { CompletionService } from './completion/completion.service.js';
import { DetailsService } from './details/details.service.js';
import { PortfolioService } from './portfolio/portfolio.service.js';

@Module({
  imports: [AuthModule, StorageModule, JobsModule],
  controllers: [ProfileController],
  providers: [CompletionService, DetailsService, PortfolioService],
})
export class ProfileModule {}
