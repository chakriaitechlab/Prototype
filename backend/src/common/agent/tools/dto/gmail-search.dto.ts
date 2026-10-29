import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const QUERY_MAX_LENGTH = 300;
export const GMAIL_SEARCH_MAX_RESULTS = 10;

export class GmailSearchDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'query must be a string' })
  @IsNotEmpty({ message: 'query cannot be empty; use "in:inbox" for the latest emails' })
  @MaxLength(QUERY_MAX_LENGTH, { message: `query cannot exceed ${QUERY_MAX_LENGTH} characters` })
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'maxResults must be a whole number' })
  @Min(1, { message: 'maxResults must be at least 1' })
  @Max(GMAIL_SEARCH_MAX_RESULTS, { message: `maxResults cannot exceed ${GMAIL_SEARCH_MAX_RESULTS}` })
  maxResults?: number;
}
