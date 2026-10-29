import { IsOptional } from 'class-validator';

export class SaveCvDto {
  @IsOptional()
  profile?: Record<string, any>;

  [key: string]: any;
}
