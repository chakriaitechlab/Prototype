import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { StatsService } from './stats/stats.service.js';
import { CandidatesService } from './candidates/candidates.service.js';
import { ListCandidatesDto } from './candidates/dto/list-candidates.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('RECRUITER')
@Controller('api/recruiter')
export class TalentController {
  constructor(
    private readonly statsService: StatsService,
    private readonly candidatesService: CandidatesService,
  ) {}

  @Get('stats')
  stats(@CurrentUser('sub') userId: string) {
    return this.statsService.stats(userId);
  }

  @Get('candidates')
  candidates(@CurrentUser('sub') userId: string, @Query() dto: ListCandidatesDto) {
    return this.candidatesService.list(userId, dto);
  }
}
