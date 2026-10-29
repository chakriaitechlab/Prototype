import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

export const WORKER_KEY_HEADER = 'x-worker-key';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** Lets the external govt-jobs worker in with a shared key; fails closed when the key is not configured. */
@Injectable()
export class WorkerKeyGuard implements CanActivate {
  private readonly expected: Buffer | null;

  constructor(configService: ConfigService) {
    const key = configService.get<string>('GOVT_JOBS_WORKER_KEY')?.trim();
    this.expected = key ? digest(key) : null;
  }

  canActivate(context: ExecutionContext): boolean {
    const provided = context.switchToHttp().getRequest<Request>().header(WORKER_KEY_HEADER);

    if (!this.expected || !provided || !timingSafeEqual(digest(provided), this.expected)) {
      throw new UnauthorizedException('Invalid worker key');
    }

    return true;
  }
}
