import { Injectable } from '@nestjs/common';
import type { Locator, Page } from 'playwright';

const ELEMENT_ATTRIBUTE = 'data-agent-id';
const MAX_ELEMENTS = 150;
const LABEL_MAX_LENGTH = 80;
const TEXT_MAX_LENGTH = 4000;
const SETTLE_TIMEOUT_MS = 3_000;

interface SnapshotOptions {
  attribute: string;
  maxElements: number;
  labelMax: number;
  textMax: number;
}

interface PageElement {
  id: number;
  tag: string;
  type: string;
  label: string;
  value: string;
}

interface PageSnapshot {
  elements: PageElement[];
  text: string;
}

export interface PageObservation {
  url: string;
  content: string;
}

@Injectable()
export class PageReaderService {
  private readonly labels = new WeakMap<Page, Map<number, string>>();

  async observe(page: Page): Promise<PageObservation> {
    await page.waitForLoadState('domcontentloaded', { timeout: SETTLE_TIMEOUT_MS }).catch(() => {});

    const options: SnapshotOptions = { attribute: ELEMENT_ATTRIBUTE, maxElements: MAX_ELEMENTS, labelMax: LABEL_MAX_LENGTH, textMax: TEXT_MAX_LENGTH };
    const [title, snapshot] = await Promise.all([page.title().catch(() => ''), page.evaluate(snapshotPage, options)]);
    const url = page.url();
    this.labels.set(page, new Map(snapshot.elements.map(({ id, label }) => [id, label])));

    const elements = snapshot.elements.map(({ id, tag, type, label, value }) => {
      const kind = type ? `${tag}[${type}]` : tag;
      return `[${id}] ${kind} "${label}"${value ? ` value="${value}"` : ''}`;
    });

    const content = [
      `URL: ${url}`,
      `Title: ${title}`,
      'Interactive elements in view:',
      elements.length ? elements.join('\n') : '(none)',
      'Visible text:',
      snapshot.text || '(empty)',
    ].join('\n');

    return { url, content };
  }

  element(page: Page, id: number): Locator {
    return page.locator(`[${ELEMENT_ATTRIBUTE}="${id}"]`);
  }

  label(page: Page, id: number) {
    return this.labels.get(page)?.get(id) || `element ${id}`;
  }
}

function snapshotPage({ attribute, maxElements, labelMax, textMax }: SnapshotOptions): PageSnapshot {
  const clean = (value: string | null | undefined, max: number) => (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

  document.querySelectorAll(`[${attribute}]`).forEach((node) => node.removeAttribute(attribute));

  const candidates = document.querySelectorAll<HTMLElement>(
    'a[href], button, input:not([type=hidden]), textarea, select, [role=button], [role=link], [role=tab], [role=checkbox], [role=menuitem], [contenteditable=true]',
  );

  const elements: PageElement[] = [];
  for (const node of Array.from(candidates)) {
    if (elements.length >= maxElements) break;

    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    const inView = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
    const input = node as HTMLInputElement;
    if (!visible || !inView || input.disabled) continue;

    const label = clean(
      node.getAttribute('aria-label') ||
        input.labels?.[0]?.innerText ||
        node.innerText ||
        input.placeholder ||
        node.getAttribute('title') ||
        node.getAttribute('alt') ||
        input.name,
      labelMax,
    );
    const type = node.tagName === 'INPUT' ? input.type : node.getAttribute('role');

    node.setAttribute(attribute, String(elements.length));
    elements.push({
      id: elements.length,
      tag: node.tagName.toLowerCase(),
      type: clean(type, 20),
      label,
      value: ['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName) && input.type !== 'password' ? clean(input.value, labelMax) : '',
    });
  }

  return { elements, text: clean(document.body?.innerText, textMax) };
}
