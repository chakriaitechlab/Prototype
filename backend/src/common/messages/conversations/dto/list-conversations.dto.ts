import { IsISO8601, IsOptional } from 'class-validator';

export class ListConversationsDto {
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Cursor must be a valid date' })
  cursor?: string;
}
