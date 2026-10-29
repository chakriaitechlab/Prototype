import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const ADMIN_JOBS_DEFAULT_LIMIT = 20;
export const ADMIN_JOBS_MAX_LIMIT = 100;
export const JOB_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'] as const;

const trimToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

const trimUppercaseToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() || undefined : value;

export class ListJobsDto {
  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @Transform(trimUppercaseToUndefined)
  @IsOptional()
  @IsIn(JOB_STATUSES)
  status?: (typeof JOB_STATUSES)[number];

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(ADMIN_JOBS_MAX_LIMIT)
  limit: number = ADMIN_JOBS_DEFAULT_LIMIT;
}
