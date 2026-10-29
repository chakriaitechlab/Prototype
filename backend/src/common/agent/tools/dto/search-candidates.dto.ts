import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const CANDIDATE_SEARCH_MAX_LIMIT = 20;

export class SearchCandidatesDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString({ message: 'query must be text' })
  @MaxLength(100, { message: 'query cannot exceed 100 characters' })
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be a whole number' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(CANDIDATE_SEARCH_MAX_LIMIT, { message: `limit cannot exceed ${CANDIDATE_SEARCH_MAX_LIMIT}` })
  limit?: number;
}
