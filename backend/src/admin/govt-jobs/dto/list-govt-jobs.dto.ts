import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const GOVT_JOBS_DEFAULT_LIMIT = 20;
export const GOVT_JOBS_MAX_LIMIT = 100;

const trimToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class ListGovtJobsDto {
  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(GOVT_JOBS_MAX_LIMIT)
  limit: number = GOVT_JOBS_DEFAULT_LIMIT;
}
