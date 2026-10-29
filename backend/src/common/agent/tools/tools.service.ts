import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import type { Page } from 'playwright';
import type { Role } from '../../../../generated/prisma/client.js';
import type { AiTool } from '../../../infrastructure/ai/ai.service.js';
import type { NewStep } from '../session/session.service.js';
import { BrowserToolsService } from './browser-tools.service.js';
import { GmailToolsService } from './gmail-tools.service.js';
import { RecruiterToolsService } from './recruiter-tools.service.js';
import { UserToolsService } from './user-tools.service.js';
import { WebToolsService } from './web-tools.service.js';

const ERROR_MESSAGE_MAX_LENGTH = 300;

export type ApprovalField = { label: string; value: string };

export type AskData =
  | { type: 'approval'; title: string; fields: ApprovalField[]; body?: string; confirmLabel: string; cancelLabel: string }
  | { type: 'question'; options: string[] };

export type AgentRole = Extract<Role, 'SEEKER' | 'RECRUITER'>;

export interface ToolContext {
  userId: string;
  role: AgentRole;
  page(): Promise<Page>;
  ask(question: string, data?: AskData): Promise<string>;
}

export interface ToolResult {
  content: string;
  step?: NewStep;
  observed?: boolean;
}

export interface AgentTool<T extends object = object> {
  definition: AiTool;
  roles?: AgentRole[];
  input?: ClassConstructor<T>;
  run(input: T, context: ToolContext): Promise<ToolResult>;
}

@Injectable()
export class ToolsService {
  private readonly tools: Map<string, AgentTool>;

  constructor(
    browserTools: BrowserToolsService,
    webTools: WebToolsService,
    gmailTools: GmailToolsService,
    recruiterTools: RecruiterToolsService,
    userTools: UserToolsService,
  ) {
    const all: AgentTool[] = [...webTools.tools, ...browserTools.tools, ...gmailTools.tools, ...recruiterTools.tools, ...userTools.tools];
    this.tools = new Map(all.map((tool) => [tool.definition.function.name ?? '', tool]));
  }

  definitionsFor(role: AgentRole): AiTool[] {
    return [...this.tools.values()].filter((tool) => this.allows(tool, role)).map(({ definition }) => definition);
  }

  async execute(name: string, args: unknown, context: ToolContext): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool || !this.allows(tool, context.role)) return { content: `Error: unknown tool "${name}".` };

    try {
      const input = tool.input ? await this.parse(tool.input, args) : {};
      return await tool.run(input, context);
    } catch (error) {
      const message = error instanceof Error ? error.message.split('\n')[0] : String(error);
      return { content: `Error: ${message.slice(0, ERROR_MESSAGE_MAX_LENGTH)}` };
    }
  }

  private allows(tool: AgentTool, role: AgentRole) {
    return !tool.roles || tool.roles.includes(role);
  }

  private async parse<T extends object>(input: ClassConstructor<T>, args: unknown) {
    const instance = plainToInstance(input, typeof args === 'object' && args !== null ? args : {});
    const [error] = await validate(instance, { whitelist: true });
    if (error) throw new Error(Object.values(error.constraints ?? {})[0] ?? `Invalid ${error.property}`);
    return instance;
  }
}
