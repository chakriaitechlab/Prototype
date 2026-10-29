import { Transform } from 'class-transformer';
import { IsIn } from 'class-validator';

export const SCROLL_DIRECTIONS = ['up', 'down'] as const;

export class ScrollDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsIn(SCROLL_DIRECTIONS, { message: 'direction must be "up" or "down"' })
  direction!: (typeof SCROLL_DIRECTIONS)[number];
}
