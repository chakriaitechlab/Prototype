import { IsBoolean } from 'class-validator';

export class ReplyAccessDto {
  @IsBoolean({ message: 'Allowed must be true or false' })
  allowed!: boolean;
}
