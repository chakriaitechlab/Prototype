import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DiamondsModule } from '../diamonds/diamonds.module.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';

@Module({
  imports: [AuthModule, DiamondsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
