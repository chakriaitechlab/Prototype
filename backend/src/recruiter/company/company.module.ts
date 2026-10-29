import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { StorageModule } from '../../infrastructure/storage/storage.module.js';
import { CompanyController } from './company.controller.js';
import { CompletionService } from './completion/completion.service.js';
import { DetailsService } from './details/details.service.js';
import { MediaService } from './media/media.service.js';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [CompanyController],
  providers: [CompletionService, DetailsService, MediaService],
})
export class CompanyModule {}
