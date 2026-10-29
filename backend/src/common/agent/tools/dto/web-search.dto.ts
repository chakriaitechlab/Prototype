import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const QUERY_MAX_LENGTH = 300;

export class WebSearchDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'query must be a string' })
  @IsNotEmpty({ message: 'query cannot be empty' })
  @MaxLength(QUERY_MAX_LENGTH, { message: `query cannot exceed ${QUERY_MAX_LENGTH} characters` })
  query!: string;
}
