import { Transform } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

export const ANSWER_MAX_LENGTH = 5000;

export class SubmitAnswerDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value))
  @IsString()
  @MaxLength(ANSWER_MAX_LENGTH, { message: `Answer cannot exceed ${ANSWER_MAX_LENGTH} characters` })
  answer!: string;
}
