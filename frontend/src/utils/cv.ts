import type { BuiltCvProfile, CvAchievementEntry, CvCertificationEntry, CvEducationEntry, CvExperienceEntry, CvLanguageEntry, CvProjectEntry, CvSkillEntry } from '@/types/cv';

export function formatCvDuration(start?: string, end?: string, current?: boolean): string {
  const startDate = start?.trim() || '';
  const endDate = current ? 'Present' : end?.trim() || '';
  if (startDate && endDate) return `${startDate} – ${endDate}`;
  return startDate || endDate || '';
}

export function formatEducationYear(endDate?: string, startDate?: string): string {
  const year = (endDate || startDate || '').trim();
  if (!year) return '';
  const match = year.match(/\d{4}/);
  return match?.[0] ?? year;
}

export function syncExperienceEntry(exp: CvExperienceEntry): CvExperienceEntry {
  return {
    ...exp,
    duration: formatCvDuration(exp.start_date, exp.end_date, exp.current),
  };
}

export function syncEducationEntry(edu: CvEducationEntry): CvEducationEntry {
  return {
    ...edu,
    year: edu.year?.trim() || formatEducationYear(edu.end_date, edu.start_date),
  };
}

export function emptyExperience(): CvExperienceEntry {
  return {
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    current: false,
    duration: '',
    description: '',
    highlights: [],
  };
}

export function emptyEducation(): CvEducationEntry {
  return {
    degree: '',
    school: '',
    field: '',
    start_date: '',
    end_date: '',
    current: false,
    grade: '',
    year: '',
    description: '',
  };
}

export function emptyProject(): CvProjectEntry {
  return {
    title: '',
    description: '',
    url: '',
    repo_url: '',
    start_date: '',
    end_date: '',
    technologies: [],
  };
}

export function emptySkill(): CvSkillEntry {
  return { name: '', level: 'intermediate' };
}

export function emptyCertification(): CvCertificationEntry {
  return {
    name: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_url: '',
    credential_id: '',
  };
}

export function emptyAchievement(): CvAchievementEntry {
  return { title: '', description: '', date: '' };
}

export function emptyLanguage(): CvLanguageEntry {
  return { name: '', proficiency: 'conversational' };
}

export function skillEntriesFromDraft(draft: Pick<BuiltCvProfile, 'skills' | 'skill_entries'>): CvSkillEntry[] {
  if (draft.skill_entries?.length) {
    return draft.skill_entries;
  }
  return (draft.skills ?? []).map((name) => ({ name, level: 'intermediate' as const }));
}

export function syncSkillEntries(entries: CvSkillEntry[]): Pick<BuiltCvProfile, 'skill_entries' | 'skills'> {
  const skill_entries = entries;
  const skills = entries.map((entry) => entry.name.trim()).filter(Boolean);
  return { skill_entries, skills };
}

export function emptyCvDraft(partial?: Partial<BuiltCvProfile>): BuiltCvProfile {
  const skillEntries = partial?.skill_entries?.length
    ? partial.skill_entries
    : (partial?.skills ?? []).map((name) =>
        typeof name === 'string'
          ? { name, level: 'intermediate' as const }
          : { name: (name as CvSkillEntry).name || '', level: (name as CvSkillEntry).level || 'intermediate' },
      );
  const skills = skillEntries.map((entry) => entry.name.trim()).filter(Boolean);

  const fullName = partial?.fullName || partial?.name || '';
  return {
    fullName,
    name: partial?.name || fullName,
    email: partial?.email || '',
    phone: partial?.phone || '',
    location: partial?.location || '',
    availability: partial?.availability ?? 'open',
    headline: partial?.headline || '',
    summary: partial?.summary ?? '',
    skills,
    skill_entries: skillEntries,
    experience: partial?.experience?.length
      ? partial.experience.map(syncExperienceEntry)
      : [emptyExperience()],
    education: partial?.education?.length
      ? partial.education.map(syncEducationEntry)
      : [emptyEducation()],
    projects: partial?.projects ?? [],
    certifications: partial?.certifications ?? [],
    achievements: partial?.achievements ?? [],
    languages: partial?.languages ?? [],
    linkedin: partial?.linkedin || '',
    github: partial?.github || '',
    website: partial?.website || '',
    twitter: partial?.twitter || '',
    job_preferences: partial?.job_preferences ?? {
      preferred_roles: [],
      expected_salary_min: 0,
      expected_salary_max: 0,
      expected_salary_currency: 'BDT',
      employment_types: ['full-time'],
      work_preference: 'any',
    },
    source: 'builder',
  };
}

export function normalizeCvDraft(draft: BuiltCvProfile): BuiltCvProfile {
  const skillEntries = (draft.skill_entries ?? [])
    .map((entry) => ({ ...entry, name: entry.name.trim() }))
    .filter((entry) => entry.name);

  return {
    ...draft,
    fullName: draft.fullName.trim(),
    name: draft.name?.trim() || draft.fullName.trim(),
    headline: draft.headline?.trim() || undefined,
    summary: draft.summary?.trim() || '',
    location: draft.location?.trim() || undefined,
    email: draft.email?.trim() || undefined,
    phone: draft.phone?.trim() || undefined,
    skills: skillEntries.map((entry) => entry.name),
    skill_entries: skillEntries,
    experience: (draft.experience ?? [])
      .map(syncExperienceEntry)
      .filter((e) => e.title.trim() || e.company.trim()),
    education: (draft.education ?? [])
      .map(syncEducationEntry)
      .filter((e) => e.degree.trim() || e.school.trim()),
    projects: (draft.projects ?? [])
      .map((p) => ({ ...p, title: p.title.trim() }))
      .filter((p) => p.title),
    certifications: (draft.certifications ?? [])
      .map((c) => ({ ...c, name: c.name.trim() }))
      .filter((c) => c.name),
    achievements: (draft.achievements ?? [])
      .map((a) => ({ ...a, title: a.title.trim() }))
      .filter((a) => a.title),
    languages: (draft.languages ?? [])
      .map((l) => ({ ...l, name: l.name.trim() }))
      .filter((l) => l.name),
    linkedin: draft.linkedin?.trim() || undefined,
    github: draft.github?.trim() || undefined,
    website: draft.website?.trim() || undefined,
    twitter: draft.twitter?.trim() || undefined,
  };
}
