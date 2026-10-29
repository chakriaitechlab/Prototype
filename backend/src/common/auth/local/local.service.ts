import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { AuthProvider } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import { OtpService } from '../otp/otp.service.js';
import { TokenService } from '../token/token.service.js';
import type { RequestMeta } from '../token/token.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_SECONDS = 15 * 60;
const SIGNUP_CLOSED_MESSAGE = 'Signup is currently closed. Please join the waitlist to get early access.';

export interface OAuthProfile {
  email: string;
  provider: Exclude<AuthProvider, 'LOCAL'>;
  providerId: string;
  name: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class LocalService {
  private readonly signupEnabled: boolean;
  private readonly deviceSignupLimit: { max: number; windowSeconds: number };

  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly rateLimit: RateLimitService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
  ) {
    this.signupEnabled = String(configService.get('ENABLED_SIGNUP', 'true')).trim().toLowerCase() !== 'false';
    this.deviceSignupLimit = {
      max: Number(configService.get('DEVICE_SIGNUP_MAX', 30)),
      windowSeconds: Number(configService.get('DEVICE_SIGNUP_WINDOW_DAYS', 30)) * 24 * 60 * 60,
    };
  }

  signupStatus() {
    return { signupEnabled: this.signupEnabled };
  }

  async register(dto: RegisterDto, { ip, deviceId }: RequestMeta) {
    const { email, password, name } = dto;

    this.assertSignupEnabled();
    await this.rateLimit.consume(`register:${ip}`, { max: 10, windowSeconds: 60 * 60 });
    await this.assertDeviceCanSignup(deviceId);

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser && (existingUser.emailVerified || existingUser.provider !== 'LOCAL')) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.upsert({
      where: { email },
      create: { email, passwordHash, name },
      update: { passwordHash, name },
    });

    if (!existingUser) await this.recordDeviceSignup(deviceId);

    await this.otpService.deliverEmailVerification(email);

    return {
      message: 'Registration successful. Please verify your email.',
      email,
      requiresEmailVerification: true,
    };
  }

  async login(dto: LoginDto, meta: RequestMeta) {
    const { email, password } = dto;
    const limitKey = `login:${meta.ip}:${email}`;

    await this.rateLimit.assertBelow(limitKey, LOGIN_MAX_FAILURES);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && !user.passwordHash) {
      throw new BadRequestException(
        `This account uses ${user.provider} sign-in. Please continue with ${user.provider}.`,
      );
    }

    const isValid = Boolean(user?.passwordHash && (await bcrypt.compare(password, user.passwordHash)));

    if (!user || !isValid || user.isBanned) {
      await this.prisma.signInEvent.create({
        data: { userId: user?.id, email, type: 'LOGIN_FAILED', ip: meta.ip, userAgent: meta.userAgent },
      });
      // The failure that reaches the limit already reports the lock instead of a plain 401.
      await this.rateLimit.consume(limitKey, {
        max: LOGIN_MAX_FAILURES - 1,
        windowSeconds: LOGIN_LOCK_SECONDS,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.rateLimit.clear(limitKey);

    if (!user.emailVerified) {
      await this.otpService.deliverEmailVerification(email).catch((err: unknown) => {
        if (!(err instanceof HttpException && err.getStatus() === HttpStatus.TOO_MANY_REQUESTS)) {
          throw err;
        }
      });
      throw new ForbiddenException({
        message: 'Please verify your email before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
        email,
      });
    }

    return this.tokenService.createSession(user, meta);
  }

  async signInWithProvider(profile: OAuthProfile, meta: RequestMeta) {
    const { email, provider, providerId, name, avatarUrl } = profile;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ provider, providerId }, { email }] },
    });

    if (existingUser?.isBanned) {
      throw new ForbiddenException('This account has been suspended.');
    }

    if (!existingUser) {
      this.assertSignupEnabled();
      await this.assertDeviceCanSignup(meta.deviceId);
    }

    const user = existingUser
      ? await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            name: existingUser.name ?? name,
            avatarUrl: existingUser.avatarUrl ?? avatarUrl,
          },
        })
      : await this.prisma.user.create({
          data: { email, name, avatarUrl, provider, providerId, emailVerified: true },
        });

    if (!existingUser) await this.recordDeviceSignup(meta.deviceId);

    return this.tokenService.createSession(user, meta);
  }

  private assertSignupEnabled() {
    if (!this.signupEnabled) throw new ForbiddenException(SIGNUP_CLOSED_MESSAGE);
  }

  private async assertDeviceCanSignup(deviceId?: string) {
    if (!deviceId) return;
    await this.rateLimit.assertBelow(
      `signup-device:${deviceId}`,
      this.deviceSignupLimit.max,
      'Too many accounts have been created from this device. Please contact support if you need help.',
    );
  }

  private async recordDeviceSignup(deviceId?: string) {
    if (!deviceId) return;
    await this.rateLimit.consume(`signup-device:${deviceId}`, this.deviceSignupLimit);
  }
}
