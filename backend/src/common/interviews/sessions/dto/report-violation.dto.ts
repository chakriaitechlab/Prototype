import { IsIn } from 'class-validator';

export const VIOLATION_TYPES = [
  'camera_unavailable',
  'camera_interrupted',
  'face_missing',
  'multiple_faces',
  'mobile_phone',
  'tab_hidden',
  'window_blur',
  'fullscreen_exit',
] as const;

export class ReportViolationDto {
  @IsIn(VIOLATION_TYPES, { message: 'Invalid violation type' })
  type!: (typeof VIOLATION_TYPES)[number];
}
