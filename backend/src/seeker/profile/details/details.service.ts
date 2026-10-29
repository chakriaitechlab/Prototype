import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import type { SeekerProfile } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';
import { StorageService } from '../../../infrastructure/storage/storage.service.js';
import type { UploadFile } from '../../../infrastructure/storage/storage.service.js';
import { MatchScoreService } from '../../jobs/match-score/match-score.service.js';
import { UpdateDetailsDto } from './dto/update-details.dto.js';

const ENTRY_FIELDS = {
  skills: ['id', 'name', 'level'],
  experience: ['id', 'title', 'company', 'location', 'start_date', 'end_date', 'current', 'description', 'highlights'],
  education: ['id', 'degree', 'school', 'field', 'start_date', 'end_date', 'current', 'grade', 'description'],
  projects: ['id', 'title', 'description', 'url', 'repo_url', 'image_url', 'tags', 'start_date', 'end_date'],
  certifications: ['id', 'name', 'issuer', 'issue_date', 'expiry_date', 'credential_url', 'credential_id'],
  achievements: ['id', 'title', 'description', 'date'],
  languages: ['id', 'name', 'proficiency'],
} as const;

const LINK_PLATFORMS = ['website', 'facebook', 'github', 'linkedin', 'x', 'instagram', 'youtube'] as const;

const JOB_PREFERENCE_FIELDS = [
  'preferred_roles',
  'expected_salary_min',
  'expected_salary_max',
  'expected_salary_currency',
  'employment_types',
  'work_preference',
] as const;

const MATCH_FIELDS = ['headline', 'about', 'location', 'availability', 'jobPreferences', ...(Object.keys(ENTRY_FIELDS) as (keyof typeof ENTRY_FIELDS)[])] as const;

type Section = keyof typeof ENTRY_FIELDS;

type JobPreferences = Partial<Record<(typeof JOB_PREFERENCE_FIELDS)[number], unknown>>;

@Injectable()
export class DetailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly matchScoreService: MatchScoreService,
  ) {}

  async getProfile(userId: string) {
    const { name, seekerProfile } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, seekerProfile: true },
    });

    return this.toProfile(name, seekerProfile);
  }

  async updateProfile(userId: string, dto: UpdateDetailsDto) {
    const { fullName, headline, about, location, availability, socialLinks, jobPreferences } = dto;

    const sections = Object.fromEntries(
      (Object.keys(ENTRY_FIELDS) as Section[])
        .filter((section) => dto[section] !== undefined)
        .map((section) => [section, instanceToPlain(dto[section])]),
    );

    const data = {
      headline,
      about,
      location,
      availability,
      ...sections,
      ...(socialLinks && { socialLinks: instanceToPlain(socialLinks), portfolioLinks: {} }),
      ...(jobPreferences && { jobPreferences: instanceToPlain(jobPreferences) }),
    };

    const previous = await this.prisma.seekerProfile.findUnique({ where: { userId } });

    await this.prisma.$transaction([
      ...(fullName === undefined ? [] : [this.prisma.user.update({ where: { id: userId }, data: { name: fullName } })]),
      this.prisma.seekerProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data }),
    ]);

    const updated: Record<string, unknown> = data;
    const matchChanged = MATCH_FIELDS.some(
      (field) => updated[field] !== undefined && JSON.stringify(updated[field]) !== JSON.stringify(previous?.[field]),
    );
    if (matchChanged) await this.matchScoreService.resetSeeker(userId);

    return this.getProfile(userId);
  }

  async uploadResume(userId: string, file: UploadFile) {
    const { email, seekerProfile } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { email: true, seekerProfile: { select: { cvUrl: true } } },
    });

    const cvUrl = await this.storageService.uploadCv(file, email);

    await this.prisma.seekerProfile.upsert({
      where: { userId },
      create: { userId, cvUrl },
      update: { cvUrl, cvSkipped: false },
    });

    const previousUrl = seekerProfile?.cvUrl;
    if (previousUrl && previousUrl.split('?')[0] !== cvUrl.split('?')[0]) {
      await this.storageService.deleteFile(previousUrl);
    }

    return { cvUrl };
  }

  async deleteResume(userId: string) {
    const profile = await this.prisma.seekerProfile.findUnique({ where: { userId }, select: { cvUrl: true } });

    if (profile?.cvUrl) {
      await this.prisma.seekerProfile.update({ where: { userId }, data: { cvUrl: null } });
      await this.storageService.deleteFile(profile.cvUrl);
    }

    return { cvUrl: null };
  }

  async uploadProjectPhoto(userId: string, file: UploadFile) {
    const { email } = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });

    return { url: await this.storageService.uploadProjectPhoto(file, email) };
  }

  toProfile(name: string | null, profile: SeekerProfile | null) {
    return {
      fullName: name ?? '',
      headline: profile?.headline ?? '',
      about: profile?.about ?? '',
      location: profile?.location ?? '',
      availability: profile?.availability ?? 'open',
      cvUrl: profile?.cvUrl ?? null,
      skills: toEntries(profile?.skills, 'skills'),
      experience: toEntries(profile?.experience, 'experience'),
      education: toEntries(profile?.education, 'education'),
      projects: toEntries(profile?.projects, 'projects'),
      certifications: toEntries(profile?.certifications, 'certifications'),
      achievements: toEntries(profile?.achievements, 'achievements'),
      languages: toEntries(profile?.languages, 'languages'),
      socialLinks: toLinks(profile?.portfolioLinks, profile?.socialLinks),
      jobPreferences: pick(asObject(profile?.jobPreferences), JOB_PREFERENCE_FIELDS) as JobPreferences,
    };
  }
}

function toEntries(value: unknown, section: Section) {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item: unknown) => {
    if (typeof item === 'string') {
      const name = item.trim();
      return name ? [{ id: randomUUID(), name }] : [];
    }
    if (!item || typeof item !== 'object') return [];
    return [{ id: randomUUID(), ...pick(item as Record<string, unknown>, ENTRY_FIELDS[section]) }];
  });
}

function toLinks(portfolioLinks: unknown, socialLinks: unknown) {
  const merged = { ...asObject(portfolioLinks), ...asObject(socialLinks) };
  const links: Partial<Record<(typeof LINK_PLATFORMS)[number], string>> = {};

  for (const platform of LINK_PLATFORMS) {
    const url = merged[platform] ?? (platform === 'x' ? merged.twitter : undefined);
    if (typeof url === 'string' && url.trim()) links[platform] = url.trim();
  }

  return links;
}

function pick(source: Record<string, unknown>, fields: readonly string[]) {
  return Object.fromEntries(fields.filter((field) => source[field] != null).map((field) => [field, source[field]]));
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
