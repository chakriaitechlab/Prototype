import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const collapseWhitespace = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value;

export class JoinWaitlistDto {
  @Transform(collapseWhitespace)
  @IsString()
  @IsNotEmpty({ message: 'Please enter your full name.' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters.' })
  fullName!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @Transform(({ value }: { value: unknown }) => {
    const text = collapseWhitespace({ value });
    return text === '' ? undefined : text;
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Occupation must not exceed 100 characters.' })
  occupation?: string;
}
