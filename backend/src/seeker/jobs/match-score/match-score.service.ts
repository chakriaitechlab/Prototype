import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { MatchScoreIdsDto } from './dto/match-score-ids.dto.js';

const NO_SKILLS_SCORE = 78;
const NO_SKILLS_MAX_SCORE = 95;
const MIN_SKILL_SCORE = 55;
const MAX_SKILL_SCORE = 99;
const SKILL_HIT_BONUS = 8;
const STRONG_SCORE = 70;
const MODERATE_SCORE = 40;
const LISTED_SKILLS = 5;

export type MatchExplanation = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skillsMatch: string;
  experienceMatch: string;
  educationMatch: string;
  recommendations: string[];
};

@Injectable()
export class MatchScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getScores(seekerId: string, dto: MatchScoreIdsDto) {
    const { ids } = dto;

    const [cached, cvUpdatedAt, opportunities] = await Promise.all([
      this.prisma.matchScoreCache.findMany({
        where: { seekerId, opportunityId: { in: ids } },
        select: { opportunityId: true, matchScore: true, status: true, updatedAt: true },
      }),
      this.cvUpdatedAt(seekerId),
      this.prisma.opportunity.findMany({ where: { id: { in: ids } }, select: { id: true, updatedAt: true } }),
    ]);

    const cachedById = new Map(cached.map((row) => [row.opportunityId, row]));
    const stale = new Set(
      opportunities
        .filter(({ id, updatedAt }) => {
          const row = cachedById.get(id);
          return !row || row.status === 'FAILED' || (row.status === 'COMPLETED' && isStale(row.updatedAt, [cvUpdatedAt, updatedAt]));
        })
        .map(({ id }) => id),
    );

    await this.markPending(seekerId, [...stale]);

    return opportunities.map(({ id }) => {
      const row = cachedById.get(id);

      if (!row || stale.has(id)) {
        return { opportunityId: id, status: 'PENDING' as const, score: 0 };
      }

      return { opportunityId: id, status: row.status, score: Math.round(row.matchScore) };
    });
  }

  async getExplanation(seekerId: string, opportunityId: string) {
    const [row, cvUpdatedAt, opportunity] = await Promise.all([
      this.prisma.matchScoreCache.findUnique({ where: { seekerId_opportunityId: { seekerId, opportunityId } } }),
      this.cvUpdatedAt(seekerId),
      this.prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { updatedAt: true } }),
    ]);

    if (!opportunity) {
      throw new NotFoundException('This job is no longer available');
    }

    if (!row || row.status === 'FAILED' || (row.status === 'COMPLETED' && isStale(row.updatedAt, [cvUpdatedAt, opportunity.updatedAt]))) {
      await this.markPending(seekerId, [opportunityId]);
      return { status: 'PENDING' as const, score: 0, explanation: null };
    }

    if (row.status === 'COMPLETED') {
      return { status: row.status, score: Math.round(row.matchScore), explanation: this.toExplanation(row.explanation) };
    }

    return { status: 'PENDING' as const, score: 0, explanation: null };
  }

  async currentScore(seekerId: string, opportunityId: string) {
    const [current] = await this.getScores(seekerId, { ids: [opportunityId] });

    if (current?.status === 'COMPLETED') return current.score;

    const { score } = await this.skillsFallback(seekerId, opportunityId);
    return score;
  }

  heuristic(skillSources: unknown[], jobSkills: string[], boost = 0): { score: number; explanation: MatchExplanation } {
    const seekerSkills = skillNames(skillSources.flatMap((source) => (Array.isArray(source) ? source : [])));
    const matched = jobSkills.filter((skill) => {
      const required = skill.trim().toLowerCase();
      return seekerSkills.some((own) => own.includes(required) || required.includes(own));
    });

    const score = jobSkills.length
      ? Math.min(
          MAX_SKILL_SCORE,
          Math.max(MIN_SKILL_SCORE, Math.round((matched.length / jobSkills.length) * 100) + boost + (matched.length ? SKILL_HIT_BONUS : 0)),
        )
      : Math.min(NO_SKILLS_MAX_SCORE, NO_SKILLS_SCORE + boost);
    const strength = score >= STRONG_SCORE ? 'Strong' : score >= MODERATE_SCORE ? 'Moderate' : 'Limited';
    const extra = matched.length - LISTED_SKILLS;

    return {
      score,
      explanation: {
        summary: `Skills-based match: ${score}%. AI analysis was unavailable.`,
        strengths: matched.length
          ? [`Matched ${matched.length} of ${jobSkills.length} required skills: ${matched.slice(0, LISTED_SKILLS).join(', ')}${extra > 0 ? ` and ${extra} more` : ''}`]
          : [],
        weaknesses: score < STRONG_SCORE ? ['Consider acquiring more skills relevant to this role'] : [],
        skillsMatch: `Skill overlap: ${strength}`,
        experienceMatch: 'Based on available profile data',
        educationMatch: '',
        recommendations:
          score < STRONG_SCORE
            ? ['Review the job requirements and consider updating your skills', 'Tailor your CV to highlight relevant experience']
            : ['Continue building on your strengths in this area'],
      },
    };
  }

  toExplanation(value: unknown): MatchExplanation {
    const data = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

    return {
      summary: text(data.summary),
      strengths: stringList(data.strengths),
      weaknesses: stringList(data.weaknesses),
      skillsMatch: text(data.skillsMatch),
      experienceMatch: text(data.experienceMatch),
      educationMatch: text(data.educationMatch),
      recommendations: stringList(data.recommendations),
    };
  }

  async resetSeeker(seekerId: string) {
    await this.prisma.matchScoreCache.deleteMany({ where: { seekerId } });
  }

  private async markPending(seekerId: string, opportunityIds: string[]) {
    if (!opportunityIds.length) return;

    await this.prisma.$transaction([
      this.prisma.matchScoreCache.createMany({
        data: opportunityIds.map((opportunityId) => ({ seekerId, opportunityId })),
        skipDuplicates: true,
      }),
      this.prisma.matchScoreCache.updateMany({
        where: { seekerId, opportunityId: { in: opportunityIds }, status: { not: 'PENDING' } },
        data: { status: 'PENDING', error: null },
      }),
    ]);
  }

  private async cvUpdatedAt(seekerId: string) {
    const cv = await this.prisma.cVProfile.findUnique({ where: { userId: seekerId }, select: { updatedAt: true } });

    return cv?.updatedAt;
  }

  private async skillsFallback(seekerId: string, opportunityId: string) {
    const [user, opportunity] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: seekerId },
        select: { seekerProfile: { select: { skills: true } }, cvProfile: { select: { parsedData: true } } },
      }),
      this.prisma.opportunity.findUnique({ where: { id: opportunityId }, select: { skills: true } }),
    ]);

    const cvData = (user?.cvProfile?.parsedData ?? {}) as Record<string, unknown>;
    return this.heuristic([user?.seekerProfile?.skills, cvData.skills], opportunity?.skills ?? []);
  }
}

function isStale(cachedAt: Date, sources: (Date | undefined)[]) {
  return sources.some((source) => source !== undefined && source > cachedAt);
}

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function skillNames(value: unknown[]) {
  return value
    .map((item: unknown) => (typeof item === 'string' ? item : text((item as { name?: unknown } | null)?.name)))
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}
