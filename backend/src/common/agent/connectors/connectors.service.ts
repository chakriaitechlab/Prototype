import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { AgentConnectorProvider } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import type { ConnectGmailDto } from './dto/connect-gmail.dto.js';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.modify';
const GMAIL_SCOPES = ['openid', 'email', GMAIL_SCOPE];
const STATE_TYPE = 'gmail-connect';
const STATE_TTL_SECONDS = 10 * 60;
const CIPHER = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_BYTES = 32;
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

const CONNECTOR_SELECT = { provider: true, email: true, createdAt: true } as const;

const CONNECT_FAILED = 'Could not connect Gmail. Please try again.';
const RECONNECT_GMAIL = 'Gmail access has expired.';

export class GmailNotConnectedError extends Error {}

interface StatePayload {
  sub: string;
  typ: typeof STATE_TYPE;
}

@Injectable()
export class ConnectorsService {
  private readonly logger = new Logger(ConnectorsService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly key: Buffer;
  private readonly accessTokens = new Map<string, { token: string; expiresAt: number }>();

  constructor(
    configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly rateLimit: RateLimitService,
  ) {
    this.clientId = configService.getOrThrow<string>('GOOGLE_CLIENT_ID');
    this.clientSecret = configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET');
    this.redirectUri = configService.getOrThrow<string>('GMAIL_REDIRECT_URI');
    this.key = Buffer.from(configService.getOrThrow<string>('CONNECTOR_ENCRYPTION_KEY'), 'base64');
    if (this.key.length !== KEY_BYTES) throw new Error(`CONNECTOR_ENCRYPTION_KEY must be ${KEY_BYTES} bytes in base64`);
  }

  list(userId: string) {
    return this.prisma.agentConnector.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, select: CONNECTOR_SELECT });
  }

  async gmailAuthUrl(userId: string) {
    const payload: StatePayload = { sub: userId, typ: STATE_TYPE };
    const state = await this.jwtService.signAsync(payload, { expiresIn: STATE_TTL_SECONDS });
    const url = this.client().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GMAIL_SCOPES,
      state,
    });
    return { url };
  }

  async connectGmail(userId: string, dto: ConnectGmailDto) {
    const { code, state } = dto;
    await this.rateLimit.consume(`gmail-connect:${userId}`, { max: 10, windowSeconds: 15 * 60 });

    const payload = await this.jwtService.verifyAsync<StatePayload>(state).catch(() => null);
    if (payload?.typ !== STATE_TYPE || payload.sub !== userId) {
      throw new BadRequestException('This Gmail connection link has expired. Please try again.');
    }

    const client = this.client();
    const { tokens } = await client.getToken(code).catch((error: unknown) => {
      this.logger.warn(`Gmail token exchange failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException(CONNECT_FAILED);
    });
    if (!tokens.refresh_token || !tokens.id_token) throw new BadRequestException(CONNECT_FAILED);
    if (!tokens.scope?.split(' ').includes(GMAIL_SCOPE)) {
      throw new BadRequestException('Please allow access to Gmail to connect it.');
    }

    const email = await client
      .verifyIdToken({ idToken: tokens.id_token, audience: this.clientId })
      .then((ticket) => ticket.getPayload()?.email?.toLowerCase())
      .catch(() => undefined);
    if (!email) throw new BadRequestException(CONNECT_FAILED);

    const data = { email, refreshToken: this.encrypt(tokens.refresh_token), scope: tokens.scope };
    return this.prisma.agentConnector.upsert({
      where: { userId_provider: { userId, provider: AgentConnectorProvider.GMAIL } },
      create: { userId, provider: AgentConnectorProvider.GMAIL, ...data },
      update: data,
      select: CONNECTOR_SELECT,
    });
  }

  async disconnectGmail(userId: string) {
    this.accessTokens.delete(userId);
    const connector = await this.findGmail(userId);
    if (!connector) throw new NotFoundException('Gmail is not connected');

    await this.client()
      .revokeToken(this.decrypt(connector.refreshToken))
      .catch(() => {});
    await this.prisma.agentConnector.delete({ where: { id: connector.id } });
    return { message: 'Gmail disconnected' };
  }

  async gmailAccessToken(userId: string) {
    const cached = this.accessTokens.get(userId);
    if (cached && cached.expiresAt > Date.now() + TOKEN_EXPIRY_MARGIN_MS) return cached.token;

    const connector = await this.findGmail(userId);
    if (!connector) throw new GmailNotConnectedError('Gmail is not connected.');

    const client = this.client();
    client.setCredentials({ refresh_token: this.decrypt(connector.refreshToken) });
    const { token } = await client.getAccessToken().catch(async (error: unknown) => {
      this.logger.warn(`Gmail token refresh failed for ${userId}: ${error instanceof Error ? error.message : String(error)}`);
      await this.prisma.agentConnector.delete({ where: { id: connector.id } }).catch(() => {});
      throw new GmailNotConnectedError(RECONNECT_GMAIL);
    });
    if (!token) throw new GmailNotConnectedError(RECONNECT_GMAIL);

    this.accessTokens.set(userId, { token, expiresAt: client.credentials.expiry_date ?? 0 });
    return token;
  }

  private findGmail(userId: string) {
    return this.prisma.agentConnector.findUnique({
      where: { userId_provider: { userId, provider: AgentConnectorProvider.GMAIL } },
      select: { id: true, refreshToken: true },
    });
  }

  private client() {
    return new OAuth2Client({ clientId: this.clientId, clientSecret: this.clientSecret, redirectUri: this.redirectUri });
  }

  private encrypt(value: string) {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(CIPHER, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
  }

  private decrypt(value: string) {
    const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv(CIPHER, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }
}
