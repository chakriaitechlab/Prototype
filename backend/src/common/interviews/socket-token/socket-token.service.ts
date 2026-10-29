import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

const SOCKET_TOKEN_TTL_SECONDS = 60;
const SOCKET_TOKEN_TYPE = 'interview-socket';

interface SocketTokenPayload {
  sub: string;
  ver: number;
  typ: typeof SOCKET_TOKEN_TYPE;
}

export interface InterviewSocketUser {
  id: string;
}

@Injectable()
export class InterviewSocketTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async issue(userId: string) {
    const { tokenVersion } = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { tokenVersion: true } });
    const payload: SocketTokenPayload = { sub: userId, ver: tokenVersion, typ: SOCKET_TOKEN_TYPE };
    const token = await this.jwtService.signAsync(payload, { expiresIn: SOCKET_TOKEN_TTL_SECONDS });
    return { token, expiresIn: SOCKET_TOKEN_TTL_SECONDS };
  }

  async verify(token: unknown): Promise<InterviewSocketUser | null> {
    if (typeof token !== 'string' || !token) return null;

    const payload = await this.jwtService.verifyAsync<SocketTokenPayload>(token).catch(() => null);
    if (payload?.typ !== SOCKET_TOKEN_TYPE) return null;

    return this.prisma.user.findFirst({
      where: { id: payload.sub, tokenVersion: payload.ver, role: 'SEEKER', isBanned: false },
      select: { id: true },
    });
  }
}
