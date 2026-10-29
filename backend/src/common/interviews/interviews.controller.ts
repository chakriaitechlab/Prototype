import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { SubmitAnswerDto } from './conversation/dto/submit-answer.dto.js';
import { ReportService } from './report/report.service.js';
import { CompleteInterviewDto } from './sessions/dto/complete-interview.dto.js';
import { ReportViolationDto } from './sessions/dto/report-violation.dto.js';
import { StartInterviewDto } from './sessions/dto/start-interview.dto.js';
import { SessionsService } from './sessions/sessions.service.js';
import { InterviewSocketTokenService } from './socket-token/socket-token.service.js';
import { SpeechRequestDto } from './voice/dto/speech-request.dto.js';
import { VoiceService } from './voice/voice.service.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SEEKER')
@Controller('api/interviews')
export class InterviewsController {
  constructor(
    private readonly sessions: SessionsService,
    private readonly reports: ReportService,
    private readonly voice: VoiceService,
    private readonly socketToken: InterviewSocketTokenService,
  ) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.sessions.list(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('socket-token')
  issueSocketToken(@CurrentUser('sub') userId: string) {
    return this.socketToken.issue(userId);
  }

  @Get(':id')
  get(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) interviewId: string) {
    return this.sessions.get(userId, interviewId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/start')
  start(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) interviewId: string, @Body() dto: StartInterviewDto) {
    return this.sessions.start(userId, interviewId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/answer')
  answer(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) interviewId: string, @Body() dto: SubmitAnswerDto) {
    return this.sessions.answer(userId, interviewId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/violations')
  reportViolation(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) interviewId: string, @Body() dto: ReportViolationDto) {
    return this.sessions.reportViolation(userId, interviewId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/complete')
  complete(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) interviewId: string, @Body() dto: CompleteInterviewDto) {
    return this.sessions.complete(userId, interviewId, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/reset')
  reset(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) interviewId: string) {
    return this.sessions.reset(userId, interviewId);
  }

  @Post(':id/speech')
  speech(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) interviewId: string,
    @Body() dto: SpeechRequestDto,
    @Res() res: Response,
  ) {
    return this.voice.streamSpeech(userId, interviewId, dto, res);
  }

  @Roles('SEEKER', 'RECRUITER')
  @Get(':id/report')
  report(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) interviewId: string) {
    return this.reports.get({ id: user.sub, role: user.role }, interviewId);
  }
}
