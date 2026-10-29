import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { WhatsappService } from '../../../infrastructure/whatsapp/whatsapp.service.js';
import { OTP_TTL_SECONDS, OtpService } from '../../auth/otp/otp.service.js';
import { MeService } from '../../auth/me/me.service.js';
import { SendPhoneOtpDto } from './dto/send-phone-otp.dto.js';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto.js';

@Injectable()
export class PhoneService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly otpService: OtpService,
    private readonly meService: MeService,
  ) {}

  async sendOtp(userId: string, dto: SendPhoneOtpDto) {
    const { phoneNumber } = dto;

    await this.assertPhoneAvailable(userId, phoneNumber);

    const target = `${userId}:${phoneNumber}`;
    const code = await this.otpService.issue('phone-verify', target);

    try {
      await this.whatsappService.sendOtp(phoneNumber, code);
    } catch (err) {
      await this.otpService.revoke('phone-verify', target);
      throw err;
    }

    return {
      message: 'Verification code sent to your WhatsApp',
      phoneNumber,
      expiresIn: OTP_TTL_SECONDS,
    };
  }

  async verifyOtp(userId: string, dto: VerifyPhoneOtpDto) {
    const { phoneNumber, code } = dto;

    await this.otpService.verify('phone-verify', `${userId}:${phoneNumber}`, code);
    await this.assertPhoneAvailable(userId, phoneNumber);

    await this.prisma.user.update({
      where: { id: userId },
      data: { phoneNumber, phoneVerified: true },
    });

    return this.meService.getMe(userId);
  }

  private async assertPhoneAvailable(userId: string, phoneNumber: string) {
    const owner = await this.prisma.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });

    if (owner && owner.id !== userId) {
      throw new ConflictException('This number is already linked to another account');
    }
  }
}
