import { IsUUID } from 'class-validator';

export class SessionRefDto {
  @IsUUID('all', { message: 'Session must be a valid id' })
  sessionId!: string;
}
