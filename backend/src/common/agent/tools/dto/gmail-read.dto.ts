import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GmailReadDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'messageId must be a string' })
  @IsNotEmpty({ message: 'messageId cannot be empty' })
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'messageId must be an id from gmail_search' })
  messageId!: string;
}
