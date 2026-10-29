import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export const PAID_PLAN_IDS = ['pro', 'premium'] as const;

export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

export class CheckoutDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsIn(PAID_PLAN_IDS, { message: 'Invalid plan' })
  planId!: PaidPlanId;
}
