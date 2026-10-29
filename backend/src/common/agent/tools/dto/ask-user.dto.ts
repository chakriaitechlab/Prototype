import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

const QUESTION_MAX_LENGTH = 500;
export const ASK_OPTIONS_MAX = 4;
const OPTION_MAX_LENGTH = 60;

export class AskUserDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'question must be a string' })
  @IsNotEmpty({ message: 'question cannot be empty' })
  @MaxLength(QUESTION_MAX_LENGTH, { message: `question cannot exceed ${QUESTION_MAX_LENGTH} characters` })
  question!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value.map((option) => (typeof option === 'string' ? option.trim() : option)).filter(Boolean) : value,
  )
  @IsArray({ message: 'options must be a list of short answers' })
  @ArrayMaxSize(ASK_OPTIONS_MAX, { message: `options can have at most ${ASK_OPTIONS_MAX} answers` })
  @IsString({ each: true, message: 'each option must be text' })
  @MaxLength(OPTION_MAX_LENGTH, { each: true, message: `each option must be at most ${OPTION_MAX_LENGTH} characters` })
  options?: string[];
}
