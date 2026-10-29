import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const LANGUAGE_PROFICIENCIES = ['basic', 'conversational', 'fluent', 'native'] as const;

export class LanguageDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  id?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString()
  @MaxLength(60, { message: 'Language name cannot exceed 60 characters' })
  @IsNotEmpty({ message: 'Language name is required' })
  name!: string;

  @IsOptional()
  @IsIn(LANGUAGE_PROFICIENCIES, { message: 'Invalid language proficiency' })
  proficiency?: (typeof LANGUAGE_PROFICIENCIES)[number];
}
