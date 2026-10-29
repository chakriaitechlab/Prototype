import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const WORK_PREFERENCES = ['any', 'remote', 'hybrid', 'onsite'] as const;
export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export const SALARY_CURRENCIES = ['BDT', 'USD', 'INR', 'GBP', 'EUR', 'AED', 'SGD'] as const;

const SALARY_MAX = 1_000_000_000;

export class JobPreferencesDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'You can add up to 20 preferred roles' })
  @IsString({ each: true })
  @MaxLength(80, { each: true, message: 'Each role cannot exceed 80 characters' })
  preferred_roles?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum salary must be a whole number' })
  @Min(0, { message: 'Minimum salary cannot be negative' })
  @Max(SALARY_MAX)
  expected_salary_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Maximum salary must be a whole number' })
  @Min(0, { message: 'Maximum salary cannot be negative' })
  @Max(SALARY_MAX)
  expected_salary_max?: number;

  @IsOptional()
  @IsIn(SALARY_CURRENCIES, { message: 'Invalid salary currency' })
  expected_salary_currency?: (typeof SALARY_CURRENCIES)[number];

  @IsOptional()
  @IsArray()
  @IsIn(EMPLOYMENT_TYPES, { each: true, message: 'Invalid employment type' })
  employment_types?: (typeof EMPLOYMENT_TYPES)[number][];

  @IsOptional()
  @IsIn(WORK_PREFERENCES, { message: 'Invalid work arrangement' })
  work_preference?: (typeof WORK_PREFERENCES)[number];
}
