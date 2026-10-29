import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export const INTERVIEW_LANGUAGES = ['english', 'bangla'] as const;

export type InterviewLanguageCode = (typeof INTERVIEW_LANGUAGES)[number];

export class StartInterviewDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsIn(INTERVIEW_LANGUAGES, { message: 'Language must be english or bangla' })
  language!: InterviewLanguageCode;
}
