import type { GovtJobFilters, JobBadge, JobTab, PrivateJobItem } from '@/types/jobs';

export const POPULAR_SEARCHES = ['Front-end', 'Back-end', 'Development', 'PHP'] as const;

export const INDUSTRY_OPTIONS = [
  'Developments',
  'Business',
  'Finance & Accounting',
  'IT & Software',
  'Office Productivity',
  'Personal Development',
  'Design',
  'Marketing',
  'Photography & Video',
] as const;

export type Industry = (typeof INDUSTRY_OPTIONS)[number];

export const JOB_TYPE_OPTIONS: { label: string; value: JobBadge }[] = [
  { label: 'Full Time', value: 'FULL-TIME' },
  { label: 'Part-Time', value: 'PART-TIME' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Temporary', value: 'TEMPORARY' },
  { label: 'Contract Base', value: 'CONTRACT' },
];

export const SALARY_PRESETS = [
  { label: '৳10,000 – ৳30,000', min: 10_000, max: 30_000 },
  { label: '৳30,000 – ৳50,000', min: 30_000, max: 50_000 },
  { label: '৳50,000 – ৳80,000', min: 50_000, max: 80_000 },
  { label: '৳80,000 – ৳1,20,000', min: 80_000, max: 120_000 },
  { label: '৳1,20,000 – ৳5,00,000', min: 120_000, max: 500_000 },
  { label: 'Custom', min: null, max: null },
] as const;

export const SALARY_MIN = 10_000;
export const SALARY_MAX = 500_000;

export interface PrivateJobFilters {
  industries: Industry[];
  jobTypes: JobBadge[];
  salaryMin: number;
  salaryMax: number;
  salaryActive: boolean;
  remote: boolean;
}

export const DEFAULT_PRIVATE_FILTERS: PrivateJobFilters = {
  industries: [],
  jobTypes: [],
  salaryMin: SALARY_MIN,
  salaryMax: SALARY_MAX,
  salaryActive: false,
  remote: false,
};

export const DEFAULT_GOVT_FILTERS: GovtJobFilters = { organization: '', status: 'active', sortBy: 'latest' };

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString('en-IN')}`;
}

export function jobTypeLabel(type: JobBadge) {
  return JOB_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function hasPrivateFilters({ industries, jobTypes, salaryActive, remote }: PrivateJobFilters) {
  return industries.length > 0 || jobTypes.length > 0 || salaryActive || remote;
}

export function hasGovtFilters({ organization, status, sortBy }: GovtJobFilters) {
  return Boolean(organization) || status !== DEFAULT_GOVT_FILTERS.status || sortBy !== DEFAULT_GOVT_FILTERS.sortBy;
}

const INDUSTRY_KEYWORDS: Record<Industry, string[]> = {
  Developments: ['development', 'engineering', 'developer', 'engineer', 'software', 'frontend', 'backend', 'devops'],
  Business: ['business', 'operations', 'management', 'manager', 'strategy'],
  'Finance & Accounting': ['finance', 'accounting', 'account', 'audit', 'payroll'],
  'IT & Software': ['it ', 'software', 'technology', 'tech', 'system', 'data'],
  'Office Productivity': ['admin', 'office', 'assistant', 'coordinator'],
  'Personal Development': ['hr', 'human resources', 'training', 'coach', 'learning'],
  Design: ['design', 'ux', 'ui', 'creative', 'graphic'],
  Marketing: ['marketing', 'sales', 'growth', 'brand', 'content', 'seo'],
  'Photography & Video': ['photo', 'video', 'media', 'animation'],
};

function salaryRange(salary: string) {
  const amounts = [...salary.matchAll(/[\d,]+/g)].map(([n]) => Number(n.replace(/,/g, ''))).filter((n) => n > 0);
  if (amounts.length === 0) return null;
  return { min: Math.min(...amounts.slice(0, 2)), max: Math.max(...amounts.slice(0, 2)) };
}

/** Client-side match for the drawer's private-job filters. */
export function matchesPrivateFilters(job: PrivateJobItem, filters: PrivateJobFilters) {
  const { industries, jobTypes, salaryMin, salaryMax, salaryActive, remote } = filters;

  if (jobTypes.length > 0 && !jobTypes.includes(job.type)) return false;
  if (remote && !/\bremote\b|\bwfh\b|work[\s-]from[\s-]home/i.test(job.location)) return false;

  if (industries.length > 0) {
    const haystack = `${job.title} ${job.category ?? ''}`.toLowerCase();
    if (!industries.some((industry) => INDUSTRY_KEYWORDS[industry].some((keyword) => haystack.includes(keyword)))) {
      return false;
    }
  }

  if (salaryActive) {
    const range = salaryRange(job.salary);
    if (!range || range.min > salaryMax || range.max < salaryMin) return false;
  }

  return true;
}

export interface JobsUrlState extends GovtJobFilters {
  q: string;
  location: string;
  company: string;
  tab: JobTab;
  page: number;
  savedOnly: boolean;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

/** Reads jobs-page search params; unknown values fall back to the defaults. */
export function parseJobsSearchParams(params: SearchParams): JobsUrlState {
  const type = first(params.type);
  const status = first(params.status);
  const page = Number.parseInt(first(params.page), 10);

  return {
    q: first(params.q) || first(params.category),
    location: first(params.location),
    company: first(params.company),
    tab: type === 'govt' || type === 'private' ? type : 'all',
    page: Number.isInteger(page) && page > 1 ? page : 1,
    organization: first(params.org),
    status: status === 'all' || status === 'expired' ? status : DEFAULT_GOVT_FILTERS.status,
    sortBy: first(params.sort) === 'deadline' ? 'deadline' : DEFAULT_GOVT_FILTERS.sortBy,
    savedOnly: first(params.saved) === '1',
  };
}

/** Builds a jobs-page URL under `basePath`, leaving out values that equal the defaults. */
export function jobsUrl(
  { q, location, company, tab, page, organization, status, sortBy, savedOnly }: JobsUrlState,
  basePath = '/jobs',
) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (location.trim()) params.set('location', location.trim());
  if (company.trim()) params.set('company', company.trim());
  if (tab !== 'all') params.set('type', tab);
  if (page > 1) params.set('page', String(page));
  if (organization) params.set('org', organization);
  if (status !== DEFAULT_GOVT_FILTERS.status) params.set('status', status);
  if (sortBy !== DEFAULT_GOVT_FILTERS.sortBy) params.set('sort', sortBy);
  if (savedOnly) params.set('saved', '1');

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}
