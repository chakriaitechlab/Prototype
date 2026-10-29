import { Transform } from 'class-transformer';
import { IsUrl } from 'class-validator';

export class WebFetchDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'url must be a valid http(s) URL' })
  url!: string;
}
