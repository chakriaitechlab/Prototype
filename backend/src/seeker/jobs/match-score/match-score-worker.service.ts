import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import type { Prisma } from '../../../../generated/prisma/client.js';
import { AiService } from '../../../infrastructure/ai/ai.service.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { MatchScoreService } from './match-score.service.js';
import type { MatchExplanation } from './match-score.service.js';

const POLL_INTERVAL_MS = 3000;
const MAX_CONCURRENT = 3;
const MATCH_TEMPERATURE = 0.2;
const MAX_SCORE = 100;
const SINGLE_ASSIGNED_BOOST = 2;
const REPEAT_ASSIGNED_BOOST = 5;

const OPPORTUNITY_INCLUDE = {
  company: { select: { name: true } },
} as const satisfies Prisma.OpportunityInclude;

type OpportunityRecord = Prisma.OpportunityGetPayload<{ include: typeof OPPORTUNITY_INCLUDE }>;

interface PendingRow {
  id: string;
  seekerId: string;
  opportunityId: string;
}

const SYSTEM_PROMPT = `You are an expert job matching AI. Evaluate how well a candidate matches this job listing.

Consider ALL profile information holistically: skills, work experience, education, certifications, languages, projects, portfolio, location, availability, career preferences, and any CV/resume data.

Return JSON with:
- "match_score": 0-100
- "explanation": { "summary": string, "strengths": string[], "weaknesses": string[], "skillsMatch": string, "experienceMatch": string, "educationMatch": string, "recommendations": string[] }

Be objective and critical. Score 100 is extremely rare. Base the score on ALL available information.`;

@Injectable()
export class MatchScoreWorkerService {
  private readonly logger = new Logger(MatchScoreWorkerService.name);
  private readonly inFlight = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly matchScoreService: MatchScoreService,
  ) {}

  @Interval(POLL_INTERVAL_MS)
  async poll(): Promise<void> {
    const free = MAX_CONCURRENT - this.inFlight.size;
    if (free <= 0) return;

    let rows: PendingRow[];
    try {
      rows = await this.prisma.matchScoreCache.findMany({
        where: { status: 'PENDING', id: { notIn: [...this.inFlight] } },
        orderBy: { updatedAt: 'asc' },
        take: free,
        select: { id: true, seekerId: true, opportunityId: true },
      });
    } catch (error) {
      this.logger.error(`Match score poll failed: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    for (const row of rows) {
      this.inFlight.add(row.id);
      void this.process(row).finally(() => this.inFlight.delete(row.id));
    }
  }

  private async process({ id, seekerId, opportunityId }: PendingRow) {
    try {
      const [candidate, opportunity, assigned] = await Promise.all([
        this.candidate(seekerId),
        this.prisma.opportunity.findUniqueOrThrow({ where: { id: opportunityId }, include: OPPORTUNITY_INCLUDE }),
        this.prisma.opportunityApplication.count({ where: { seekerId, status: 'ASSIGNED' } }),
      ]);
      const boost = assigned >= 2 ? REPEAT_ASSIGNED_BOOST : assigned >= 1 ? SINGLE_ASSIGNED_BOOST : 0;
      const { score, explanation } = await this.score(candidate, opportunity, boost);

      await this.prisma.$transaction([
        this.prisma.matchScoreCache.update({
          where: { id },
          data: { matchScore: score, explanation, status: 'COMPLETED', error: null },
        }),
        this.prisma.opportunityApplication.updateMany({
          where: { seekerId, opportunityId },
          data: { matchScore: score },
        }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Match score ${seekerId}/${opportunityId} failed: ${message}`);
      await this.prisma.matchScoreCache
        .updateMany({ where: { id }, data: { status: 'FAILED', error: message } })
        .catch(() => undefined);
    }
  }

  private async score(
    candidate: Record<string, unknown>,
    opportunity: OpportunityRecord,
    boost: number,
  ): Promise<{ score: number; explanation: MatchExplanation }> {
    try {
      const parsed = await this.ai.chatJson(
        [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `CANDIDATE PROFILE:\n${JSON.stringify(candidate, null, 2)}\n\nJOB:\n${JSON.stringify(this.jobSummary(opportunity), null, 2)}\n\nPerformance boost: +${boost}`,
          },
        ],
        'json',
        MATCH_TEMPERATURE,
      );
      const score = Number(parsed.match_score);

      return {
        score: Math.min(MAX_SCORE, Math.max(0, Math.round(Number.isNaN(score) ? 0 : score))),
        explanation: this.matchScoreService.toExplanation(parsed.explanation),
      };
    } catch (error) {
      this.logger.warn(`AI match score unavailable, using skills fallback: ${error instanceof Error ? error.message : String(error)}`);
      const cvData = candidate.cvData as Record<string, unknown>;
      return this.matchScoreService.heuristic([candidate.skills, cvData.skills], opportunity.skills, boost);
    }
  }

  private async candidate(seekerId: string): Promise<Record<string, unknown>> {
    const { name, seekerProfile: profile, cvProfile } = await this.prisma.user.findUniqueOrThrow({
      where: { id: seekerId },
      select: { name: true, seekerProfile: true, cvProfile: { select: { parsedData: true } } },
    });

    return {
      name: name ?? '',
      headline: profile?.headline ?? '',
      about: profile?.about ?? '',
      location: profile?.location ?? '',
      availability: profile?.availability ?? '',
      skills: profile?.skills ?? [],
      experience: profile?.experience ?? [],
      education: profile?.education ?? [],
      projects: profile?.projects ?? [],
      certifications: profile?.certifications ?? [],
      achievements: profile?.achievements ?? [],
      languages: profile?.languages ?? [],
      portfolioLinks: profile?.portfolioLinks ?? {},
      jobPreferences: profile?.jobPreferences ?? {},
      cvData: cvProfile?.parsedData ?? {},
    };
  }

  private jobSummary(opportunity: OpportunityRecord) {
    const { title, company, category, location, city, country, isRemote, employmentType, jobLevel, skills, description, experience, education, salary, benefits } = opportunity;

    return {
      title,
      companyName: company?.name ?? null,
      category,
      location,
      city,
      country,
      isRemote,
      employmentType,
      jobLevel,
      skills,
      description: description ?? '',
      experience,
      education,
      salary,
      benefits,
    };
  }
}
