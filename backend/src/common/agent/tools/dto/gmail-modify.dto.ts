import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';
import { GMAIL_ACTIONS } from '../../gmail/gmail.service.js';
import type { GmailAction } from '../../gmail/gmail.service.js';

export class GmailModifyDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'messageId must be a string' })
  @IsNotEmpty({ message: 'messageId cannot be empty' })
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'messageId must be an id from gmail_search' })
  messageId!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsIn(GMAIL_ACTIONS, { message: `action must be one of: ${GMAIL_ACTIONS.join(', ')}` })
  action!: GmailAction;
}
