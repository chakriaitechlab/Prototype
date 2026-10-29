import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ChatService } from './chat/chat.service.js';
import { ListMessagesDto } from './chat/dto/list-messages.dto.js';
import { SendMessageDto } from './chat/dto/send-message.dto.js';
import { ConversationsService } from './conversations/conversations.service.js';
import { ListConversationsDto } from './conversations/dto/list-conversations.dto.js';
import { ReplyAccessDto } from './conversations/dto/reply-access.dto.js';
import { SearchService } from './search/search.service.js';
import { SearchUsersDto } from './search/dto/search-users.dto.js';
import { SocketTokenService } from './socket-token/socket-token.service.js';
import { MessagesGateway } from './messages.gateway.js';

const chatUser = ({ sub, role }: AuthenticatedUser) => ({ id: sub, role });

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SEEKER', 'RECRUITER')
@Controller('api/messages')
export class MessagesController {
  constructor(
    private readonly socketToken: SocketTokenService,
    private readonly conversations: ConversationsService,
    private readonly chat: ChatService,
    private readonly search: SearchService,
    private readonly gateway: MessagesGateway,
  ) {}

  @Post('socket-token')
  issueSocketToken(@CurrentUser('sub') userId: string) {
    return this.socketToken.issue(userId);
  }

  @Get('conversations')
  listConversations(@CurrentUser() user: AuthenticatedUser, @Query() dto: ListConversationsDto) {
    return this.conversations.list(chatUser(user), dto);
  }

  @Get('conversations/:id')
  getConversation(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) conversationId: string) {
    return this.conversations.findOne(chatUser(user), conversationId);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('sub') userId: string) {
    return this.conversations.unreadCount(userId);
  }

  @Get('search')
  searchUsers(@CurrentUser('sub') userId: string, @Query() dto: SearchUsersDto) {
    return this.search.search(userId, dto);
  }

  @Get('peer/:handle')
  peer(@CurrentUser() user: AuthenticatedUser, @Param('handle') handle: string) {
    return this.conversations.peerView(chatUser(user), handle);
  }

  @Get('conversations/:id/messages')
  listMessages(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) conversationId: string, @Query() dto: ListMessagesDto) {
    return this.chat.list(userId, conversationId, dto);
  }

  @Post()
  async send(@CurrentUser() user: AuthenticatedUser, @Body() dto: SendMessageDto) {
    const sender = chatUser(user);
    const result = await this.chat.send(sender, dto);
    await this.gateway.publishMessage(sender, result);
    return { message: result.message };
  }

  @Post('conversations/:id/read')
  async markRead(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) conversationId: string) {
    this.gateway.publishReceipt(await this.chat.markRead(userId, conversationId));
    await this.gateway.publishUnread(userId);
    return { ok: true };
  }

  @Patch('conversations/:id/reply-access')
  async setReplyAccess(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) conversationId: string, @Body() dto: ReplyAccessDto) {
    const viewer = chatUser(user);
    const result = await this.conversations.setReplyAccess(viewer, conversationId, dto);
    await this.gateway.publishReplyAccess(viewer, result);
    return {
      replyAccess: result.replyAccess,
      message: result.replyAccess ? 'Candidate can reply again' : 'Candidate can no longer reply',
    };
  }

  @Delete('conversations/:id')
  async clear(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) conversationId: string) {
    const result = await this.conversations.clear(userId, conversationId);
    await this.gateway.publishCleared(userId, conversationId);
    return result;
  }
}
