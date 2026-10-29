import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { PlansQueryDto } from './dto/plans-query.dto.js';
import { DiamondsService } from './diamonds.service.js';

@Controller('api/diamonds')
export class DiamondsController {
  constructor(private readonly diamonds: DiamondsService) {}

  @Get('plans')
  plans(@Query() dto: PlansQueryDto) {
    return this.diamonds.plans(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER', 'RECRUITER')
  @Get('wallet')
  wallet(@CurrentUser() user: AuthenticatedUser) {
    return this.diamonds.wallet(user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SEEKER', 'RECRUITER')
  @Get('usage')
  usage(@CurrentUser() user: AuthenticatedUser) {
    return this.diamonds.usage(user.sub, user.role);
  }
}
