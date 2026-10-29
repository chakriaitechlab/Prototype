import { Injectable } from '@nestjs/common';
import { ASK_OPTIONS_MAX, AskUserDto } from './dto/ask-user.dto.js';
import type { AgentTool, ToolContext, ToolResult } from './tools.service.js';

@Injectable()
export class UserToolsService {
  readonly tools: AgentTool[] = [
    {
      definition: {
        type: 'function',
        function: {
          name: 'ask_user',
          description: 'Ask the user a question and wait for the answer. Use it only when you cannot continue without their input. Offer short answer options when the likely answers are clear.',
          parameters: {
            type: 'object',
            properties: {
              question: { type: 'string', description: 'A short, clear question' },
              options: { type: 'array', items: { type: 'string' }, description: `Up to ${ASK_OPTIONS_MAX} short answers the user can tap` },
            },
            required: ['question'],
          },
        },
      },
      input: AskUserDto,
      run: (input: AskUserDto, context: ToolContext) => this.ask(input, context),
    },
  ];

  private async ask({ question, options }: AskUserDto, context: ToolContext): Promise<ToolResult> {
    const answer = await context.ask(question, options?.length ? { type: 'question', options } : undefined);
    return { content: `The user answered: ${answer}` };
  }
}
