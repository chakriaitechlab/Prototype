import { ArgumentsHost, Catch, HttpException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import type { ExceptionFilter } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import type { OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { InterviewSocketTokenService } from './socket-token/socket-token.service.js';
import type { InterviewSocketUser } from './socket-token/socket-token.service.js';
import { TranscribeStartDto } from './voice/dto/transcribe-start.dto.js';
import { VoiceService } from './voice/voice.service.js';

type InterviewSocket = Socket<Record<string, never>, Record<string, never>, Record<string, never>, { user?: InterviewSocketUser }>;

@Catch()
class AckExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ack: unknown = host.getArgByIndex(2);
    if (typeof ack !== 'function') return;
    const message = exception instanceof HttpException ? exception.message : 'Something went wrong';
    ack({ error: message });
  }
}

@WebSocketGateway({ namespace: 'interviews' })
@UseFilters(new AckExceptionFilter())
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class InterviewsGateway implements OnGatewayInit, OnGatewayDisconnect {
  constructor(
    private readonly socketToken: InterviewSocketTokenService,
    private readonly voice: VoiceService,
  ) {}

  afterInit(namespace: Namespace) {
    namespace.use((client: InterviewSocket, next) => {
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

  handleDisconnect(client: InterviewSocket) {
    this.voice.stopTranscription(client.id);
  }

  @SubscribeMessage('stt:start')
  onStart(@ConnectedSocket() client: InterviewSocket, @MessageBody() dto: TranscribeStartDto) {
    const emit = (event: string, payload: object) => (client as Socket).emit(event, payload);
    return this.voice.startTranscription(client.id, this.userOf(client).id, dto, {
      interim: (text) => emit('stt:interim', { text }),
      final: (text) => emit('stt:final', { text }),
      turnEnd: () => emit('stt:turn-end', {}),
      error: (message) => emit('stt:error', { message }),
    });
  }

  @SubscribeMessage('stt:audio')
  onAudio(@ConnectedSocket() client: InterviewSocket, @MessageBody() chunk: Buffer) {
    this.userOf(client);
    if (Buffer.isBuffer(chunk)) this.voice.sendAudio(client.id, chunk);
  }

  @SubscribeMessage('stt:stop')
  onStop(@ConnectedSocket() client: InterviewSocket) {
    this.userOf(client);
    return this.voice.flushTranscription(client.id);
  }

  private userOf(client: InterviewSocket) {
    const user = client.data.user;
    if (!user) throw new HttpException('Not connected', 401);
    return user;
  }
}
