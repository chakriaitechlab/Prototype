import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { SaveFavoriteDto } from './dto/save-favorite.dto.js';

const CANDIDATE_KEY_PREFIX = 'candidate:';
const DEFAULT_FAVORITE_NAME = 'Talent';
const DEFAULT_FAVORITE_TITLE = 'Job Seeker';

const CANDIDATE_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
  avatarUrl: true,
  seekerProfile: { select: { headline: true } },
} satisfies Prisma.UserSelect;

type CandidateRow = Prisma.UserGetPayload<{ select: typeof CANDIDATE_SELECT }>;

interface FavoriteSnapshot {
  name?: string;
  title?: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export function candidateFavoriteKey(candidateId: string) {
  return `${CANDIDATE_KEY_PREFIX}${candidateId}`;
}

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(recruiterId: string) {
    const rows = await this.prisma.recruiterFavorite.findMany({
      where: { recruiterId, targetKey: { startsWith: CANDIDATE_KEY_PREFIX } },
      orderBy: { createdAt: 'desc' },
    });

    const candidates = await this.prisma.user.findMany({
      where: { id: { in: rows.map((row) => candidateIdOf(row.targetKey)) } },
      select: CANDIDATE_SELECT,
    });
    const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));

    return {
      items: rows.map((row) => {
        const candidateId = candidateIdOf(row.targetKey);
        const candidate = candidateById.get(candidateId);
        const profile = candidate ? snapshotOf(candidate) : parseSnapshot(row.snapshot);

        return {
          id: row.id,
          candidateId,
          name: profile.name || DEFAULT_FAVORITE_NAME,
          title: profile.title || DEFAULT_FAVORITE_TITLE,
          username: profile.username ?? null,
          avatarUrl: profile.avatarUrl ?? null,
          createdAt: row.createdAt,
        };
      }),
      total: rows.length,
    };
  }

  async save(recruiterId: string, dto: SaveFavoriteDto) {
    const { candidateId } = dto;

    const candidate = await this.prisma.user.findFirst({
      where: { id: candidateId, role: 'SEEKER', isBanned: false },
      select: CANDIDATE_SELECT,
    });
    if (!candidate) throw new NotFoundException('Candidate not found');

    const targetKey = candidateFavoriteKey(candidate.id);
    const snapshot = { ...snapshotOf(candidate) };

    await this.prisma.recruiterFavorite.upsert({
      where: { recruiterId_targetKey: { recruiterId, targetKey } },
      create: { recruiterId, targetKey, snapshot },
      update: { snapshot },
    });

    return { saved: true, message: `Saved ${snapshot.name}'s profile` };
  }

  async remove(recruiterId: string, candidateId: string) {
    const { count } = await this.prisma.recruiterFavorite.deleteMany({
      where: { recruiterId, targetKey: candidateFavoriteKey(candidateId) },
    });
    if (count === 0) throw new NotFoundException('Saved candidate not found');

    return { saved: false, message: 'Removed from saved candidates' };
  }
}

function candidateIdOf(targetKey: string) {
  return targetKey.slice(CANDIDATE_KEY_PREFIX.length);
}

function snapshotOf(candidate: CandidateRow): Required<FavoriteSnapshot> {
  return {
    name: candidate.name?.trim() || candidate.username?.trim() || candidate.email.split('@')[0],
    title: candidate.seekerProfile?.headline?.trim() || DEFAULT_FAVORITE_TITLE,
    username: candidate.username,
    avatarUrl: candidate.avatarUrl,
  };
}

function parseSnapshot(snapshot: Prisma.JsonValue): FavoriteSnapshot {
  return typeof snapshot === 'object' && snapshot !== null && !Array.isArray(snapshot)
    ? (snapshot as FavoriteSnapshot)
    : {};
}
