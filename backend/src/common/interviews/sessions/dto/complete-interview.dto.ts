import { IsIn } from 'class-validator';

export const COMPLETE_REASONS = ['finished', 'left'] as const;

export type CompleteReason = (typeof COMPLETE_REASONS)[number] | 'proctoring';

export class CompleteInterviewDto {
  @IsIn(COMPLETE_REASONS, { message: 'Invalid completion reason' })
  reason!: (typeof COMPLETE_REASONS)[number];
}
