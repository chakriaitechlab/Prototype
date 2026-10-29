import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { TalentController } from './talent.controller.js';
import { StatsService } from './stats/stats.service.js';
import { CandidatesService } from './candidates/candidates.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TalentController],
  providers: [StatsService, CandidatesService],
  exports: [StatsService, CandidatesService],
})
export class TalentModule {}
