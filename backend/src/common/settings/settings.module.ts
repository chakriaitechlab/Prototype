import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StorageModule } from '../../infrastructure/storage/storage.module.js';
import { SettingsController } from './settings.controller.js';
import { NotificationSettingsService } from './notifications/notifications.service.js';
import { SecurityService } from './security/security.service.js';
import { AccountService } from './account/account.service.js';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [SettingsController],
  providers: [NotificationSettingsService, SecurityService, AccountService],
})
export class SettingsModule {}
