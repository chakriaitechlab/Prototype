import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { Role } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import type { JwtPayload } from '../token/token.service.js';

export interface AuthenticatedUser extends Pick<JwtPayload, 'sub' | 'email'> {
  role: Role | null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token).catch(() => null);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { tokenVersion: true, isBanned: true, role: true },
    });

    if (!user || user.isBanned || user.tokenVersion !== payload.ver) {
      throw new UnauthorizedException('Session expired. Please sign in again.');
    }

    request.user = { sub: payload.sub, email: payload.email, role: user.role };
    return true;
  }
}
