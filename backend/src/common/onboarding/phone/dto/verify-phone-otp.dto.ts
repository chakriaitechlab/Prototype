import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';
import { SendPhoneOtpDto } from './send-phone-otp.dto.js';

export class VerifyPhoneOtpDto extends SendPhoneOtpDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits' })
  code!: string;
}
