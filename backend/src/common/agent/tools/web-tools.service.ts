import { Injectable } from '@nestjs/common';
import { AgentStepKind } from '../../../../generated/prisma/client.js';
import { AiService } from '../../../infrastructure/ai/ai.service.js';
import { WebFetchDto } from './dto/web-fetch.dto.js';
import { WebSearchDto } from './dto/web-search.dto.js';
import type { AgentTool, ToolResult } from './tools.service.js';

const SEARCH_RESULT_MAX_LENGTH = 1500;
const FETCH_CONTENT_MAX_LENGTH = 6000;
const FETCH_LINKS_MAX = 30;

@Injectable()
export class WebToolsService {
  readonly tools: AgentTool[] = [
    {
      definition: {
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web. Use it to find facts, news, or the right website before opening it in the browser.',
          parameters: { type: 'object', properties: { query: { type: 'string', description: 'Search query' } }, required: ['query'] },
        },
      },
      input: WebSearchDto,
      run: (input: WebSearchDto) => this.search(input),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'web_fetch',
          description: 'Read the text of a web page without opening it in the browser. Faster than the browser for reading articles.',
          parameters: { type: 'object', properties: { url: { type: 'string', description: 'Full http(s) URL to read' } }, required: ['url'] },
        },
      },
      input: WebFetchDto,
      run: (input: WebFetchDto) => this.fetch(input),
    },
  ];

  constructor(private readonly ai: AiService) {}

  private async search({ query }: WebSearchDto): Promise<ToolResult> {
    const results = await this.ai.webSearch(query);
    const content = results.length
      ? JSON.stringify(results.map((result) => ({ ...result, content: result.content.slice(0, SEARCH_RESULT_MAX_LENGTH) })))
      : 'No results found.';

    return { content, step: { kind: AgentStepKind.SEARCH, note: `Searching the web for "${query}"` } };
  }

  private async fetch({ url }: WebFetchDto): Promise<ToolResult> {
    const page = await this.ai.webFetch(url);
    const pageUrl = page.url || url;
    const content = [
      `URL: ${pageUrl}`,
      `Title: ${page.title}`,
      page.content.slice(0, FETCH_CONTENT_MAX_LENGTH),
      `Links: ${page.links.slice(0, FETCH_LINKS_MAX).join(', ')}`,
    ].join('\n');

    return { content, step: { kind: AgentStepKind.FETCH, note: `Reading ${this.hostOf(pageUrl)}`, url: pageUrl } };
  }

  private hostOf(url: string) {
    return new URL(url).hostname.replace(/^www\./, '');
  }
}
