import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CHAT_TITLE_MAX_LENGTH } from './rename-chat.dto.js';

export class CreateChatDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(CHAT_TITLE_MAX_LENGTH, { message: `Title cannot exceed ${CHAT_TITLE_MAX_LENGTH} characters` })
  title?: string;
}
