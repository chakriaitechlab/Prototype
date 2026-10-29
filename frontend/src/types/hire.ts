import type { InterviewReportStatus, InterviewStatus } from './interviews';
import type { ApplicationStatus, ApplyCvSource } from './jobs';

export type HireJobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface HireJob {
  id: string;
  title: string;
  employmentType: string | null;
  status: HireJobStatus;
  deadline: string | null;
  applicantCount: number;
  createdAt: string;
}

export interface HireJobsQuery {
  page?: number;
  limit?: number;
  status?: HireJobStatus;
  search?: string;
}

export interface HireJobsResponse {
  items: HireJob[];
  total: number;
  allTotal: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HireJobUpdate {
  id: string;
  status: HireJobStatus;
}

export type SalaryMode = 'range' | 'negotiable';
export type ApplyMethod = 'platform' | 'external' | 'email';
export type AutoPilotMode = 'threshold' | 'all' | 'off';

export interface HireJobCreate {
  title: string;
  jobRole: string;
  tags: string;
  description: string;
  jobType: string;
  salaryMode: SalaryMode;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryType: string;
  education: string;
  experience: string;
  jobLevel: string;
  vacancies: number;
  deadline: string;
  country: string;
  city: string;
  isRemote: boolean;
  benefits: string[];
  applyMethods: ApplyMethod[];
  interviewDifficulty: string;
  autoPilotMode: AutoPilotMode;
  interviewThreshold: number;
}

export interface HireJobDetail {
  id: string;
  title: string;
  category: string | null;
  skills: string[];
  description: string | null;
  employmentType: string | null;
  salaryMode: SalaryMode | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryType: string | null;
  education: string | null;
  experience: string | null;
  jobLevel: string | null;
  vacancies: number;
  deadline: string | null;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  benefits: string[];
  applyMethods: ApplyMethod[];
  interviewDifficulty: string;
  autoPilotMode: AutoPilotMode;
  interviewThreshold: number;
  status: HireJobStatus;
}

export interface HireJobCreated {
  id: string;
  title: string;
  status: HireJobStatus;
}

export type PostJobState = {
  error?: string;
  job?: HireJobCreated;
};

export type ApplicantFilter = 'review' | 'invited' | 'rejected';

export interface HireApplicant {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  applyMethod: ApplyCvSource;
  cvUrl: string | null;
  cvFileName: string | null;
  decidedAt: string | null;
  interview: {
    id: string;
    status: InterviewStatus;
    expiresAt: string;
    report: { status: InterviewReportStatus; overallScore: number | null } | null;
  } | null;
  seeker: {
    id: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
    headline: string | null;
  };
}

export interface HireApplicantsQuery {
  page?: number;
  limit?: number;
  status?: ApplicantFilter;
  q?: string;
}

export interface HireApplicantsResponse {
  job: {
    id: string;
    title: string;
    employmentType: string | null;
    location: string | null;
    status: HireJobStatus;
    deadline: string | null;
  };
  counts: Record<'all' | ApplicantFilter, number>;
  items: HireApplicant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ApplicantDecision = 'invite' | 'reject';

export interface ApplicantDecisionResult {
  id: string;
  status: ApplicationStatus;
  decidedAt: string;
}
