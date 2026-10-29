import { Injectable } from '@nestjs/common';
import type { SeekerProfile } from '../../../../generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

const ABOUT_MIN_LENGTH = 40;
const SKILLS_MIN_COUNT = 3;

interface CompletionSection {
  label: string;
  weight: number;
  complete: boolean;
}

@Injectable()
export class CompletionService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompletion(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { emailVerified: true, phoneVerified: true, seekerProfile: true },
    });

    const sections = this.buildSections(user.seekerProfile);
    const percent = Math.min(
      100,
      sections.reduce((sum, section) => sum + (section.complete ? section.weight : 0), 0),
    );

    return {
      percent,
      profileCompleted: percent === 100,
      cvUploaded: Boolean(user.seekerProfile?.cvUrl),
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
    };
  }

  private buildSections(profile: SeekerProfile | null): CompletionSection[] {
    return [
      { label: 'Headline', weight: 12, complete: hasText(profile?.headline) },
      { label: 'About', weight: 16, complete: hasText(profile?.about, ABOUT_MIN_LENGTH) },
      { label: 'Location', weight: 8, complete: hasText(profile?.location) },
      { label: 'Skills', weight: 14, complete: countNamed(profile?.skills, 'name') >= SKILLS_MIN_COUNT },
      {
        label: 'Experience',
        weight: 18,
        complete: countNamed(profile?.experience, 'title') > 0 || countNamed(profile?.experience, 'company') > 0,
      },
      {
        label: 'Education',
        weight: 12,
        complete: countNamed(profile?.education, 'degree') > 0 || countNamed(profile?.education, 'school') > 0,
      },
      { label: 'Resume', weight: 12, complete: Boolean(profile?.cvUrl) },
      {
        label: 'Links',
        weight: 8,
        complete: hasAnyValue(profile?.portfolioLinks) || hasAnyValue(profile?.socialLinks),
      },
    ];
  }
}

function hasText(value: string | null | undefined, minLength = 1) {
  return (value?.trim().length ?? 0) >= minLength;
}

function countNamed(value: unknown, key: string) {
  if (!Array.isArray(value)) return 0;

  return value.filter((item: unknown) => {
    if (typeof item === 'string') return item.trim().length > 0;
    if (!item || typeof item !== 'object') return false;
    const field = (item as Record<string, unknown>)[key];
    return typeof field === 'string' && field.trim().length > 0;
  }).length;
}

function hasAnyValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).some(Boolean);
}
