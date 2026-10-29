import { IsIn } from 'class-validator';

export const OPPORTUNITY_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'] as const;

export class UpdateJobDto {
  @IsIn(OPPORTUNITY_STATUSES)
  status!: (typeof OPPORTUNITY_STATUSES)[number];
}
