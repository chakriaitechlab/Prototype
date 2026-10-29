import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { EmailService } from '../../../infrastructure/email/email.service.js';
import { OTP_TTL_SECONDS, OtpService } from '../otp/otp.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && !user.isBanned) {
      const code = await this.otpService.issue('password-reset', email);
      const sent = await this.emailService.sendResetPasswordEmail(email, code);

      if (!sent) {
        await this.otpService.revoke('password-reset', email);
        throw new ServiceUnavailableException('Failed to send reset code. Please try again.');
      }
    }

    return {
      message: 'If an account exists for this email, a reset code has been sent.',
      email,
      expiresIn: OTP_TTL_SECONDS,
    };
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    const { email, code } = dto;

    await this.otpService.verify('password-reset', email, code, { consume: false });

    return { message: 'Code verified. You can now set a new password.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, code, newPassword } = dto;

    await this.otpService.verify('password-reset', email, code, { consume: false });

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Code has expired or is invalid. Please request a new code.');
    }

    if (user.passwordHash && (await bcrypt.compare(newPassword, user.passwordHash))) {
      throw new BadRequestException('New password cannot be the same as your old password.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(newPassword, 10),
        emailVerified: true,
        tokenVersion: { increment: 1 },
      },
    });

    await this.otpService.revoke('password-reset', email);

    return { message: 'Password reset successful. Please sign in with your new password.' };
  }
}
