import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export const MESSAGE_MAX_LENGTH = 4000;

export class SendMessageDto {
  @IsUUID('all', { message: 'Recipient must be a valid id' })
  recipientId!: string;

  @IsUUID('all', { message: 'Client id must be a valid id' })
  clientId!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : value))
  @IsString({ message: 'Message must be text' })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(MESSAGE_MAX_LENGTH, { message: `Message must be at most ${MESSAGE_MAX_LENGTH} characters` })
  body!: string;
}
