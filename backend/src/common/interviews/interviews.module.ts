import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MessagesModule } from '../messages/messages.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { InterviewsController } from './interviews.controller.js';
import { InterviewsGateway } from './interviews.gateway.js';
import { ConversationService } from './conversation/conversation.service.js';
import { ReportService } from './report/report.service.js';
import { SessionsService } from './sessions/sessions.service.js';
import { InterviewSocketTokenService } from './socket-token/socket-token.service.js';
import { VoiceService } from './voice/voice.service.js';

@Module({
  imports: [AuthModule, MessagesModule, NotificationsModule],
  controllers: [InterviewsController],
  providers: [InterviewsGateway, SessionsService, ConversationService, ReportService, VoiceService, InterviewSocketTokenService],
})
export class InterviewsModule {}
