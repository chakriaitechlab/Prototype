export interface CvExperienceEntry {
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  duration?: string;
  description?: string;
  highlights: string[];
}

export interface CvEducationEntry {
  degree: string;
  school: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  grade?: string;
  year?: string;
  description?: string;
}

export interface CvSkillEntry {
  name: string;
  level?: 'beginner' | 'intermediate' | 'expert';
}

export interface CvProjectEntry {
  title: string;
  description?: string;
  url?: string;
  repo_url?: string;
  start_date?: string;
  end_date?: string;
  technologies?: string[];
}

export interface CvCertificationEntry {
  name: string;
  issuer?: string;
  issue_date?: string;
  date?: string;
  expiry_date?: string;
  credential_url?: string;
  credential_id?: string;
}

export interface CvAchievementEntry {
  title: string;
  description?: string;
  date?: string;
}

export interface CvLanguageEntry {
  name: string;
  proficiency?: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface CvJobPreferences {
  preferred_roles?: string[];
  expected_salary_min?: number;
  expected_salary_max?: number;
  expected_salary_currency?: string;
  employment_types?: string[];
  work_preference?: 'remote' | 'onsite' | 'hybrid' | 'any';
}

export interface BuiltCvProfile {
  fullName: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  availability?: string;
  skills: string[];
  skill_entries?: CvSkillEntry[];
  experience: CvExperienceEntry[];
  education: CvEducationEntry[];
  projects?: CvProjectEntry[];
  certifications?: CvCertificationEntry[];
  achievements?: CvAchievementEntry[];
  languages?: CvLanguageEntry[];
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
  job_preferences?: CvJobPreferences;
  source?: string;
}

export interface CvApiResponse {
  file_path: string | null;
  parsed_data: Record<string, unknown>;
  uploaded_at: string;
}
