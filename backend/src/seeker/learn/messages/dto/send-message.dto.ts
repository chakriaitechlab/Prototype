import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const MESSAGE_MAX_LENGTH = 8000;

export class SendMessageDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(MESSAGE_MAX_LENGTH, { message: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters` })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  content!: string;
}
