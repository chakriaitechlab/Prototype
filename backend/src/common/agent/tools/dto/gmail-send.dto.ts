import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const SUBJECT_MAX_LENGTH = 300;
const BODY_MAX_LENGTH = 20_000;
const RECIPIENTS_PATTERN = /^[^\s@,<>\r\n]+@[^\s@,<>\r\n]+\.[^\s@,<>\r\n]+(\s*,\s*[^\s@,<>\r\n]+@[^\s@,<>\r\n]+\.[^\s@,<>\r\n]+)*$/;

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class GmailSendDto {
  @Transform(trim)
  @IsString({ message: 'to must be a string' })
  @Matches(RECIPIENTS_PATTERN, { message: 'to must be one or more email addresses separated by commas' })
  to!: string;

  @Transform(trim)
  @IsString({ message: 'subject must be a string' })
  @IsNotEmpty({ message: 'subject cannot be empty' })
  @MaxLength(SUBJECT_MAX_LENGTH, { message: `subject cannot exceed ${SUBJECT_MAX_LENGTH} characters` })
  subject!: string;

  @IsString({ message: 'body must be a string' })
  @IsNotEmpty({ message: 'body cannot be empty' })
  @MaxLength(BODY_MAX_LENGTH, { message: `body cannot exceed ${BODY_MAX_LENGTH} characters` })
  body!: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: 'replyToMessageId must be a string' })
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'replyToMessageId must be an id from gmail_search' })
  replyToMessageId?: string;
}
