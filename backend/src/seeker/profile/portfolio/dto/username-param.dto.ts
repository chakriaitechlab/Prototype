import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';

export class UsernameParamDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(/^[a-z][a-z0-9_]{2,29}$/, { message: 'Invalid username' })
  username!: string;
}
