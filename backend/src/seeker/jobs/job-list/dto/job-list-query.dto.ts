import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const JOB_LIST_DEFAULT_LIMIT = 15;
export const JOB_LIST_MAX_LIMIT = 500;

const trimToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class JobListQueryDto {
  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(JOB_LIST_MAX_LIMIT)
  limit: number = JOB_LIST_DEFAULT_LIMIT;
}
