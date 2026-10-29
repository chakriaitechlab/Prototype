import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { CvController } from './cv.controller.js';
import { CvService } from './cv.service.js';

@Module({
  imports: [AuthModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService],
})
export class CvModule {}
