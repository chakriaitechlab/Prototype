import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RunnerService } from './runner/runner.service.js';
import { SessionService } from './session/session.service.js';
import { SendMessageDto } from './session/dto/send-message.dto.js';
import { StartSessionDto } from './session/dto/start-session.dto.js';
import { SocketTokenService } from './socket-token/socket-token.service.js';
import { ConnectorsService } from './connectors/connectors.service.js';
import { ConnectGmailDto } from './connectors/dto/connect-gmail.dto.js';
import type { AgentRole } from './tools/tools.service.js';

const agentRole = ({ role }: AuthenticatedUser) => role as AgentRole;

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SEEKER', 'RECRUITER')
@Controller('api/agent')
export class AgentController {
  constructor(
    private readonly socketTokenService: SocketTokenService,
    private readonly sessionService: SessionService,
    private readonly runnerService: RunnerService,
    private readonly connectorsService: ConnectorsService,
  ) {}

  @Post('socket-token')
  issueSocketToken(@CurrentUser('sub') userId: string) {
    return this.socketTokenService.issue(userId);
  }

  @Get('connectors')
  listConnectors(@CurrentUser('sub') userId: string) {
    return this.connectorsService.list(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('connectors/gmail/auth-url')
  gmailAuthUrl(@CurrentUser('sub') userId: string) {
    return this.connectorsService.gmailAuthUrl(userId);
  }

  @Post('connectors/gmail')
  connectGmail(@CurrentUser('sub') userId: string, @Body() dto: ConnectGmailDto) {
    return this.connectorsService.connectGmail(userId, dto);
  }

  @Delete('connectors/gmail')
  disconnectGmail(@CurrentUser('sub') userId: string) {
    return this.connectorsService.disconnectGmail(userId);
  }

  @Get('sessions')
  listSessions(@CurrentUser('sub') userId: string) {
    return this.sessionService.list(userId);
  }

  @Post('sessions')
  startSession(@CurrentUser() user: AuthenticatedUser, @Body() dto: StartSessionDto) {
    return this.runnerService.start(user.sub, agentRole(user), dto);
  }

  @Get('sessions/:id')
  getSession(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) sessionId: string) {
    return this.sessionService.get(userId, sessionId);
  }

  @Delete('sessions/:id')
  deleteSession(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) sessionId: string) {
    return this.sessionService.remove(userId, sessionId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sessions/:id/messages')
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.runnerService.send(user.sub, agentRole(user), sessionId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sessions/:id/stop')
  stopSession(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) sessionId: string) {
    return this.runnerService.stop(userId, sessionId);
  }
}
