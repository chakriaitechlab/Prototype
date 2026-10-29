import { Transform } from 'class-transformer';
import { Matches } from 'class-validator';

export class SearchUsersDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase().replace(/^@/, '') : value))
  @Matches(/^[a-z0-9_]{2,30}$/, { message: 'Type at least 2 characters of a username' })
  username!: string;
}
