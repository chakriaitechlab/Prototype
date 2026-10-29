import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { MeService } from '../me/me.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  ver: number;
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
  deviceId?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly meService: MeService,
  ) {}

  async createSession(
    user: Pick<User, 'id' | 'email' | 'tokenVersion'>,
    { ip, userAgent }: RequestMeta,
  ) {
    const { id, email } = user;

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date(), lastLoginIp: ip },
      }),
      this.prisma.signInEvent.create({
        data: { userId: id, email, type: 'LOGIN_SUCCESS', ip, userAgent },
      }),
    ]);

    return {
      access_token: await this.issueToken(user),
      user: await this.meService.getMe(id),
    };
  }

  issueToken({ id, email, tokenVersion }: Pick<User, 'id' | 'email' | 'tokenVersion'>) {
    const payload: JwtPayload = { sub: id, email, ver: tokenVersion };
    return this.jwtService.signAsync(payload);
  }
}
