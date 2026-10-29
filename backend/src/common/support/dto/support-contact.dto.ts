import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const collapseWhitespace = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : value;

export class SupportContactDto {
  @Transform(collapseWhitespace)
  @IsString()
  @IsNotEmpty({ message: 'Please enter your name.' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters.' })
  name!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email!: string;

  @Transform(collapseWhitespace)
  @IsString()
  @IsNotEmpty({ message: 'Please enter a subject.' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters.' })
  subject!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(10, { message: 'Message must be at least 10 characters long.' })
  @MaxLength(5000, { message: 'Message must not exceed 5000 characters.' })
  message!: string;
}
