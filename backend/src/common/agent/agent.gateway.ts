import { ArgumentsHost, Catch, HttpException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { OnGatewayInit } from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import type { AgentSessionStatus, AgentStepKind } from '../../../generated/prisma/client.js';
import { SessionRefDto } from './session/dto/session-ref.dto.js';
import { WatchBrowserDto } from './session/dto/watch-browser.dto.js';
import { SessionService } from './session/session.service.js';
import { SocketTokenService } from './socket-token/socket-token.service.js';

type AgentSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, { userId?: string }>;

interface StepPayload {
  index: number;
  kind: AgentStepKind;
  note: string;
  url: string | null;
  data: unknown;
  createdAt: Date;
}

interface ScreenshotPayload {
  image: string;
  url: string;
}

@Catch()
class AckExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ack: unknown = host.getArgByIndex(2);
    if (typeof ack === 'function') ack({ error: errorMessageOf(exception) });
  }
}

const sessionRoom = (sessionId: string) => `session:${sessionId}`;
const browserRoom = (sessionId: string) => `browser:${sessionId}`;

@WebSocketGateway({ namespace: 'agent' })
@UseFilters(new AckExceptionFilter())
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AgentGateway implements OnGatewayInit {
  @WebSocketServer()
  private readonly server!: Namespace;

  private readonly screenshots = new Map<string, ScreenshotPayload>();

  constructor(
    private readonly socketToken: SocketTokenService,
    private readonly sessions: SessionService,
  ) {}

  afterInit(namespace: Namespace) {
    namespace.use((client: AgentSocket, next) => {
      this.socketToken
        .verify(client.handshake.auth?.token)
        .then((userId) => {
          if (!userId) return next(new Error('Unauthorized'));
          client.data.userId = userId;
          next();
        })
        .catch(() => next(new Error('Unauthorized')));
    });
  }

  @SubscribeMessage('session:join')
  async onJoin(@ConnectedSocket() client: AgentSocket, @MessageBody() dto: SessionRefDto) {
    const { sessionId } = dto;
    const session = await this.sessions.get(this.userOf(client), sessionId);

    await client.join(sessionRoom(sessionId));
    return { session, screenshot: this.screenshots.get(sessionId) ?? null };
  }

  @SubscribeMessage('session:leave')
  async onLeave(@ConnectedSocket() client: AgentSocket, @MessageBody() dto: SessionRefDto) {
    const { sessionId } = dto;
    await Promise.all([client.leave(sessionRoom(sessionId)), client.leave(browserRoom(sessionId))]);
    return { ok: true };
  }

  @SubscribeMessage('browser:watch')
  async onWatch(@ConnectedSocket() client: AgentSocket, @MessageBody() dto: WatchBrowserDto) {
    const { sessionId, watching } = dto;
    await this.sessions.get(this.userOf(client), sessionId);

    if (watching) await client.join(browserRoom(sessionId));
    else await client.leave(browserRoom(sessionId));
    return { ok: true };
  }

  publishStep(sessionId: string, step: StepPayload) {
    this.server.to(sessionRoom(sessionId)).emit('agent:step', step);
  }

  publishDraft(sessionId: string, content: string) {
    this.server.to(sessionRoom(sessionId)).emit('agent:draft', { content });
  }

  publishFrame(sessionId: string, frame: ScreenshotPayload) {
    this.screenshots.set(sessionId, frame);
    this.server.to(browserRoom(sessionId)).emit('agent:frame', frame);
  }

  publishStatus(sessionId: string, status: AgentSessionStatus) {
    this.server.to(sessionRoom(sessionId)).emit('agent:status', { status });
  }

  clearScreenshot(sessionId: string) {
    this.screenshots.delete(sessionId);
  }

  private userOf(client: AgentSocket) {
    const userId = client.data.userId;
    if (!userId) throw new HttpException('Not connected', 401);
    return userId;
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
