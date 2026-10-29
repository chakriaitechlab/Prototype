import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const CHAT_TITLE_MAX_LENGTH = 80;

export class RenameChatDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(CHAT_TITLE_MAX_LENGTH, { message: `Title cannot exceed ${CHAT_TITLE_MAX_LENGTH} characters` })
  @IsNotEmpty({ message: 'Title is required' })
  title!: string;
}
