import { Injectable } from '@nestjs/common';
import type { Locator, Page } from 'playwright';
import { AgentStepKind } from '../../../../generated/prisma/client.js';
import { BrowserService } from '../../../infrastructure/browser/browser.service.js';
import { PageReaderService } from '../page-reader/page-reader.service.js';
import type { NewStep } from '../session/session.service.js';
import { ClickDto } from './dto/click.dto.js';
import { NavigateDto } from './dto/navigate.dto.js';
import { SCROLL_DIRECTIONS, ScrollDto } from './dto/scroll.dto.js';
import { TypeDto } from './dto/type.dto.js';
import type { AgentTool, ToolContext, ToolResult } from './tools.service.js';

const SETTLE_DELAY_MS = 800;
const SCROLL_RATIO = 0.8;
const SCROLL_TICKS = 6;
const SCROLL_TICK_DELAY_MS = 60;
const MOUSE_STEPS = 20;
const HOVER_PAUSE_MS = 150;
const TYPE_DELAY_MS = 55;
const TYPE_DELAY_MAX_LENGTH = 120;
const TYPED_PREVIEW_LENGTH = 40;

const ELEMENT_ID = { type: 'number', description: 'Element number shown as [n] in the latest page snapshot' };

@Injectable()
export class BrowserToolsService {
  readonly tools: AgentTool[] = [
    {
      definition: {
        type: 'function',
        function: {
          name: 'navigate',
          description: 'Open a URL in your browser. Returns the page with numbered interactive elements.',
          parameters: { type: 'object', properties: { url: { type: 'string', description: 'Full http(s) URL to open' } }, required: ['url'] },
        },
      },
      input: NavigateDto,
      run: (input: NavigateDto, context: ToolContext) => this.navigate(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'click',
          description: 'Click an interactive element by its number from the latest page snapshot.',
          parameters: { type: 'object', properties: { elementId: ELEMENT_ID }, required: ['elementId'] },
        },
      },
      input: ClickDto,
      run: (input: ClickDto, context: ToolContext) => this.click(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'type',
          description: 'Type text into an input or textarea by its number. Set submit to true to press Enter afterwards.',
          parameters: {
            type: 'object',
            properties: {
              elementId: ELEMENT_ID,
              text: { type: 'string', description: 'Text to type' },
              submit: { type: 'boolean', description: 'Press Enter after typing' },
            },
            required: ['elementId', 'text'],
          },
        },
      },
      input: TypeDto,
      run: (input: TypeDto, context: ToolContext) => this.type(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'scroll',
          description: 'Scroll the current page up or down to see more content.',
          parameters: {
            type: 'object',
            properties: { direction: { type: 'string', enum: [...SCROLL_DIRECTIONS], description: 'Scroll direction' } },
            required: ['direction'],
          },
        },
      },
      input: ScrollDto,
      run: (input: ScrollDto, context: ToolContext) => this.scroll(input, context),
    },
    {
      definition: {
        type: 'function',
        function: {
          name: 'go_back',
          description: 'Go back to the previous page in the browser history.',
          parameters: { type: 'object', properties: {}, required: [] },
        },
      },
      run: (_input: object, context: ToolContext) => this.goBack(context),
    },
  ];

  constructor(
    private readonly browser: BrowserService,
    private readonly reader: PageReaderService,
  ) {}

  private async navigate({ url }: NavigateDto, context: ToolContext) {
    if (!(await this.browser.isPublicUrl(url))) throw new Error('This URL is not allowed');

    const page = await context.page();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return this.observe(page, 'Opened page', { kind: AgentStepKind.NAVIGATE, note: `Opening ${this.hostOf(url)}` });
  }

  private async click({ elementId }: ClickDto, context: ToolContext) {
    const page = await context.page();
    const label = this.reader.label(page, elementId);

    const element = await this.element(page, elementId);
    await this.moveTo(page, element);
    await element.click();
    return this.observe(await context.page(), `Clicked "${label}"`, { kind: AgentStepKind.CLICK, note: `Clicking "${label}"` });
  }

  private async type({ elementId, text, submit }: TypeDto, context: ToolContext) {
    const page = await context.page();
    const label = this.reader.label(page, elementId);
    const element = await this.element(page, elementId);

    await this.moveTo(page, element);
    await element.click();
    await element.fill('');
    await element.pressSequentially(text, { delay: text.length <= TYPE_DELAY_MAX_LENGTH ? TYPE_DELAY_MS : 0 });
    if (submit) await element.press('Enter');

    const preview = text.length > TYPED_PREVIEW_LENGTH ? `${text.slice(0, TYPED_PREVIEW_LENGTH)}…` : text;
    return this.observe(await context.page(), `Typed into "${label}"`, { kind: AgentStepKind.TYPE, note: `Typing "${preview}"` });
  }

  private async scroll({ direction }: ScrollDto, context: ToolContext) {
    const page = await context.page();
    const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
    const tick = ((direction === 'up' ? -1 : 1) * height * SCROLL_RATIO) / SCROLL_TICKS;

    await page.mouse.move(width / 2, height / 2, { steps: MOUSE_STEPS });
    for (let index = 0; index < SCROLL_TICKS; index++) {
      await page.mouse.wheel(0, tick);
      await page.waitForTimeout(SCROLL_TICK_DELAY_MS);
    }
    return this.observe(page, `Scrolled ${direction}`, { kind: AgentStepKind.SCROLL, note: `Scrolling ${direction}` });
  }

  private async goBack(context: ToolContext) {
    const page = await context.page();
    await page.goBack({ waitUntil: 'domcontentloaded' });
    return this.observe(page, 'Went back', { kind: AgentStepKind.BACK, note: 'Going back' });
  }

  private async element(page: Page, elementId: number) {
    const element = this.reader.element(page, elementId);
    if (!(await element.count())) throw new Error(`Element [${elementId}] is not on the page. Use a number from the latest page snapshot.`);
    return element;
  }

  private async moveTo(page: Page, element: Locator) {
    await element.scrollIntoViewIfNeeded();
    const box = await element.boundingBox();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: MOUSE_STEPS });
    await page.waitForTimeout(HOVER_PAUSE_MS);
  }

  private async observe(page: Page, outcome: string, step: NewStep): Promise<ToolResult> {
    await page.waitForTimeout(SETTLE_DELAY_MS);
    const { url, content } = await this.reader.observe(page);
    return { content: `${outcome}.\n${content}`, step: { ...step, url }, observed: true };
  }

  private hostOf(url: string) {
    return new URL(url).hostname.replace(/^www\./, '');
  }
}
