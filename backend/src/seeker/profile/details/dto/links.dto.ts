import { Transform } from 'class-transformer';
import { IsOptional, IsUrl, MaxLength } from 'class-validator';

export class LinksDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  @MaxLength(500)
  website?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Facebook link must be a valid URL' })
  @MaxLength(500)
  facebook?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'GitHub link must be a valid URL' })
  @MaxLength(500)
  github?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn link must be a valid URL' })
  @MaxLength(500)
  linkedin?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'X link must be a valid URL' })
  @MaxLength(500)
  x?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Instagram link must be a valid URL' })
  @MaxLength(500)
  instagram?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'YouTube link must be a valid URL' })
  @MaxLength(500)
  youtube?: string;
}
