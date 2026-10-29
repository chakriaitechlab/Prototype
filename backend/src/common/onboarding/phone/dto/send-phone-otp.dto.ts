import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';

const normalizePhone = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('0') ? `880${digits.slice(1)}` : digits;
};

export class SendPhoneOtpDto {
  @Transform(normalizePhone)
  @Matches(/^\d{10,15}$/, { message: 'Enter a valid WhatsApp number with country code' })
  phoneNumber!: string;
}
