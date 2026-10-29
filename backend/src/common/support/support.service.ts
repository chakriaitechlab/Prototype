import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../infrastructure/email/email.service.js';
import { RateLimitService } from '../../infrastructure/rate-limit/rate-limit.service.js';
import { SupportContactDto } from './dto/support-contact.dto.js';

const CONTACT_LIMIT = { max: 5, windowSeconds: 60 * 60 };

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly rateLimit: RateLimitService,
  ) {}

  async submitContact(dto: SupportContactDto, ip: string) {
    const { name, email, subject, message } = dto;
    await this.rateLimit.consume(`support-contact:${ip}`, CONTACT_LIMIT);

    this.logger.log(`Support inquiry from "${name}" <${email}> - Subject: "${subject}"`);

    const submittedAt = `${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`;
    await Promise.all([
      this.emailService.sendSupportInquiry({ name, email, subject, message, submittedAt }),
      this.emailService.sendSupportAutoReply(email, name, subject),
    ]);

    return {
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    };
  }
}
