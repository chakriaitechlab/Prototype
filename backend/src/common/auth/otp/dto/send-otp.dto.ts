import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class SendOtpDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}
