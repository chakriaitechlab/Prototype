import { Global, Module } from '@nestjs/common';
import { SslcommerzService } from './sslcommerz.service.js';

@Global()
@Module({
  providers: [SslcommerzService],
  exports: [SslcommerzService],
})
export class SslcommerzModule {}
