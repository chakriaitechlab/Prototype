import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { MessagesModule } from '../../common/messages/messages.module.js';
import { HireController } from './hire.controller.js';
import { HireJobsService } from './jobs/jobs.service.js';
import { HireApplicantsService } from './applicants/applicants.service.js';

@Module({
  imports: [AuthModule, MessagesModule],
  controllers: [HireController],
  providers: [HireJobsService, HireApplicantsService],
  exports: [HireJobsService],
})
export class HireModule {}
