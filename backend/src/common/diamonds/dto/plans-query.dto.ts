import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export const PLAN_AUDIENCES = ['seeker', 'recruiter'] as const;

export class PlansQueryDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsIn(PLAN_AUDIENCES, { message: 'Role must be seeker or recruiter' })
  role!: (typeof PLAN_AUDIENCES)[number];
}
