import { IsBoolean } from 'class-validator';
import { SessionRefDto } from './session-ref.dto.js';

export class WatchBrowserDto extends SessionRefDto {
  @IsBoolean({ message: 'watching must be true or false' })
  watching!: boolean;
}
