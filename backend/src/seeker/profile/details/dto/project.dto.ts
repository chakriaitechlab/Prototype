import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  id?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString()
  @MaxLength(120, { message: 'Project title cannot exceed 120 characters' })
  @IsNotEmpty({ message: 'Project title is required' })
  title!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Project description cannot exceed 2000 characters' })
  description?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Live demo URL must be a valid URL' })
  @MaxLength(500)
  url?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Repository URL must be a valid URL' })
  @MaxLength(500)
  repo_url?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsUrl({}, { message: 'Project photo URL must be a valid URL' })
  @MaxLength(1000)
  image_url?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  start_date?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  end_date?: string;
}
