import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { ACTIVE_CHAT_USER, PEER_SELECT, peerSummary } from '../access/access.service.js';
import { SearchUsersDto } from './dto/search-users.dto.js';

const SEARCH_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(viewerId: string, dto: SearchUsersDto) {
    const { username } = dto;

    const rows = await this.prisma.user.findMany({
      where: {
        ...ACTIVE_CHAT_USER,
        id: { not: viewerId },
        OR: [{ username: { startsWith: username } }, { company: { username: { startsWith: username } } }],
      },
      orderBy: { username: 'asc' },
      take: SEARCH_LIMIT,
      select: PEER_SELECT,
    });

    return { items: rows.map(peerSummary) };
  }
}
