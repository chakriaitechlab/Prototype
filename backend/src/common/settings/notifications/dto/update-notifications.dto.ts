import { IsBoolean } from 'class-validator';

export class UpdateNotificationsDto {
  @IsBoolean()
  emailEnabled!: boolean;

  @IsBoolean()
  pushEnabled!: boolean;

  @IsBoolean()
  smsEnabled!: boolean;

  @IsBoolean()
  applicationUpdates!: boolean;

  @IsBoolean()
  interviewReminders!: boolean;

  @IsBoolean()
  jobMatches!: boolean;
}
