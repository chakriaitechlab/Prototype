import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama, type Message, type Tool, type ToolCall } from 'ollama';

export type AiMessage = Message;
export type AiTool = Tool;

const WEB_SEARCH_MAX_RESULTS = 5;

export interface AiStream extends AsyncIterable<string> {
  abort(): void;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Ollama;
  private readonly model: string;

  constructor(configService: ConfigService) {
    const host = configService.getOrThrow<string>('OLLAMA_BASE_URL').replace(/\/+$/, '').replace(/\/api$/, '');
    const apiKey = configService.get<string>('OLLAMA_API_KEY')?.trim();

    this.model = configService.getOrThrow<string>('OLLAMA_MODEL');
    this.client = new Ollama({
      host,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
  }

  async chat(messages: AiMessage[]): Promise<string> {
    try {
      const response = await this.client.chat({ model: this.model, messages });
      return response.message.content.trim();
    } catch (error) {
      throw this.unavailable(error);
    }
  }

  async chatJson(messages: AiMessage[], format: string | object, temperature: number): Promise<Record<string, unknown>> {
    let content: string;
    try {
      const response = await this.client.chat({ model: this.model, messages, format, think: false, options: { temperature } });
      content = response.message.content;
    } catch (error) {
      throw this.unavailable(error);
    }

    const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    try {
      const parsed: unknown = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Not an object');
      return parsed as Record<string, unknown>;
    } catch {
      throw this.unavailable(new Error('Ollama returned invalid JSON'));
    }
  }

  async streamWithTools(messages: AiMessage[], tools: AiTool[], onText: (text: string) => void): Promise<AiMessage> {
    try {
      const response = await this.client.chat({ model: this.model, messages, tools, stream: true });
      let content = '';
      const toolCalls: ToolCall[] = [];

      for await (const part of response) {
        if (part.message.content) {
          content += part.message.content;
          onText(content);
        }
        if (part.message.tool_calls?.length) toolCalls.push(...part.message.tool_calls);
      }

      return { role: 'assistant', content, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) };
    } catch (error) {
      throw this.unavailable(error);
    }
  }

  async webSearch(query: string) {
    const { results } = await this.client.webSearch({ query, maxResults: WEB_SEARCH_MAX_RESULTS });
    return results;
  }

  webFetch(url: string) {
    return this.client.webFetch({ url });
  }

  async stream(messages: AiMessage[]): Promise<AiStream> {
    const response = await this.client.chat({ model: this.model, messages, stream: true }).catch((error: unknown) => {
      throw this.unavailable(error);
    });

    return {
      abort: () => response.abort(),
      async *[Symbol.asyncIterator]() {
        for await (const part of response) {
          if (part.message.content) yield part.message.content;
        }
      },
    };
  }

  private unavailable(error: unknown) {
    this.logger.error(`❌ Ollama request failed: ${error instanceof Error ? error.message : String(error)}`);
    return new ServiceUnavailableException('AI service is currently unavailable. Please try again.');
  }
}
