import { IsUUID } from 'class-validator';

export class JobDetailDto {
  @IsUUID('all', { message: 'jobId must be an id from list_my_jobs' })
  jobId!: string;
}
