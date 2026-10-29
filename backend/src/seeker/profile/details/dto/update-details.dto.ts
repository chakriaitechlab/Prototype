import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { SkillDto } from './skill.dto.js';
import { ExperienceDto } from './experience.dto.js';
import { EducationDto } from './education.dto.js';
import { ProjectDto } from './project.dto.js';
import { CertificationDto } from './certification.dto.js';
import { AchievementDto } from './achievement.dto.js';
import { LanguageDto } from './language.dto.js';
import { LinksDto } from './links.dto.js';
import { JobPreferencesDto } from './job-preferences.dto.js';

export const AVAILABILITY_OPTIONS = ['available', 'open', 'not_looking'] as const;

export class UpdateDetailsDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Full name cannot exceed 120 characters' })
  fullName?: string | null;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  @MaxLength(140, { message: 'Headline cannot exceed 140 characters' })
  headline?: string | null;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  @MaxLength(4000, { message: 'About cannot exceed 4000 characters' })
  about?: string | null;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || null : value))
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'Location cannot exceed 120 characters' })
  location?: string | null;

  @IsOptional()
  @IsIn(AVAILABILITY_OPTIONS, { message: 'Invalid availability' })
  availability?: (typeof AVAILABILITY_OPTIONS)[number];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40, { message: 'You can add up to 40 skills' })
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'You can add up to 20 roles' })
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15, { message: 'You can add up to 15 education entries' })
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'You can add up to 20 projects' })
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25, { message: 'You can add up to 25 certifications' })
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  certifications?: CertificationDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'You can add up to 20 achievements' })
  @ValidateNested({ each: true })
  @Type(() => AchievementDto)
  achievements?: AchievementDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12, { message: 'You can add up to 12 languages' })
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages?: LanguageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LinksDto)
  socialLinks?: LinksDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => JobPreferencesDto)
  jobPreferences?: JobPreferencesDto;
}
