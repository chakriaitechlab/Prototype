import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GatewayResponse {
  message?: string | string[];
  data?: { messageId?: string };
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(configService: ConfigService) {
    this.baseUrl = configService
      .get<string>('WA_GATEWAY_URL', 'https://wapi.ars2k03.online')
      .replace(/\/$/, '');
    this.apiKey = configService.get<string>('WA_GATEWAY_KEY', '');
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<string | undefined> {
    if (!this.apiKey) {
      this.logger.error('WA_GATEWAY_KEY is not configured');
      throw new ServiceUnavailableException('Could not send the code. Please try again later.');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/send-otp`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}`, otp }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      this.logger.error(`WhatsApp gateway unreachable: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Could not send the code. Please try again later.');
    }

    const body = (await response.json().catch(() => ({}))) as GatewayResponse;
    if (response.ok) return body.data?.messageId;

    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;

    switch (response.status) {
      case 400:
        throw new BadRequestException(message || 'Check your WhatsApp number and try again.');
      case 429:
        throw new HttpException(
          'Too many code requests. Please wait a minute and try again.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      default:
        this.logger.error(`WhatsApp gateway error ${response.status}: ${message}`);
        throw new ServiceUnavailableException('Could not send the code. Please try again later.');
    }
  }
}
