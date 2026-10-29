import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class LinkedinAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'LinkedIn authorization code is required' })
  code!: string;

  @IsUrl({ require_tld: false }, { message: 'Redirect URI must be a valid URL' })
  redirectUri!: string;
}
