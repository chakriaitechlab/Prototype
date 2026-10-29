import { Injectable } from '@nestjs/common';
import type { Company } from '../../../../generated/prisma/client.js';

interface CompletionCheck {
  label: string;
  weight: number;
  complete: boolean;
}

@Injectable()
export class CompletionService {
  compute(company: Company) {
    if (company.isVerified) {
      return { percent: 100, profileCompleted: true, missing: [] as string[] };
    }

    const checks = this.buildChecks(company);
    const percent = Math.min(
      100,
      checks.reduce((sum, check) => sum + (check.complete ? check.weight : 0), 0),
    );

    return {
      percent,
      profileCompleted: percent === 100,
      missing: checks.filter((check) => !check.complete).map((check) => check.label),
    };
  }

  private buildChecks(company: Company): CompletionCheck[] {
    return [
      { label: 'Company name', weight: 8, complete: hasText(company.name) },
      { label: 'Company logo', weight: 8, complete: Boolean(company.logoUrl) },
      { label: 'About', weight: 12, complete: hasText(company.about) },
      { label: 'Organization type', weight: 8, complete: hasText(company.organizationType) },
      { label: 'Industry', weight: 8, complete: hasText(company.industry) },
      { label: 'Team size', weight: 6, complete: hasText(company.teamSize) },
      { label: 'Year of establishment', weight: 6, complete: Boolean(company.foundedOn) },
      { label: 'Website', weight: 8, complete: hasText(company.website) },
      { label: 'Company vision', weight: 10, complete: hasText(company.vision) },
      { label: 'Links', weight: 8, complete: Array.isArray(company.socialLinks) && company.socialLinks.length > 0 },
      {
        label: 'Office location',
        weight: 10,
        complete: hasText(company.address) || (company.lat !== null && company.lng !== null),
      },
      { label: 'Trade license number', weight: 8, complete: hasText(company.tradeLicense) },
    ];
  }
}

function hasText(value: string | null | undefined) {
  return (value?.trim().length ?? 0) > 0;
}
