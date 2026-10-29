import type { Availability, EmploymentType, LanguageProficiency, LinkPlatform, LinkRow, ProfileDraft, ProfileTab, ProfileUpdate, SalaryCurrency, SeekerProfile, SkillLevel, SocialLinks, WorkPreference } from '@/types/profile';

const PROFILE_TABS: ProfileTab[] = [
  'personal',
  'about',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
  'achievements',
  'languages',
  'links',
  'preferences',
  'resume',
];

export function toProfileTab(value: string | string[] | undefined): ProfileTab {
  return PROFILE_TABS.find((tab) => tab === value) ?? 'personal';
}

export const ABOUT_MIN_LENGTH = 40;
export const ABOUT_MAX_LENGTH = 4000;

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'available', label: 'Available now' },
  { value: 'open', label: 'Open to offers' },
  { value: 'not_looking', label: 'Not looking' },
];

export const SKILL_LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export const LANGUAGE_PROFICIENCY_OPTIONS: { value: LanguageProficiency; label: string }[] = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
];

export const WORK_PREFERENCE_OPTIONS: { value: WorkPreference; label: string }[] = [
  { value: 'any', label: 'Any (Remote / Hybrid / On-site)' },
  { value: 'remote', label: 'Remote only' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site only' },
];

export const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export const SALARY_CURRENCIES: SalaryCurrency[] = ['BDT', 'USD', 'INR', 'GBP', 'EUR', 'AED', 'SGD'];

export const LINK_PLATFORMS: { id: LinkPlatform; label: string; placeholder: string }[] = [
  { id: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourhandle' },
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/yourhandle' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourhandle' },
  { id: 'x', label: 'X', placeholder: 'https://x.com/yourhandle' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
];

const DEFAULT_LINK_PLATFORMS: LinkPlatform[] = ['website', 'facebook', 'github', 'linkedin'];

export const newId = () => crypto.randomUUID();

export function availabilityLabel(value: Availability) {
  return AVAILABILITY_OPTIONS.find((option) => option.value === value)?.label ?? 'Open to offers';
}

export function nextLinkPlatform(rows: LinkRow[]) {
  const used = new Set(rows.map(({ platform }) => platform));
  return LINK_PLATFORMS.find(({ id }) => !used.has(id))?.id ?? 'website';
}

export function toDraft(profile: SeekerProfile): ProfileDraft {
  const { fullName, headline, about, location, availability, jobPreferences, socialLinks } = profile;
  const { skills, experience, education, projects, certifications, achievements, languages } = profile;
  const platforms = [
    ...DEFAULT_LINK_PLATFORMS,
    ...LINK_PLATFORMS.map(({ id }) => id).filter((id) => !DEFAULT_LINK_PLATFORMS.includes(id) && socialLinks[id]),
  ];

  return {
    fullName,
    headline,
    about,
    location,
    availability,
    skills,
    experience,
    education,
    projects,
    certifications,
    achievements,
    languages,
    jobPreferences,
    links: platforms.map((platform) => ({ id: newId(), platform, url: socialLinks[platform] ?? '' })),
  };
}

const hasText = (value?: string) => Boolean(value?.trim());

function toSocialLinks(rows: LinkRow[]): SocialLinks {
  return Object.fromEntries(rows.filter(({ url }) => hasText(url)).map(({ platform, url }) => [platform, url.trim()]));
}

function toProfileUpdate({ links, ...draft }: ProfileDraft): ProfileUpdate {
  return {
    ...draft,
    skills: draft.skills.filter(({ name }) => hasText(name)),
    experience: draft.experience.filter(({ title, company }) => hasText(title) || hasText(company)),
    education: draft.education.filter(({ degree, school }) => hasText(degree) || hasText(school)),
    projects: draft.projects.filter(({ title }) => hasText(title)),
    certifications: draft.certifications.filter(({ name }) => hasText(name)),
    achievements: draft.achievements.filter(({ title }) => hasText(title)),
    languages: draft.languages.filter(({ name }) => hasText(name)),
    socialLinks: toSocialLinks(links),
  };
}

export function changedFields(draft: ProfileDraft, saved: ProfileDraft): ProfileUpdate {
  const next = toProfileUpdate(draft);
  const base = toProfileUpdate(saved);

  return Object.fromEntries(
    (Object.keys(next) as (keyof ProfileUpdate)[])
      .filter((key) => JSON.stringify(next[key]) !== JSON.stringify(base[key]))
      .map((key) => [key, next[key]]),
  );
}
