import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { RedisService } from '../../../infrastructure/redis/redis.service.js';

const PRESENCE_KEY_PREFIX = 'chat:presence:';
const PRESENCE_KEY_TTL_SECONDS = 60 * 60 * 24;

export interface Presence {
  online: boolean;
  lastSeenAt: Date | null;
}

@Injectable()
export class PresenceService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PresenceService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async onApplicationBootstrap() {
    try {
      const stream = this.redis.scanStream({ match: `${PRESENCE_KEY_PREFIX}*`, count: 200 });
      for await (const keys of stream as AsyncIterable<string[]>) {
        if (keys.length) await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Could not reset stale presence: ${(error as Error).message}`);
    }
  }

  async connect(userId: string, socketId: string) {
    const key = keyOf(userId);
    const results = await this.redis.multi().sadd(key, socketId).expire(key, PRESENCE_KEY_TTL_SECONDS).scard(key).exec();
    return results?.[2]?.[1] === 1;
  }

  async disconnect(userId: string, socketId: string) {
    const key = keyOf(userId);
    await this.redis.srem(key, socketId);
    if ((await this.redis.scard(key)) > 0) return null;

    const lastSeenAt = new Date();
    await this.prisma.chatPresence.upsert({
      where: { userId },
      create: { userId, lastSeenAt },
      update: { lastSeenAt },
    });
    return lastSeenAt;
  }

  async snapshot(userIds: string[]) {
    const presence = new Map<string, Presence>();
    if (!userIds.length) return presence;

    const pipeline = this.redis.pipeline();
    userIds.forEach((id) => pipeline.scard(keyOf(id)));
    const [counts, rows] = await Promise.all([pipeline.exec(), this.prisma.chatPresence.findMany({ where: { userId: { in: userIds } } })]);
    const lastSeen = new Map(rows.map(({ userId, lastSeenAt }) => [userId, lastSeenAt]));

    userIds.forEach((id, index) => {
      const online = Number(counts?.[index]?.[1] ?? 0) > 0;
      presence.set(id, { online, lastSeenAt: online ? null : (lastSeen.get(id) ?? null) });
    });
    return presence;
  }
}

function keyOf(userId: string) {
  return `${PRESENCE_KEY_PREFIX}${userId}`;
}
