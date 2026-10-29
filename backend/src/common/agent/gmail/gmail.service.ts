import { Injectable } from '@nestjs/common';
import { ConnectorsService } from '../connectors/connectors.service.js';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const REQUEST_TIMEOUT_MS = 20_000;
const BODY_MAX_LENGTH = 8000;
const SUMMARY_HEADERS = ['From', 'To', 'Subject', 'Date'];

export const GMAIL_ACTIONS = ['archive', 'mark_read', 'mark_unread', 'star', 'unstar', 'trash'] as const;
export type GmailAction = (typeof GMAIL_ACTIONS)[number];

const LABEL_CHANGES: Record<Exclude<GmailAction, 'trash'>, { addLabelIds?: string[]; removeLabelIds?: string[] }> = {
  archive: { removeLabelIds: ['INBOX'] },
  mark_read: { removeLabelIds: ['UNREAD'] },
  mark_unread: { addLabelIds: ['UNREAD'] },
  star: { addLabelIds: ['STARRED'] },
  unstar: { removeLabelIds: ['STARRED'] },
};

interface MessagePart {
  mimeType?: string;
  body?: { data?: string };
  parts?: MessagePart[];
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  payload?: MessagePart & { headers?: { name: string; value: string }[] };
}

export interface OutgoingEmail {
  to: string;
  subject: string;
  body: string;
  replyToMessageId?: string;
}

@Injectable()
export class GmailService {
  constructor(private readonly connectors: ConnectorsService) {}

  async search(userId: string, query: string, maxResults: number) {
    const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
    const { messages = [] } = await this.request<{ messages?: { id: string }[] }>(userId, `/messages?${params}`);

    return Promise.all(
      messages.map(async ({ id }) => {
        const metadata = new URLSearchParams([['format', 'metadata'], ...SUMMARY_HEADERS.map((name) => ['metadataHeaders', name])]);
        const message = await this.request<GmailMessage>(userId, `/messages/${id}?${metadata}`);
        return { ...this.summary(message), snippet: message.snippet ?? '' };
      }),
    );
  }

  async read(userId: string, messageId: string) {
    const message = await this.request<GmailMessage>(userId, `/messages/${encodeURIComponent(messageId)}?format=full`);
    return { ...this.summary(message), body: this.bodyOf(message.payload).slice(0, BODY_MAX_LENGTH) };
  }

  async send(userId: string, email: OutgoingEmail) {
    const message = await this.compose(userId, email);
    const sent = await this.request<{ id: string }>(userId, '/messages/send', message);
    return sent.id;
  }

  async draft(userId: string, email: OutgoingEmail) {
    const message = await this.compose(userId, email);
    const draft = await this.request<{ id: string }>(userId, '/drafts', { message });
    return draft.id;
  }

  async modify(userId: string, messageId: string, action: GmailAction) {
    const path = `/messages/${encodeURIComponent(messageId)}`;
    if (action === 'trash') await this.request(userId, `${path}/trash`, {});
    else await this.request(userId, `${path}/modify`, LABEL_CHANGES[action]);
  }

  private async compose(userId: string, { to, subject, body, replyToMessageId }: OutgoingEmail) {
    const headers = [`To: ${to}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64'];
    let threadId: string | undefined;
    let finalSubject = subject;

    if (replyToMessageId) {
      const original = await this.request<GmailMessage>(
        userId,
        `/messages/${encodeURIComponent(replyToMessageId)}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References&metadataHeaders=Subject`,
      );
      const messageIdHeader = this.header(original, 'Message-ID');
      const references = this.header(original, 'References');
      threadId = original.threadId;
      if (!/^re:/i.test(finalSubject)) finalSubject = `Re: ${this.header(original, 'Subject') || subject}`;
      if (messageIdHeader) headers.push(`In-Reply-To: ${messageIdHeader}`, `References: ${[references, messageIdHeader].filter(Boolean).join(' ')}`);
    }

    headers.push(`Subject: =?UTF-8?B?${Buffer.from(finalSubject).toString('base64')}?=`);
    const mime = `${headers.join('\r\n')}\r\n\r\n${Buffer.from(body).toString('base64')}`;
    return { raw: Buffer.from(mime).toString('base64url'), ...(threadId ? { threadId } : {}) };
  }

  private summary(message: GmailMessage) {
    return {
      id: message.id,
      threadId: message.threadId,
      from: this.header(message, 'From'),
      to: this.header(message, 'To'),
      subject: this.header(message, 'Subject'),
      date: this.header(message, 'Date'),
      unread: message.labelIds?.includes('UNREAD') ?? false,
    };
  }

  private header(message: GmailMessage, name: string) {
    return message.payload?.headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value ?? '';
  }

  private bodyOf(part: MessagePart | undefined): string {
    if (!part) return '';
    const plain = this.findPart(part, 'text/plain');
    if (plain?.body?.data) return this.decode(plain.body.data).trim();

    const html = this.findPart(part, 'text/html');
    if (html?.body?.data) return this.stripHtml(this.decode(html.body.data));
    return part.body?.data ? this.decode(part.body.data).trim() : '';
  }

  private findPart(part: MessagePart, mimeType: string): MessagePart | undefined {
    if (part.mimeType === mimeType && part.body?.data) return part;
    for (const child of part.parts ?? []) {
      const found = this.findPart(child, mimeType);
      if (found) return found;
    }
    return undefined;
  }

  private decode(data: string) {
    return Buffer.from(data, 'base64url').toString('utf8');
  }

  private stripHtml(html: string) {
    return html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private async request<T>(userId: string, path: string, body?: unknown): Promise<T> {
    const token = await this.connectors.gmailAccessToken(userId);
    const response = await fetch(`${GMAIL_API}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const data = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };
    if (!response.ok) throw new Error(`Gmail error: ${data.error?.message ?? response.statusText}`);
    return data;
  }
}
