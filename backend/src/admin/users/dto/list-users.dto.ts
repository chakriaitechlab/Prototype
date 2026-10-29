import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const USERS_DEFAULT_LIMIT = 20;
export const USERS_MAX_LIMIT = 100;
export const USER_ROLES = ['SEEKER', 'RECRUITER', 'ADMIN'] as const;

const trimToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || undefined : value;

const trimUppercaseToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() || undefined : value;

const booleanFromString = ({ value }: { value: unknown }) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export class ListUsersDto {
  @Transform(trimToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @Transform(trimUppercaseToUndefined)
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: (typeof USER_ROLES)[number];

  @Transform(booleanFromString)
  @IsOptional()
  @IsBoolean()
  banned?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(USERS_MAX_LIMIT)
  limit: number = USERS_DEFAULT_LIMIT;
}
