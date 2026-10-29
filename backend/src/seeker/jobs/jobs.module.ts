import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { NotificationsModule } from '../../common/notifications/notifications.module.js';
import { StorageModule } from '../../infrastructure/storage/storage.module.js';
import { JobsController } from './jobs.controller.js';
import { JobListService } from './job-list/job-list.service.js';
import { ApplicationsService } from './applications/applications.service.js';
import { MatchScoreService } from './match-score/match-score.service.js';
import { MatchScoreWorkerService } from './match-score/match-score-worker.service.js';
import { SavedJobsService } from './saved-jobs/saved-jobs.service.js';

@Module({
  imports: [AuthModule, NotificationsModule, StorageModule],
  controllers: [JobsController],
  providers: [JobListService, ApplicationsService, MatchScoreService, MatchScoreWorkerService, SavedJobsService],
  exports: [SavedJobsService, MatchScoreService],
})
export class JobsModule {}
