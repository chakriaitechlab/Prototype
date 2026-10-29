import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DiamondsController } from './diamonds.controller.js';
import { DiamondsService } from './diamonds.service.js';

@Module({
  imports: [AuthModule],
  controllers: [DiamondsController],
  providers: [DiamondsService],
  exports: [DiamondsService],
})
export class DiamondsModule {}
