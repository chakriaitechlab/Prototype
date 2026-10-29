import { Transform } from 'class-transformer';
import { IsUrl } from 'class-validator';

export class NavigateDto {
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const url = value.trim();
    return /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;
  })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'url must be a valid http(s) URL' })
  url!: string;
}
