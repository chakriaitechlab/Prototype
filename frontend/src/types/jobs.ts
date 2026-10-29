export type JobBadge = 'FULL-TIME' | 'PART-TIME' | 'INTERNSHIP' | 'CONTRACT' | 'TEMPORARY';

export type JobTab = 'all' | 'private' | 'govt';

export interface PrivateJobItem {
  id: string;
  kind: 'private';
  title: string;
  type: JobBadge;
  salary: string;
  company: string;
  location: string;
  category?: string;
  logoUrl?: string;
  featured?: boolean;
  postedAt?: string;
}

export interface GovtJobItem {
  id: string;
  kind: 'govt';
  title: string;
  titleBn: string;
  organizationName: string;
  organizationNameBn: string | null;
  organizationShortName: string;
  organizationLogo: string | null;
  vacancy: string;
  vacancyNotSpecific: boolean;
  viewCount: number;
  publishedDate: string;
  deadlineDate: string;
}

export interface GovtOrganization {
  name: string;
  nameBn: string | null;
  jobCount: number;
}

export type GovtJobStatus = 'all' | 'active' | 'expired';
export type GovtJobSort = 'latest' | 'deadline';

export interface GovtJobFilters {
  organization: string;
  status: GovtJobStatus;
  sortBy: GovtJobSort;
}

export interface GovtJobsQuery {
  search?: string;
  organization?: string;
  status?: GovtJobStatus;
  sortBy?: GovtJobSort;
  page?: number;
  limit?: number;
}

export interface GovtJobList {
  items: GovtJobItem[];
  total: number;
  totalPages: number;
}

/** `GET /api/govt-jobs/v1` response from backend-new. */
export interface GovtJobsResponse {
  data: {
    id: number;
    job_title: string;
    job_title_bn: string;
    vacancy: string;
    vacancy_not_specific: boolean;
    published_date: string;
    deadline_date: string;
    view_count: number;
    job_utilities_govtorganization: {
      name: string;
      name_bn: string | null;
      short_name: string;
      logo: string;
    } | null;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Structured circular data an admin attaches to a govt job. */
export interface GovtJobCircular {
  key_stats?: {
    grade?: string;
    salary_scale?: string;
    vacancy?: string;
    deadline?: string;
    workplace?: string;
  };
  job_description?: string[];
  qualifications?: string[];
  conditions?: string[];
  application_process?: {
    portal_url?: string;
    start_date?: string;
    end_date?: string;
    teletalk_prefix?: string;
    fee_amount?: string;
    sms_instructions?: string[];
  };
  required_documents?: string[];
}

/** `GET /api/govt-jobs/v1/:id` response from backend-new (empty when the job does not exist). */
export interface GovtJobDetailResponse {
  details?: {
    id: number;
    job_title: string;
    job_title_bn: string | null;
    vacancy: string | null;
    min_age: number | null;
    max_age: number | null;
    application_site: string | null;
    advertisement_file: string | null;
    advertisement_no: string | null;
    advertisement_published_date: string | null;
    published_date: string | null;
    deadline_date: string | null;
    admit_card: boolean | null;
    is_result: boolean | null;
    admit_card_upload: string | null;
    download_url: string | null;
    result_upload: string | null;
    circular_details: GovtJobCircular | null;
    job_utilities_govtorganization: {
      name: string;
      name_bn: string | null;
      logo: string | null;
    } | null;
  };
}

export interface GovtJobDetail {
  id: string;
  title: string;
  organizationName: string;
  organizationLogo: string | null;
  advertisementNo: string | null;
  advertisementFile: string | null;
  applicationSite: string | null;
  vacancy: string | null;
  minAge: number | null;
  maxAge: number | null;
  publishedDate: string | null;
  deadlineDate: string | null;
  isExpired: boolean;
  admitCard: { url: string | null } | null;
  result: { url: string | null } | null;
  circular: GovtJobCircular | null;
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'CV_SCREENING'
  | 'VOICE_INTERVIEW'
  | 'INTERVIEW_SUBMITTED'
  | 'RECRUITER_REVIEW'
  | 'ASSIGNED'
  | 'REJECTED';

export interface SeekerApplication {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    employmentType: string | null;
    location: string | null;
    company: { name: string; logoUrl: string | null } | null;
  };
}

export type ApplyCvSource = 'profile' | 'upload';

export interface SubmittedApplication {
  id: string;
  refNo: string;
  status: ApplicationStatus;
  matchScore: number;
  applyMethod: ApplyCvSource;
  cvFileName: string | null;
  appliedAt: string;
}

export interface JobApplicationInfo {
  application: SubmittedApplication | null;
  hasProfileCv: boolean;
}

export type ApplyJobState = { data?: SubmittedApplication; error?: string };

export interface MatchExplanation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skillsMatch: string;
  experienceMatch: string;
  educationMatch: string;
  recommendations: string[];
}

export interface MatchExplanationResult {
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  score: number;
  explanation: MatchExplanation | null;
}

export type MatchExplanationState = { data: MatchExplanationResult } | { error: string };

export interface JobListQuery {
  q?: string;
  location?: string;
  company?: string;
  page?: number;
  limit?: number;
}

export interface JobListResponse {
  items: {
    id: string;
    title: string;
    category: string | null;
    location: string | null;
    employmentType: string | null;
    salary: string | null;
    featured: boolean;
    createdAt: string;
    company: { name: string; logoUrl: string | null } | null;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PrivateJobList {
  items: PrivateJobItem[];
  total: number;
  totalPages: number;
}

export interface HiringCompany {
  name: string;
  location: string;
  positions: number;
  featured: boolean;
  logoUrl?: string;
}

export type HomepageStatIcon = 'briefcase' | 'buildings' | 'users' | 'briefcase-new';

export interface HomepageStat {
  value: string;
  label: string;
  icon: HomepageStatIcon;
  highlight?: boolean;
}

export interface MatchScore {
  opportunityId: string;
  status: MatchExplanationResult['status'];
  score: number;
}

export type MatchScoresState = { data: MatchScore[] } | { error: string };

export interface SavedJobsResponse {
  ids: string[];
  privateJobs: {
    id: string;
    title: string;
    category: string | null;
    location: string | null;
    employmentType: string | null;
    salary: string | null;
    featured: boolean;
    company: { name: string; logoUrl: string | null } | null;
    createdAt: string;
  }[];
  govtJobs: {
    id: number;
    job_title: string;
    job_title_bn: string;
    job_id: string;
    job_type: string;
    vacancy: string;
    gender: string | null;
    min_age: number | null;
    max_age: number | null;
    application_site: string | null;
    advertisement_file: string | null;
    published_date: string | null;
    deadline_date: string | null;
    advertisement_no: string | null;
    status: string;
    view_count: number;
    vacancy_not_specific: boolean;
    job_utilities_govtorganization: {
      id: number;
      name: string;
      name_bn: string | null;
      short_name: string;
      logo: string;
      website: string | null;
    } | null;
  }[];
  total: number;
}

export interface SavedJobsData {
  ids: string[];
  privateJobs: PrivateJobItem[];
  govtJobs: GovtJobItem[];
  total: number;
}

export interface JobDetailCompany {
  name: string;
  username: string | null;
  logoUrl: string | null;
  isVerified: boolean;
}

export interface JobDetail {
  id: string;
  title: string;
  category: string | null;
  location: string | null;
  description: string | null;
  skills: string[];
  employmentType: string | null;
  salary: string | null;
  salaryMode: 'range' | 'negotiable' | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryType: string | null;
  experience: string | null;
  education: string | null;
  jobLevel: string | null;
  vacancies: number;
  deadline: string | null;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  benefits: string[];
  applyMethods: string[];
  featured: boolean;
  createdAt: string;
  company: JobDetailCompany | null;
}
