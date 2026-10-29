import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { OPPORTUNITY_STATUSES } from '../../../../recruiter/hire/jobs/dto/update-job.dto.js';

export const MY_JOBS_MAX_LIMIT = 20;

export class ListMyJobsDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toUpperCase() || undefined : value))
  @IsIn(OPPORTUNITY_STATUSES, { message: `status must be one of: ${OPPORTUNITY_STATUSES.join(', ')}` })
  status?: (typeof OPPORTUNITY_STATUSES)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString({ message: 'search must be text' })
  @MaxLength(100, { message: 'search cannot exceed 100 characters' })
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be a whole number' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(MY_JOBS_MAX_LIMIT, { message: `limit cannot exceed ${MY_JOBS_MAX_LIMIT}` })
  limit?: number;
}
