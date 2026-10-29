import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { NotificationSettingsService } from './notifications/notifications.service.js';
import { SecurityService } from './security/security.service.js';
import { AccountService } from './account/account.service.js';
import { UpdateNotificationsDto } from './notifications/dto/update-notifications.dto.js';
import { UpdateTwoFactorDto } from './security/dto/update-two-factor.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly securityService: SecurityService,
    private readonly accountService: AccountService,
  ) {}

  @Get('notifications')
  getNotifications(@CurrentUser('sub') userId: string) {
    return this.notificationSettingsService.getNotifications(userId);
  }

  @Patch('notifications')
  updateNotifications(@CurrentUser('sub') userId: string, @Body() dto: UpdateNotificationsDto) {
    return this.notificationSettingsService.updateNotifications(userId, dto);
  }

  @Get('security')
  getSecurity(@CurrentUser('sub') userId: string) {
    return this.securityService.getSecurity(userId);
  }

  @Patch('two-factor')
  updateTwoFactor(@CurrentUser('sub') userId: string, @Body() dto: UpdateTwoFactorDto) {
    return this.securityService.updateTwoFactor(userId, dto);
  }

  @Delete('account')
  deleteAccount(@CurrentUser('sub') userId: string) {
    return this.accountService.deleteAccount(userId);
  }
}
