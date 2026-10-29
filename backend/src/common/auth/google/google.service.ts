import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import { LocalService } from '../local/local.service.js';
import type { OAuthProfile } from '../local/local.service.js';
import type { RequestMeta } from '../token/token.service.js';
import { GoogleAuthDto } from './dto/google-auth.dto.js';

@Injectable()
export class GoogleService {
  private readonly oauthClient: OAuth2Client;
  private readonly clientId: string;

  constructor(
    configService: ConfigService,
    private readonly rateLimit: RateLimitService,
    private readonly localService: LocalService,
  ) {
    this.clientId = configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.oauthClient = new OAuth2Client(this.clientId);
  }

  async authenticate(dto: GoogleAuthDto, meta: RequestMeta) {
    const { idToken } = dto;

    await this.rateLimit.consume(`oauth:${meta.ip}`, { max: 30, windowSeconds: 15 * 60 });

    const profile = await this.verifyIdToken(idToken);
    return this.localService.signInWithProvider(profile, meta);
  }

  private async verifyIdToken(idToken: string): Promise<OAuthProfile> {
    const payload = await this.oauthClient
      .verifyIdToken({ idToken, audience: this.clientId })
      .then((ticket) => ticket.getPayload())
      .catch(() => undefined);

    if (!payload?.email || !payload.sub || payload.email_verified === false) {
      throw new UnauthorizedException('Google sign-in failed. Please try again.');
    }

    return {
      email: payload.email.toLowerCase(),
      provider: 'GOOGLE',
      providerId: payload.sub,
      name: payload.name ?? null,
      avatarUrl: payload.picture ?? null,
    };
  }
}
