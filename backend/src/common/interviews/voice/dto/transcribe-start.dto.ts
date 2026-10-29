import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export const MIN_SAMPLE_RATE = 8000;
export const MAX_SAMPLE_RATE = 48000;

export class TranscribeStartDto {
  @IsUUID()
  interviewId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(MIN_SAMPLE_RATE)
  @Max(MAX_SAMPLE_RATE)
  sampleRate!: number;
}
