import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { RedisService } from '../../../infrastructure/redis/redis.service.js';
import { EmailService } from '../../../infrastructure/email/email.service.js';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import { TokenService } from '../token/token.service.js';
import type { RequestMeta } from '../token/token.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

export const OTP_TTL_SECONDS = 300;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 30;

type OtpScope = 'email-verify' | 'password-reset' | 'phone-verify';

interface StoredOtp {
  hash: string;
  attempts: number;
}

const hashCode = (code: string) => createHash('sha256').update(code).digest();

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly emailService: EmailService,
    private readonly rateLimit: RateLimitService,
    private readonly tokenService: TokenService,
  ) {}

  async issue(scope: OtpScope, target: string): Promise<string> {
    await this.rateLimit.cooldown(`otp:${scope}:${target}`, OTP_RESEND_COOLDOWN_SECONDS);

    const code = randomInt(100000, 1000000).toString();
    const stored: StoredOtp = { hash: hashCode(code).toString('hex'), attempts: 0 };
    await this.redis.set(this.key(scope, target), JSON.stringify(stored), 'EX', OTP_TTL_SECONDS);

    return code;
  }

  async verify(scope: OtpScope, target: string, code: string, { consume = true } = {}) {
    const key = this.key(scope, target);
    const raw = await this.redis.get(key);

    if (!raw) {
      throw new BadRequestException('Code has expired or is invalid. Please request a new code.');
    }

    const stored = JSON.parse(raw) as StoredOtp;
    const matches = timingSafeEqual(hashCode(code), Buffer.from(stored.hash, 'hex'));

    if (!matches) {
      stored.attempts += 1;
      if (stored.attempts >= OTP_MAX_ATTEMPTS) {
        await this.redis.del(key);
        throw new BadRequestException('Too many incorrect attempts. Please request a new code.');
      }
      await this.redis.set(key, JSON.stringify(stored), 'KEEPTTL');
      throw new BadRequestException('Incorrect code. Please check and try again.');
    }

    if (consume) await this.redis.del(key);
  }

  async revoke(scope: OtpScope, target: string) {
    await this.redis.del(this.key(scope, target));
    await this.rateLimit.clear(`otp:${scope}:${target}`);
  }

  async sendEmailVerification(dto: SendOtpDto) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('No account found with this email address.');
    }
    if (user.emailVerified) {
      throw new BadRequestException('This email is already verified.');
    }

    await this.deliverEmailVerification(email);

    return { message: 'Verification code sent successfully', email, expiresIn: OTP_TTL_SECONDS };
  }

  async deliverEmailVerification(email: string) {
    const code = await this.issue('email-verify', email);
    const sent = await this.emailService.sendOtpEmail(email, code);

    if (!sent) {
      await this.revoke('email-verify', email);
      throw new ServiceUnavailableException('Failed to send verification email. Please try again.');
    }
  }

  async verifyEmail(dto: VerifyOtpDto, meta: RequestMeta) {
    const { email, code } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('No account found with this email address.');
    }

    await this.verify('email-verify', email, code);

    const verifiedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return this.tokenService.createSession(verifiedUser, meta);
  }

  private key(scope: OtpScope, target: string) {
    return `otp:${scope}:${target}`;
  }
}
