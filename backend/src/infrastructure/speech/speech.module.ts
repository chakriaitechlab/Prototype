import { Global, Module } from '@nestjs/common';
import { SpeechService } from './speech.service.js';

@Global()
@Module({
  providers: [SpeechService],
  exports: [SpeechService],
})
export class SpeechModule {}
