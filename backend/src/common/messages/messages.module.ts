import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MessagesController } from './messages.controller.js';
import { MessagesGateway } from './messages.gateway.js';
import { AccessService } from './access/access.service.js';
import { ChatService } from './chat/chat.service.js';
import { ConversationsService } from './conversations/conversations.service.js';
import { PresenceService } from './presence/presence.service.js';
import { SearchService } from './search/search.service.js';
import { SocketTokenService } from './socket-token/socket-token.service.js';
import { SystemMessagesService } from './system/system-messages.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [
    MessagesGateway,
    AccessService,
    ChatService,
    ConversationsService,
    PresenceService,
    SearchService,
    SocketTokenService,
    SystemMessagesService,
  ],
  exports: [SystemMessagesService],
})
export class MessagesModule {}
