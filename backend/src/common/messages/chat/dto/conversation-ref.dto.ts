import { IsUUID } from 'class-validator';

export class ConversationRefDto {
  @IsUUID('all', { message: 'Conversation must be a valid id' })
  conversationId!: string;
}
