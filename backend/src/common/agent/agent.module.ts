import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { HireModule } from '../../recruiter/hire/hire.module.js';
import { TalentModule } from '../../recruiter/talent/talent.module.js';
import { AgentController } from './agent.controller.js';
import { AgentGateway } from './agent.gateway.js';
import { SocketTokenService } from './socket-token/socket-token.service.js';
import { ConnectorsService } from './connectors/connectors.service.js';
import { GmailService } from './gmail/gmail.service.js';
import { SessionService } from './session/session.service.js';
import { RunnerService } from './runner/runner.service.js';
import { PageReaderService } from './page-reader/page-reader.service.js';
import { ScreencastService } from './screencast/screencast.service.js';
import { ToolsService } from './tools/tools.service.js';
import { BrowserToolsService } from './tools/browser-tools.service.js';
import { WebToolsService } from './tools/web-tools.service.js';
import { GmailToolsService } from './tools/gmail-tools.service.js';
import { RecruiterToolsService } from './tools/recruiter-tools.service.js';
import { UserToolsService } from './tools/user-tools.service.js';

@Module({
  imports: [AuthModule, HireModule, TalentModule],
  controllers: [AgentController],
  providers: [
    AgentGateway,
    SocketTokenService,
    ConnectorsService,
    GmailService,
    SessionService,
    RunnerService,
    PageReaderService,
    ScreencastService,
    ToolsService,
    BrowserToolsService,
    WebToolsService,
    GmailToolsService,
    RecruiterToolsService,
    UserToolsService,
  ],
})
export class AgentModule {}
