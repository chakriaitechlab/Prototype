import { cacheLife } from 'next/cache';
import type { JobBadge, JobDetail } from '@/types/jobs';
import { formatDate } from '@/utils/format';

export const jobDetailTag = (jobId: string) => `job:${jobId}`;

const SECTION_HEADERS = [
  'About the Role',
  'About the Job',
  'About this Role',
  'About Us',
  'About the Company',
  'What You Will Do',
  "What You'll Do",
  'What You Will Need',
  'Key Responsibilities',
  'Responsibilities',
  'Requirements',
  'Job Requirements',
  'Qualifications',
  'Nice to Have',
  'Preferred Qualifications',
  'Benefits',
  'Perks & Benefits',
  'What We Offer',
  'How to Apply',
];

export function jobBadge(employmentType: string | null): JobBadge {
  const value = (employmentType ?? '').toLowerCase();
  if (value.includes('part')) return 'PART-TIME';
  if (value.includes('intern')) return 'INTERNSHIP';
  if (value.includes('contract')) return 'CONTRACT';
  if (value.includes('temp')) return 'TEMPORARY';
  return 'FULL-TIME';
}

export function companyName(job: JobDetail) {
  return job.company?.name ?? 'Chakri.ai employer';
}

export function jobLocation(job: JobDetail) {
  if (job.isRemote) return 'Remote';
  return job.location ?? ([job.city, job.country].filter(Boolean).join(', ') || 'Bangladesh');
}

export function salaryPeriod(job: JobDetail) {
  if (job.salaryMode === 'negotiable') return 'Negotiable';
  return `${job.salaryType ?? 'Monthly'} salary`;
}

export function expiryLabel(deadline: string | null) {
  return deadline ? formatDate(deadline) : '—';
}

const DAY_MS = 24 * 60 * 60 * 1000;

function postedAgo(createdAt: string) {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / DAY_MS);
  if (Number.isNaN(days)) return formatDate(createdAt);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${formatDate(createdAt)}`;
}

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / DAY_MS);
  if (Number.isNaN(days)) return null;
  if (days < 0) return 'Deadline passed';
  if (days === 0) return 'Last day to apply';
  return `${days} ${days === 1 ? 'day' : 'days'} left`;
}

export async function jobTimeline(createdAt: string, deadline: string | null) {
  'use cache';
  cacheLife('hours');
  return { posted: postedAgo(createdAt), remaining: daysLeft(deadline) };
}

export type JobTimeline = Awaited<ReturnType<typeof jobTimeline>>;

function prepareDescription(raw: string) {
  let text = raw.replace(/\r\n/g, '\n').replace(/<\/?u>/g, '');

  for (const header of SECTION_HEADERS) {
    const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^(?:#{1,6}\\s*|\\*{1,3}\\s*)?(${escaped})(?:\\*{1,3}|:)?\\s*$`, 'gim');
    text = text.replace(pattern, '\n### $1\n');
  }

  return text;
}

const SECTION_HEADING = /^#{1,3}\s+(.+?)\s*#*\s*$/;

export function descriptionSections(raw: string) {
  const sections: { title: string; body: string }[] = [];
  let current = { title: 'Job description', lines: [] as string[] };

  const flush = () => {
    const body = current.lines.join('\n').trim();
    if (body) sections.push({ title: current.title, body });
  };

  for (const line of prepareDescription(raw).split('\n')) {
    const heading = SECTION_HEADING.exec(line);
    if (heading) {
      flush();
      current = { title: heading[1].replace(/[*_:]/g, '').trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  flush();

  return sections;
}

export function jobsSearchPath(query: string) {
  return `/jobs?q=${encodeURIComponent(query)}`;
}

const SCHEMA_EMPLOYMENT_TYPES: Record<JobBadge, string> = {
  'FULL-TIME': 'FULL_TIME',
  'PART-TIME': 'PART_TIME',
  INTERNSHIP: 'INTERN',
  CONTRACT: 'CONTRACTOR',
  TEMPORARY: 'TEMPORARY',
};

const SCHEMA_SALARY_UNITS: Record<string, string> = { Hourly: 'HOUR', Monthly: 'MONTH', Yearly: 'YEAR' };

export function jobPostingJsonLd(job: JobDetail, url: string) {
  const hasSalary = job.salaryMode === 'range' && (job.salaryMin !== null || job.salaryMax !== null);

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description?.trim() || job.title,
    url,
    identifier: { '@type': 'PropertyValue', name: companyName(job), value: job.id },
    datePosted: job.createdAt,
    validThrough: job.deadline ?? undefined,
    employmentType: SCHEMA_EMPLOYMENT_TYPES[jobBadge(job.employmentType)],
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName(job),
      logo: job.company?.logoUrl ?? undefined,
    },
    jobLocationType: job.isRemote ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements: job.isRemote
      ? { '@type': 'Country', name: job.country ?? 'Bangladesh' }
      : undefined,
    jobLocation: job.isRemote
      ? undefined
      : {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.city ?? undefined,
            addressCountry: job.country ?? 'Bangladesh',
          },
        },
    baseSalary: hasSalary
      ? {
          '@type': 'MonetaryAmount',
          currency: job.salaryCurrency ?? 'BDT',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salaryMin ?? undefined,
            maxValue: job.salaryMax ?? undefined,
            unitText: SCHEMA_SALARY_UNITS[job.salaryType ?? 'Monthly'] ?? 'MONTH',
          },
        }
      : undefined,
    skills: job.skills.length > 0 ? job.skills.join(', ') : undefined,
    educationRequirements: job.education ?? undefined,
    experienceRequirements: job.experience ?? undefined,
    totalJobOpenings: job.vacancies,
  };
}
