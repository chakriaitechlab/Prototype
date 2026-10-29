import { ArgumentsHost, Catch, HttpException, Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import type { ChatUser } from './access/access.service.js';
import { ChatService } from './chat/chat.service.js';
import type { MessageRow, ReceiptChange } from './chat/chat.service.js';
import { ConversationRefDto } from './chat/dto/conversation-ref.dto.js';
import { SendMessageDto } from './chat/dto/send-message.dto.js';
import { TypingDto } from './chat/dto/typing.dto.js';
import { ConversationsService } from './conversations/conversations.service.js';
import { PresenceService } from './presence/presence.service.js';
import { WatchPresenceDto } from './presence/dto/watch-presence.dto.js';
import { SocketTokenService } from './socket-token/socket-token.service.js';

type ChatSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, { user?: ChatUser }>;

interface SendResult {
  message: MessageRow;
  recipientId: string;
  isNewConversation: boolean;
}

@Catch()
class AckExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ack: unknown = host.getArgByIndex(2);
    if (typeof ack === 'function') ack({ error: errorMessageOf(exception) });
  }
}

const userRoom = (userId: string) => `user:${userId}`;
const presenceRoom = (userId: string) => `presence:${userId}`;

@WebSocketGateway({ namespace: 'messages' })
@UseFilters(new AckExceptionFilter())
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class MessagesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer()
  private readonly server!: Namespace;

  constructor(
    private readonly socketToken: SocketTokenService,
    private readonly chat: ChatService,
    private readonly conversations: ConversationsService,
    private readonly presence: PresenceService,
  ) {}

  afterInit(namespace: Namespace) {
    namespace.use((client: ChatSocket, next) => {
      this.socketToken
        .verify(client.handshake.auth?.token)
        .then((user) => {
          if (!user) return next(new Error('Unauthorized'));
          client.data.user = user;
          next();
        })
        .catch(() => next(new Error('Unauthorized')));
    });
  }

  async handleConnection(client: ChatSocket) {
    const user = client.data.user;
    if (!user) return;

    await client.join(userRoom(user.id));

    try {
      const peerIds = await this.conversations.visiblePeerIds(user);
      if (peerIds.length) await client.join(peerIds.map(presenceRoom));

      if (await this.presence.connect(user.id, client.id)) {
        this.server.to(presenceRoom(user.id)).emit('presence', { userId: user.id, online: true, lastSeenAt: null });
      }

      const receipts = await this.chat.markAllDelivered(user.id);
      receipts.forEach((receipt) => this.publishReceipt(receipt));
    } catch (error) {
      this.logger.error(`Socket setup failed for ${user.id}: ${(error as Error).message}`);
    }
  }

  async handleDisconnect(client: ChatSocket) {
    const user = client.data.user;
    if (!user) return;

    const lastSeenAt = await this.presence.disconnect(user.id, client.id).catch(() => null);
    if (lastSeenAt) {
      this.server.to(presenceRoom(user.id)).emit('presence', { userId: user.id, online: false, lastSeenAt });
    }
  }

  @SubscribeMessage('message:send')
  async onSend(@ConnectedSocket() client: ChatSocket, @MessageBody() dto: SendMessageDto) {
    const user = this.userOf(client);
    const result = await this.chat.send(user, dto);
    await this.publishMessage(user, result);
    return { message: result.message };
  }

  @SubscribeMessage('message:delivered')
  async onDelivered(@ConnectedSocket() client: ChatSocket, @MessageBody() dto: ConversationRefDto) {
    this.publishReceipt(await this.chat.markDelivered(this.userOf(client).id, dto.conversationId));
    return { ok: true };
  }

  @SubscribeMessage('conversation:read')
  async onRead(@ConnectedSocket() client: ChatSocket, @MessageBody() dto: ConversationRefDto) {
    const user = this.userOf(client);
    this.publishReceipt(await this.chat.markRead(user.id, dto.conversationId));
    await this.publishUnread(user.id);
    return { ok: true };
  }

  @SubscribeMessage('typing')
  async onTyping(@ConnectedSocket() client: ChatSocket, @MessageBody() dto: TypingDto) {
    const { conversationId, typing } = dto;
    const user = this.userOf(client);
    const peerId = await this.chat.assertCanType(user.id, conversationId);
    this.server.to(userRoom(peerId)).emit('typing', { conversationId, userId: user.id, typing });
    return { ok: true };
  }

  @SubscribeMessage('presence:watch')
  async onWatch(@ConnectedSocket() client: ChatSocket, @MessageBody() dto: WatchPresenceDto) {
    const { userId } = dto;
    if (!(await this.conversations.canWatch(this.userOf(client), userId))) return { presence: null };

    await client.join(presenceRoom(userId));
    return { presence: await this.conversations.presenceOf(userId) };
  }

  async publishMessage(sender: ChatUser, { message, recipientId, isNewConversation }: SendResult) {
    if (isNewConversation) {
      this.server.in(userRoom(sender.id)).socketsJoin(presenceRoom(recipientId));
      this.server.in(userRoom(recipientId)).socketsJoin(presenceRoom(sender.id));
    }

    this.server.to([userRoom(sender.id), userRoom(recipientId)]).emit('message:new', { message });
    await this.publishUnread(recipientId);
  }

  publishReceipt({ conversationId, userId, peerId, deliveredAt, readAt }: ReceiptChange) {
    const receipt = { conversationId, userId, deliveredAt, readAt };
    this.server.to([userRoom(peerId), userRoom(userId)]).emit('receipt', receipt);
  }

  async publishReplyAccess(viewer: ChatUser, { conversationId, peerId, replyAccess }: { conversationId: string; peerId: string; replyAccess: boolean }) {
    if (replyAccess) this.server.in(userRoom(peerId)).socketsJoin(presenceRoom(viewer.id));
    else this.server.in(userRoom(peerId)).socketsLeave(presenceRoom(viewer.id));

    const presence = replyAccess ? await this.conversations.presenceOf(viewer.id) : null;
    this.server.to(userRoom(peerId)).emit('conversation:updated', { conversationId, canSend: replyAccess, presence });
    this.server.to(userRoom(viewer.id)).emit('conversation:updated', { conversationId, replyAccess });
  }

  async publishCleared(userId: string, conversationId: string) {
    this.server.to(userRoom(userId)).emit('conversation:cleared', { conversationId });
    await this.publishUnread(userId);
  }

  async publishUnread(userId: string) {
    const { count } = await this.conversations.unreadCount(userId);
    this.server.to(userRoom(userId)).emit('unread', { count });
  }

  private userOf(client: ChatSocket) {
    const user = client.data.user;
    if (!user) throw new HttpException('Not connected', 401);
    return user;
  }
}

function errorMessageOf(exception: unknown) {
  if (exception instanceof HttpException) {
    const response = exception.getResponse();
    const message = typeof response === 'object' && response !== null && 'message' in response ? response.message : response;
    return Array.isArray(message) ? String(message[0]) : String(message);
  }
  return 'Something went wrong. Please try again.';
}
