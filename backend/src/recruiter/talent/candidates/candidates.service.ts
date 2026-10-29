import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { candidateFavoriteKey } from '../../favorites/favorites.service.js';
import { ListCandidatesDto } from './dto/list-candidates.dto.js';

const DEFAULT_CANDIDATE_TITLE = 'Job Seeker';
const DEFAULT_CANDIDATE_LOCATION = 'Bangladesh';

@Injectable()
export class CandidatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(recruiterId: string, dto: ListCandidatesDto) {
    const { q, page, limit } = dto;

    const where: Prisma.UserWhereInput = {
      role: 'SEEKER',
      isBanned: false,
      ...(q && {
        OR: [
          { name: contains(q) },
          { username: contains(q) },
          { email: contains(q) },
          { seekerProfile: { headline: contains(q) } },
          { seekerProfile: { location: contains(q) } },
          { seekerProfile: { about: contains(q) } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          phoneVerified: true,
          seekerProfile: { select: { headline: true, location: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const saved = await this.prisma.recruiterFavorite.findMany({
      where: { recruiterId, targetKey: { in: users.map((user) => candidateFavoriteKey(user.id)) } },
      select: { targetKey: true },
    });
    const savedKeys = new Set(saved.map((row) => row.targetKey));

    return {
      items: users.map((user) => ({
        id: user.id,
        username: user.username,
        name: displayName(user),
        title: user.seekerProfile?.headline?.trim() || DEFAULT_CANDIDATE_TITLE,
        location: user.seekerProfile?.location?.trim() || DEFAULT_CANDIDATE_LOCATION,
        avatarUrl: user.avatarUrl,
        phoneVerified: user.phoneVerified,
        isSaved: savedKeys.has(candidateFavoriteKey(user.id)),
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}

function contains(value: string) {
  return { contains: value, mode: 'insensitive' as const };
}

function displayName(user: { name: string | null; username: string | null; email: string }) {
  return user.name?.trim() || user.username?.trim() || user.email.split('@')[0];
}
