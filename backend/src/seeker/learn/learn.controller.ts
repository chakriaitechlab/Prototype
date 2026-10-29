import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/auth/guards/roles.guard.js';
import { Roles } from '../../common/auth/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator.js';
import { ChatsService } from './chats/chats.service.js';
import { CreateChatDto } from './chats/dto/create-chat.dto.js';
import { RenameChatDto } from './chats/dto/rename-chat.dto.js';
import { MessagesService } from './messages/messages.service.js';
import { SendMessageDto } from './messages/dto/send-message.dto.js';
import { EditMessageDto } from './messages/dto/edit-message.dto.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SEEKER')
@Controller('api/learn/chats')
export class LearnController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Get()
  listChats(@CurrentUser('sub') userId: string) {
    return this.chatsService.list(userId);
  }

  @Post()
  createChat(@CurrentUser('sub') userId: string, @Body() dto: CreateChatDto) {
    return this.chatsService.create(userId, dto);
  }

  @Get(':id')
  getChat(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) chatId: string) {
    return this.chatsService.get(userId, chatId);
  }

  @Patch(':id')
  renameChat(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: RenameChatDto,
  ) {
    return this.chatsService.rename(userId, chatId, dto);
  }

  @Delete(':id')
  deleteChat(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) chatId: string) {
    return this.chatsService.remove(userId, chatId);
  }

  @Post(':id/messages/stream')
  streamMessage(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    return this.messagesService.stream(userId, chatId, dto, res);
  }

  @Patch(':id/messages/:messageId/stream')
  editMessage(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: EditMessageDto,
    @Res() res: Response,
  ) {
    return this.messagesService.edit(userId, chatId, messageId, dto, res);
  }

  @Post(':id/regenerate/stream')
  regenerate(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) chatId: string,
    @Res() res: Response,
  ) {
    return this.messagesService.regenerate(userId, chatId, res);
  }
}
