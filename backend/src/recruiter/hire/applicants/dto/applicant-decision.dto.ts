import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export const DECISION_NOTE_MAX_LENGTH = 500;

export class ApplicantDecisionDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() || undefined : value))
  @IsOptional()
  @IsString()
  @MaxLength(DECISION_NOTE_MAX_LENGTH, { message: `Message cannot exceed ${DECISION_NOTE_MAX_LENGTH} characters` })
  note?: string;
}
