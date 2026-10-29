import { IsUUID } from 'class-validator';

export class WatchPresenceDto {
  @IsUUID('all', { message: 'User must be a valid id' })
  userId!: string;
}
