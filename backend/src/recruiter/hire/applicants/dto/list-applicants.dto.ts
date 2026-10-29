import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const APPLICANT_FILTERS = ['review', 'invited', 'rejected'] as const;

export type ApplicantFilter = (typeof APPLICANT_FILTERS)[number];

export const APPLICANTS_DEFAULT_LIMIT = 10;
export const APPLICANTS_MAX_LIMIT = 50;

export class ListApplicantsDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(APPLICANTS_MAX_LIMIT)
  limit: number = APPLICANTS_DEFAULT_LIMIT;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() || undefined : value))
  @IsOptional()
  @IsIn(APPLICANT_FILTERS, { message: 'Invalid applicant status' })
  status?: ApplicantFilter;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Search cannot exceed 100 characters' })
  q?: string;
}
