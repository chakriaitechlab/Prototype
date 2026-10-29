import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(configService: ConfigService) {
    const redisUrl = configService.getOrThrow<string>('REDIS_URL');
    super(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    this.on('error', (err) => {
      this.logger.error('❌ Redis client error:', err.message);
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
      this.logger.log('🚀 Redis connected successfully! 🟢');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Redis! 🔴', error);
    }
  }

  async onModuleDestroy() {
    await this.quit().catch(() => {});
    this.logger.log('🔌 Redis disconnected. 👋');
  }
}
