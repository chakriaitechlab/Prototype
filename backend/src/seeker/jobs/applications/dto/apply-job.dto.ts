import { IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export const CV_SOURCES = ['profile', 'upload'] as const;

export type CvSource = (typeof CV_SOURCES)[number];

export class ApplyJobDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsIn(CV_SOURCES, { message: 'cvSource must be profile or upload' })
  cvSource!: CvSource;
}
