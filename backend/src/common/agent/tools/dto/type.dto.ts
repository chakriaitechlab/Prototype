import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const TEXT_MAX_LENGTH = 2000;

export class TypeDto {
  @Type(() => Number)
  @IsInt({ message: 'elementId must be an element number from the latest page snapshot' })
  @Min(0, { message: 'elementId must be an element number from the latest page snapshot' })
  elementId!: number;

  @IsString({ message: 'text must be a string' })
  @IsNotEmpty({ message: 'text cannot be empty' })
  @MaxLength(TEXT_MAX_LENGTH, { message: `text cannot exceed ${TEXT_MAX_LENGTH} characters` })
  text!: string;

  @IsOptional()
  @IsBoolean({ message: 'submit must be true or false' })
  submit?: boolean;
}
