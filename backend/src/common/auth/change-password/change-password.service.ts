import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { EmailService } from '../../../infrastructure/email/email.service.js';
import { RateLimitService } from '../../../infrastructure/rate-limit/rate-limit.service.js';
import { TokenService } from '../token/token.service.js';
import type { RequestMeta } from '../token/token.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';

const CHANGE_PASSWORD_MAX_ATTEMPTS = 5;
const CHANGE_PASSWORD_WINDOW_SECONDS = 15 * 60;

@Injectable()
export class ChangePasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly rateLimit: RateLimitService,
    private readonly tokenService: TokenService,
  ) {}

  async changePassword(userId: string, dto: ChangePasswordDto, { ip, userAgent }: RequestMeta) {
    const { newPassword } = dto;

    await this.rateLimit.consume(`change-password:${userId}`, {
      max: CHANGE_PASSWORD_MAX_ATTEMPTS,
      windowSeconds: CHANGE_PASSWORD_WINDOW_SECONDS,
    });

    const { passwordHash } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (passwordHash && (await bcrypt.compare(newPassword, passwordHash))) {
      throw new BadRequestException('New password must be different from your current password.');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(newPassword, 10),
        tokenVersion: { increment: 1 },
      },
      select: { id: true, email: true, tokenVersion: true },
    });

    void this.emailService.sendPasswordChangedEmail(user.email, { changedAt: new Date(), ip, userAgent });

    return {
      message: 'Password changed successfully',
      access_token: await this.tokenService.issueToken(user),
    };
  }
}
