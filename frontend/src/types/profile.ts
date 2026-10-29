import type { ActionState } from './auth';

export interface ProfileCompletion {
  percent: number;
  profileCompleted: boolean;
  cvUploaded: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export type Availability = 'available' | 'open' | 'not_looking';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LanguageProficiency = 'basic' | 'conversational' | 'fluent' | 'native';
export type WorkPreference = 'any' | 'remote' | 'hybrid' | 'onsite';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type SalaryCurrency = 'BDT' | 'USD' | 'INR' | 'GBP' | 'EUR' | 'AED' | 'SGD';
export type LinkPlatform = 'website' | 'facebook' | 'github' | 'linkedin' | 'x' | 'instagram' | 'youtube';

export interface SkillEntry {
  id: string;
  name: string;
  level?: SkillLevel;
}

export interface ExperienceEntry {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export interface EducationEntry {
  id: string;
  degree?: string;
  school?: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  grade?: string;
  description?: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description?: string;
  url?: string;
  repo_url?: string;
  image_url?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
  credential_id?: string;
}

export interface AchievementEntry {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency?: LanguageProficiency;
}

export type SocialLinks = Partial<Record<LinkPlatform, string>>;

export interface JobPreferences {
  preferred_roles?: string[];
  expected_salary_min?: number;
  expected_salary_max?: number;
  expected_salary_currency?: SalaryCurrency;
  employment_types?: EmploymentType[];
  work_preference?: WorkPreference;
}

export interface SeekerProfile {
  fullName: string;
  headline: string;
  about: string;
  location: string;
  availability: Availability;
  cvUrl: string | null;
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  languages: LanguageEntry[];
  socialLinks: SocialLinks;
  jobPreferences: JobPreferences;
}

export type ProfileUpdate = Partial<Omit<SeekerProfile, 'cvUrl'>>;

export interface LinkRow {
  id: string;
  platform: LinkPlatform;
  url: string;
}

export type ProfileDraft = Omit<SeekerProfile, 'cvUrl' | 'socialLinks'> & { links: LinkRow[] };

export type ProfileTab =
  | 'personal'
  | 'about'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'links'
  | 'preferences'
  | 'resume';

export type SaveProfileState = ActionState & { profile?: SeekerProfile };
export type ResumeState = ActionState & { cvUrl?: string | null };
export type ProjectPhotoState = ActionState & { url?: string };

export type PublicProfile = Omit<SeekerProfile, 'fullName' | 'cvUrl' | 'jobPreferences'> & {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  phoneVerified: boolean;
  memberSince: string;
  jobPreferences: Pick<JobPreferences, 'preferred_roles' | 'work_preference' | 'employment_types'>;
};
