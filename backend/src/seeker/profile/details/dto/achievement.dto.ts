import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AchievementDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  id?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString()
  @MaxLength(160, { message: 'Achievement title cannot exceed 160 characters' })
  @IsNotEmpty({ message: 'Achievement title is required' })
  title!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Achievement description cannot exceed 1000 characters' })
  description?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(40)
  date?: string;
}
