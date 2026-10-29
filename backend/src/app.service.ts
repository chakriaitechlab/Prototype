import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello() {
    return {
      success: true,
      message: 'Chakri AI API is running...',
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV'),
      timestamp: new Date().toLocaleString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
