import { Module } from '@nestjs/common';
import { AuthModule } from '../../common/auth/auth.module.js';
import { LearnController } from './learn.controller.js';
import { ChatsService } from './chats/chats.service.js';
import { MessagesService } from './messages/messages.service.js';

@Module({
  imports: [AuthModule],
  controllers: [LearnController],
  providers: [ChatsService, MessagesService],
})
export class LearnModule {}
