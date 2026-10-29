import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SaveJobDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : 'private',
  )
  @IsIn(['private', 'govt'])
  jobType?: 'private' | 'govt';
}
