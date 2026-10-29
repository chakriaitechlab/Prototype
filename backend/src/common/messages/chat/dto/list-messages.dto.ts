import { IsOptional, IsUUID } from 'class-validator';

export class ListMessagesDto {
  @IsOptional()
  @IsUUID('all', { message: 'Cursor must be a valid message id' })
  before?: string;
}
