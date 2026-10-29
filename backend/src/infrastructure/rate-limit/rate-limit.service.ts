import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';

interface Limit {
  max: number;
  windowSeconds: number;
}

@Injectable()
export class RateLimitService {
  constructor(private readonly redis: RedisService) {}

  async consume(key: string, { max, windowSeconds }: Limit) {
    const redisKey = `rl:${key}`;
    const count = await this.redis.incr(redisKey);
    if (count === 1) await this.redis.expire(redisKey, windowSeconds);
    if (count > max) await this.reject(redisKey);
  }

  async assertBelow(key: string, max: number, message?: string) {
    const redisKey = `rl:${key}`;
    const count = Number(await this.redis.get(redisKey));
    if (count >= max) await this.reject(redisKey, message);
  }

  async clear(key: string) {
    await this.redis.del(`rl:${key}`, `cd:${key}`);
  }

  async cooldown(key: string, seconds: number) {
    const redisKey = `cd:${key}`;
    const acquired = await this.redis.set(redisKey, '1', 'EX', seconds, 'NX');
    if (!acquired) await this.reject(redisKey);
  }

  private async reject(redisKey: string, message?: string): Promise<never> {
    const ttl = await this.redis.ttl(redisKey);
    const wait = ttl > 0 ? ttl : 60;
    throw new HttpException(
      {
        message: message ?? `Too many attempts. Please try again in ${wait} seconds.`,
        code: 'RATE_LIMITED',
        retryAfter: wait,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
