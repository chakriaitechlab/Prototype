import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { OPPORTUNITY_STATUSES } from './update-job.dto.js';

export const HIRE_JOBS_DEFAULT_LIMIT = 15;
export const HIRE_JOBS_MAX_LIMIT = 100;

export class ListJobsDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(HIRE_JOBS_MAX_LIMIT)
  limit: number = HIRE_JOBS_DEFAULT_LIMIT;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toUpperCase() || undefined : value))
  @IsOptional()
  @IsIn(OPPORTUNITY_STATUSES, { message: 'Invalid job status' })
  status?: (typeof OPPORTUNITY_STATUSES)[number];

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Search cannot exceed 100 characters' })
  search?: string;
}
