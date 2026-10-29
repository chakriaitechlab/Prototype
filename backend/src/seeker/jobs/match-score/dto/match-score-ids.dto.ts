import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

const MAX_IDS = 100;

export class MatchScoreIdsDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one job id is required' })
  @ArrayMaxSize(MAX_IDS, { message: `You can request up to ${MAX_IDS} jobs at a time` })
  @IsUUID('all', { each: true, message: 'Each job id must be a valid id' })
  ids!: string[];
}
