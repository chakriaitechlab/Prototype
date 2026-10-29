import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { ACTIVE_CHAT_USER } from '../access/access.service.js';
import type { ChatUser } from '../access/access.service.js';

const SOCKET_TOKEN_TTL_SECONDS = 60;
const SOCKET_TOKEN_TYPE = 'chat-socket';

interface SocketTokenPayload {
  sub: string;
  ver: number;
  typ: typeof SOCKET_TOKEN_TYPE;
}

@Injectable()
export class SocketTokenService {
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

  async verify(token: unknown): Promise<ChatUser | null> {
    if (typeof token !== 'string' || !token) return null;

    const payload = await this.jwtService.verifyAsync<SocketTokenPayload>(token).catch(() => null);
    if (payload?.typ !== SOCKET_TOKEN_TYPE) return null;

    const user = await this.prisma.user.findFirst({
      where: { ...ACTIVE_CHAT_USER, id: payload.sub, tokenVersion: payload.ver },
      select: { id: true, role: true },
    });
    return user;
  }
}
