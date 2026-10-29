import { IsString, MaxLength, MinLength } from 'class-validator';
import { VerifyResetCodeDto } from './verify-reset-code.dto.js';

export class ResetPasswordDto extends VerifyResetCodeDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  newPassword!: string;
}
