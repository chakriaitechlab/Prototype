import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export class SkillDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  id?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsString()
  @MaxLength(60, { message: 'Skill name cannot exceed 60 characters' })
  @IsNotEmpty({ message: 'Skill name is required' })
  name!: string;

  @IsOptional()
  @IsIn(SKILL_LEVELS, { message: 'Invalid skill level' })
  level?: (typeof SKILL_LEVELS)[number];
}
