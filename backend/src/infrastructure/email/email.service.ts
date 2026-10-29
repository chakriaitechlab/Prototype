import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { buildOtpEmailHtml } from './template/otp-email.template.js';
import { buildResetPasswordEmailHtml } from './template/reset-password-email.template.js';
import { buildPasswordChangedEmailHtml, passwordChangeDetails, type PasswordChange } from './template/password-changed-email.template.js';
import { buildSupportAutoReplyEmailHtml, buildSupportInquiryEmailHtml, type SupportInquiry } from './template/support-email.template.js';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly supportEmail: string;

  constructor(configService: ConfigService) {
    this.resend = new Resend(configService.getOrThrow<string>('RESEND_API_KEY'));
    this.fromEmail = configService.getOrThrow<string>('RESEND_FROM');
    this.supportEmail = configService.getOrThrow<string>('SUPPORT_EMAIL');
  }

  sendOtpEmail(to: string, otp: string): Promise<boolean> {
    return this.send({
      to,
      subject: `${otp} is your Chakri AI verification code`,
      html: buildOtpEmailHtml(otp),
      text: `Your Chakri AI verification code is: ${otp}. It will expire in 5 minutes. If you did not request this code, please ignore this email.`,
    });
  }

  sendResetPasswordEmail(to: string, code: string): Promise<boolean> {
    return this.send({
      to,
      subject: `${code} is your Chakri AI password reset code`,
      html: buildResetPasswordEmailHtml(code),
      text: `Your Chakri AI password reset code is: ${code}. It will expire in 5 minutes. If you did not request a password reset, please ignore this email.`,
    });
  }

  sendPasswordChangedEmail(to: string, change: PasswordChange): Promise<boolean> {
    const { when, ip, device } = passwordChangeDetails(change);
    return this.send({
      to,
      subject: 'Your Chakri AI password was changed',
      html: buildPasswordChangedEmailHtml(change),
      text: `Your Chakri AI password was changed.\n\nWhen: ${when}\nIP address: ${ip}\nDevice: ${device}\n\nEvery other signed-in session has been logged out. If you didn't make this change, reset your password immediately and contact support@chakriai.com.`,
    });
  }

  sendSupportInquiry(inquiry: SupportInquiry): Promise<boolean> {
    const { name, email, subject, message, submittedAt } = inquiry;
    return this.send({
      to: this.supportEmail,
      replyTo: email,
      subject: `[Support Inquiry] ${subject} — from ${name}`,
      html: buildSupportInquiryEmailHtml(inquiry),
      text: `New support inquiry\n\nFrom: ${name} <${email}>\nWhen: ${submittedAt}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });
  }

  sendSupportAutoReply(to: string, name: string, subject: string): Promise<boolean> {
    return this.send({
      to,
      replyTo: this.supportEmail,
      subject: `We've received your message: ${subject}`,
      html: buildSupportAutoReplyEmailHtml(name, subject),
      text: `Hi ${name},\n\nThank you for contacting Chakri AI Support! We have received your message regarding "${subject}" and will get back to you within 1 business day (Saturday–Thursday, 9am–6pm GMT+6).\n\nIf you have any additional details, simply reply to this email.\n\nThe Chakri AI Support Team`,
    });
  }

  private async send({ to, subject, html, text, replyTo }: EmailPayload): Promise<boolean> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
        text,
        replyTo,
      });

      if (error) {
        this.logger.error(`Failed to send "${subject}" to ${to}: ${error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error(`Unexpected error sending email to ${to}: ${(err as Error).message}`);
      return false;
    }
  }
}
