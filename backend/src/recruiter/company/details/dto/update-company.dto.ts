import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const ORGANIZATION_TYPES = [
  'Private Limited',
  'Public Limited',
  'Startup',
  'Non-profit',
  'Government',
  'Agency',
  'Sole Proprietorship',
] as const;

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Hospitality',
  'Other',
] as const;

export const TEAM_SIZES = [
  '1-9 employees',
  '10-49 employees',
  '50-249 employees',
  '250-999 employees',
  '1000+ employees',
] as const;

export const SOCIAL_PLATFORMS = ['website', 'facebook', 'linkedin', 'x', 'instagram', 'youtube', 'github'] as const;

const MAX_SOCIAL_LINKS = 10;

const trimToNull = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value);

export class SocialLinkDto {
  @IsIn(SOCIAL_PLATFORMS, { message: 'Invalid link platform' })
  platform!: (typeof SOCIAL_PLATFORMS)[number];

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl({}, { message: 'Each link must be a valid URL' })
  @MaxLength(300, { message: 'Links cannot exceed 300 characters' })
  url!: string;
}

export class UpdateCompanyDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name cannot exceed 100 characters' })
  name?: string;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(4000, { message: 'About cannot exceed 4000 characters' })
  about?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsIn(ORGANIZATION_TYPES, { message: 'Invalid organization type' })
  organizationType?: (typeof ORGANIZATION_TYPES)[number] | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsIn(INDUSTRIES, { message: 'Invalid industry' })
  industry?: (typeof INDUSTRIES)[number] | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsIn(TEAM_SIZES, { message: 'Invalid team size' })
  teamSize?: (typeof TEAM_SIZES)[number] | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsDateString({ strict: true }, { message: 'Year of establishment must be a valid date' })
  foundedOn?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsUrl({}, { message: 'Company website must be a valid URL' })
  @MaxLength(200, { message: 'Company website cannot exceed 200 characters' })
  website?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(4000, { message: 'Company vision cannot exceed 4000 characters' })
  vision?: string | null;

  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.filter((link: { url?: unknown }) => typeof link?.url === 'string' && link.url.trim())
      : value,
  )
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SOCIAL_LINKS, { message: `You can add up to ${MAX_SOCIAL_LINKS} links` })
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Map location cannot exceed 200 characters' })
  mapLocation?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Office address cannot exceed 500 characters' })
  address?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country?: string | null;

  @IsOptional()
  @IsLatitude({ message: 'Invalid latitude' })
  lat?: number | null;

  @IsOptional()
  @IsLongitude({ message: 'Invalid longitude' })
  lng?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  bannerPosition?: number;

  @IsOptional()
  @IsBoolean()
  removeBanner?: boolean;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'Trade license number cannot exceed 60 characters' })
  tradeLicense?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'RL number cannot exceed 60 characters' })
  rlNo?: string | null;
}
