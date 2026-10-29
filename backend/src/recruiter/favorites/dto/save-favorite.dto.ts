import { IsUUID } from 'class-validator';

export class SaveFavoriteDto {
  @IsUUID('all', { message: 'Candidate id must be a valid id' })
  candidateId!: string;
}
