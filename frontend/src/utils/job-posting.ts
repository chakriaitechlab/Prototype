import type { ApplyMethod, AutoPilotMode, HireJobCreate, HireJobDetail, HireJobStatus, SalaryMode } from '@/types/hire';

export const JOB_TYPES = ['Full Time', 'Part Time', 'Internship', 'Contract'];

export const SALARY_TYPES = ['Hourly', 'Monthly', 'Yearly'];

export const SALARY_CURRENCIES = ['BDT', 'USD'];

export const EDUCATION_LEVELS = ['High School', 'Diploma', 'Graduation', 'Masters', 'PhD', 'Any'];

export const EXPERIENCE_LEVELS = ['Fresh', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'];

export const JOB_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'];

export const INTERVIEW_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const COUNTRIES = ['Bangladesh'];

export const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

export const JOB_BENEFITS = [
  'Distributed Team',
  'Medical Insurance',
  '401k matching',
  'Company retreats',
  'We hire old (and young)',
  '401k Salary',
  'Async',
  'Vision Insurance',
  'Dental Insurance',
  'Unlimited vacation',
  '4 day workweek',
  'Learning budget',
  'Free gym membership',
  'Pay in crypto',
  'Profit Sharing',
  'Equity Compensation',
  'No whiteboard interview',
  'No politics at work',
];

export const SALARY_MODES: { id: SalaryMode; name: string; desc: string }[] = [
  { id: 'range', name: 'Salary range', desc: 'Specify min and max' },
  { id: 'negotiable', name: 'Negotiable', desc: 'Discuss with candidate' },
];

export const APPLY_METHODS: { id: ApplyMethod; name: string; desc: string }[] = [
  {
    id: 'platform',
    name: 'On Chakri.ai',
    desc: 'Candidate will apply job using Chakri.ai & all applications will show on your dashboard.',
  },
  { id: 'external', name: 'External Platform', desc: 'Candidates apply on your own careers page / external portal.' },
  {
    id: 'email',
    name: 'On Your Email',
    desc: 'Applications will be sent directly to your registered company email address.',
  },
];

export const AUTO_PILOT_MODES: { id: AutoPilotMode; label: string; tag: string; description: string }[] = [
  {
    id: 'threshold',
    label: 'Match Score Bar',
    tag: 'Recommended',
    description: 'Auto-invite candidates scoring at or above your cutoff match %. Others route to Talent Pool.',
  },
  {
    id: 'all',
    label: 'All Applicants',
    tag: 'Auto-Invite All',
    description: 'Every applicant receives an instant AI Interview invitation immediately upon applying.',
  },
  {
    id: 'off',
    label: 'Manual Review',
    tag: 'AI Off',
    description: 'Auto-Pilot disabled. You manually review applications and trigger interviews.',
  },
];

export const THRESHOLD_SLIDER = { min: 30, max: 95, step: 5 };

const DEFAULT_EXPIRATION_DAYS = 30;

export function defaultExpirationDate(days = DEFAULT_EXPIRATION_DAYS) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function thresholdLabel(threshold: number) {
  if (threshold >= 80) return '🎯 Strict Filtering (Top 10-15%)';
  if (threshold >= 60) return '⚡ Balanced (Recommended for most roles)';
  return '🌐 Lenient / High Volume';
}

export function initialJobDraft(): HireJobCreate {
  return {
    title: '',
    jobRole: '',
    tags: '',
    description: '',
    jobType: 'Full Time',
    salaryMode: 'range',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'BDT',
    salaryType: 'Monthly',
    education: '',
    experience: '',
    jobLevel: '',
    vacancies: 1,
    deadline: defaultExpirationDate(),
    country: 'Bangladesh',
    city: 'Dhaka',
    isRemote: false,
    benefits: ['Distributed Team', 'Medical Insurance'],
    applyMethods: ['platform'],
    interviewDifficulty: 'Medium',
    autoPilotMode: 'threshold',
    interviewThreshold: 65,
  };
}

export function jobToDraft(job: HireJobDetail): HireJobCreate {
  const initial = initialJobDraft();
  return {
    title: job.title,
    jobRole: job.category ?? '',
    tags: job.skills.join(', '),
    description: job.description ?? '',
    jobType: job.employmentType ?? initial.jobType,
    salaryMode: job.salaryMode ?? initial.salaryMode,
    salaryMin: job.salaryMin?.toString() ?? '',
    salaryMax: job.salaryMax?.toString() ?? '',
    salaryCurrency: job.salaryCurrency ?? initial.salaryCurrency,
    salaryType: job.salaryType ?? initial.salaryType,
    education: job.education ?? '',
    experience: job.experience ?? '',
    jobLevel: job.jobLevel ?? '',
    vacancies: job.vacancies,
    deadline: job.deadline?.slice(0, 10) ?? '',
    country: job.country ?? initial.country,
    city: job.city ?? initial.city,
    isRemote: job.isRemote,
    benefits: job.benefits,
    applyMethods: job.applyMethods.length > 0 ? job.applyMethods : initial.applyMethods,
    interviewDifficulty: job.interviewDifficulty,
    autoPilotMode: job.autoPilotMode,
    interviewThreshold: job.interviewThreshold,
  };
}

export const JOB_STATUS_FILTERS: { id: HireJobStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Jobs' },
  { id: 'ACTIVE', label: 'Active Jobs' },
  { id: 'PAUSED', label: 'Paused Jobs' },
  { id: 'CLOSED', label: 'Expired Jobs' },
  { id: 'DRAFT', label: 'Draft Jobs' },
];

const JOB_STATUSES: HireJobStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'];

export function parseStatusFilter(raw?: string) {
  const value = raw?.toUpperCase();
  return JOB_STATUSES.find((status) => status === value);
}
