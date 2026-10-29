import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import { LocalService } from '../local/local.service.js';
import type { OAuthProfile } from '../local/local.service.js';
import type { RequestMeta } from '../token/token.service.js';
import { LinkedinAuthDto } from './dto/linkedin-auth.dto.js';

interface LinkedinUserInfo {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

const SIGN_IN_FAILED = 'LinkedIn sign-in failed. Please try again.';

@Injectable()
export class LinkedinService {
  private readonly logger = new Logger(LinkedinService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    configService: ConfigService,
    private readonly rateLimit: RateLimitService,
    private readonly localService: LocalService,
  ) {
    this.clientId = configService.getOrThrow<string>('LINKEDIN_CLIENT_ID');
    this.clientSecret = configService.getOrThrow<string>('LINKEDIN_CLIENT_SECRET');
  }

  async authenticate(dto: LinkedinAuthDto, meta: RequestMeta) {
    const { code, redirectUri } = dto;

    await this.rateLimit.consume(`oauth:${meta.ip}`, { max: 30, windowSeconds: 15 * 60 });

    const accessToken = await this.exchangeCode(code, redirectUri);
    const profile = await this.fetchProfile(accessToken);
    return this.localService.signInWithProvider(profile, meta);
  }

  private async exchangeCode(code: string, redirectUri: string): Promise<string> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => undefined);

    const data = (await response?.json().catch(() => ({}))) as { access_token?: string } | undefined;

    if (!response?.ok || !data?.access_token) {
      this.logger.warn(`LinkedIn code exchange failed with status ${response?.status}`);
      throw new UnauthorizedException(SIGN_IN_FAILED);
    }

    return data.access_token;
  }

  private async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    }).catch(() => undefined);

    const data = (await response?.json().catch(() => ({}))) as LinkedinUserInfo | undefined;

    if (!response?.ok || !data?.email || !data.sub || data.email_verified === false) {
      throw new UnauthorizedException(SIGN_IN_FAILED);
    }

    return {
      email: data.email.toLowerCase(),
      provider: 'LINKEDIN',
      providerId: data.sub,
      name: data.name ?? null,
      avatarUrl: data.picture ?? null,
    };
  }
}
