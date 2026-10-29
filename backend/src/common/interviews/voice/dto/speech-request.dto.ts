import { Transform } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';
import { INTERVIEW_LANGUAGES } from '../../sessions/dto/start-interview.dto.js';
import type { InterviewLanguageCode } from '../../sessions/dto/start-interview.dto.js';

export const SPEECH_KINDS = ['preview', 'greeting', 'question', 'transition', 'silence', 'skip', 'closing'] as const;

export type SpeechKind = (typeof SPEECH_KINDS)[number];

export class SpeechRequestDto {
  @IsIn(SPEECH_KINDS, { message: 'Invalid speech kind' })
  kind!: SpeechKind;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsOptional()
  @IsIn(INTERVIEW_LANGUAGES, { message: 'Language must be english or bangla' })
  language?: InterviewLanguageCode;
}
