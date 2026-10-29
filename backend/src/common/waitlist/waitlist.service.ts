import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { RateLimitService } from '../../infrastructure/rate-limit/rate-limit.service.js';
import { JoinWaitlistDto } from './dto/join-waitlist.dto.js';

const JOIN_LIMIT = { max: 5, windowSeconds: 60 * 60 };

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rateLimit: RateLimitService,
  ) {}

  async join(dto: JoinWaitlistDto, ip: string) {
    const { fullName, email, occupation } = dto;
    await this.rateLimit.consume(`waitlist-join:${ip}`, JOIN_LIMIT);

    const [user, existing] = await Promise.all([
      this.prisma.user.findUnique({ where: { email }, select: { id: true } }),
      this.prisma.waitlist.findUnique({ where: { email }, select: { id: true } }),
    ]);
    if (user) {
      throw new ConflictException('An account with this email already exists. Please sign in instead.');
    }
    if (existing) {
      throw new ConflictException('This email is already on the waitlist.');
    }

    await this.prisma.waitlist.create({ data: { fullName, email, occupation } });
    this.logger.log(`New waitlist entry: ${email}`);

    return {
      success: true,
      message: "You're on the waitlist! We'll email you as soon as signup opens.",
    };
  }
}
