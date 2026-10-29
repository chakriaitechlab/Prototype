import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ClickDto {
  @Type(() => Number)
  @IsInt({ message: 'elementId must be an element number from the latest page snapshot' })
  @Min(0, { message: 'elementId must be an element number from the latest page snapshot' })
  elementId!: number;
}
