import { IsBoolean } from 'class-validator';
import { ConversationRefDto } from './conversation-ref.dto.js';

export class TypingDto extends ConversationRefDto {
  @IsBoolean({ message: 'Typing must be true or false' })
  typing!: boolean;
}
