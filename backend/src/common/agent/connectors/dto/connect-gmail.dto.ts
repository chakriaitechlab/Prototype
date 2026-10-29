import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const CODE_MAX_LENGTH = 2048;
const STATE_MAX_LENGTH = 2048;

export class ConnectGmailDto {
  @IsString({ message: 'Authorization code is required' })
  @IsNotEmpty({ message: 'Authorization code is required' })
  @MaxLength(CODE_MAX_LENGTH)
  code!: string;

  @IsString({ message: 'State is required' })
  @IsNotEmpty({ message: 'State is required' })
  @MaxLength(STATE_MAX_LENGTH)
  state!: string;
}
