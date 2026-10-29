'use client';

import { useCallback, useId, useState, type ReactNode } from 'react';
import { Award, Briefcase, ChevronDown, FolderKanban, Globe, GraduationCap, Link2, Plus, Sparkles, Target, Trash2, Trophy, X } from 'lucide-react';
import type { BuiltCvProfile, CvSkillEntry } from '@/types/cv';
import { emptyAchievement, emptyCertification, emptyEducation, emptyExperience, emptyLanguage, emptyProject, emptySkill, syncEducationEntry, syncExperienceEntry } from '@/utils/cv';

interface CvFormProps {
  draft: BuiltCvProfile;
  skillEntries: CvSkillEntry[];
  onPatch: (partial: Partial<BuiltCvProfile>) => void;
  onPatchSkillEntries: (entries: CvSkillEntry[]) => void;
}

const CV_FORM_SECTIONS = [
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
] as const;

type CvFormSectionId = (typeof CV_FORM_SECTIONS)[number];

const EMPLOYMENT_OPTIONS = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

const CURRENCY_OPTIONS = [
  { value: 'BDT', label: 'BDT (৳)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

function defaultExpandedSections(): Record<CvFormSectionId, boolean> {
  return Object.fromEntries(CV_FORM_SECTIONS.map((id) => [id, true])) as Record<CvFormSectionId, boolean>;
}

export function CvForm({
  draft,
  skillEntries,
  onPatch,
  onPatchSkillEntries,
}: CvFormProps) {
  const jobPrefs = draft.job_preferences ?? {
    preferred_roles: [],
    expected_salary_min: 0,
    expected_salary_max: 0,
    expected_salary_currency: 'BDT',
    employment_types: ['full-time'],
    work_preference: 'any' as const,
  };

  const patchJobPrefs = (partial: Partial<NonNullable<BuiltCvProfile['job_preferences']>>) => {
    onPatch({ job_preferences: { ...jobPrefs, ...partial } });
  };

  const [expandedSections, setExpandedSections] = useState(defaultExpandedSections);
  const toggleSection = useCallback((id: CvFormSectionId) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="cv-gen-form cset-stack">
      {/* 1. Personal Information */}
      <CollapsibleSection
        id="personal"
        title="Personal information"
        expanded={expandedSections.personal}
        onToggle={() => toggleSection('personal')}
      >
        <div className="cset-fields-grid">
          <Field
            label="Full name"
            value={draft.fullName}
            onChange={(v) => onPatch({ fullName: v, name: v })}
            placeholder="Amit Chandra Roy"
          />
          <Field
            label="Professional headline"
            value={draft.headline || ''}
            onChange={(v) => onPatch({ headline: v })}
            placeholder="Senior Software Engineer · React & Node.js"
          />
          <Field
            label="Location"
            value={draft.location || ''}
            onChange={(v) => onPatch({ location: v })}
            placeholder="Dhaka, Bangladesh · Remote"
          />
          <SelectField
            label="Availability"
            value={draft.availability || 'open'}
            onChange={(v) => onPatch({ availability: v })}
            options={[
              { value: 'available', label: 'Available now' },
              { value: 'open', label: 'Open to offers' },
              { value: 'not_looking', label: 'Not looking' },
            ]}
          />
          <Field
            label="Email"
            value={draft.email || ''}
            onChange={(v) => onPatch({ email: v })}
            placeholder="you@email.com"
            type="email"
          />
          <Field
            label="Phone"
            value={draft.phone || ''}
            onChange={(v) => onPatch({ phone: v })}
            placeholder="+880 1XXX XXXXXX"
          />
        </div>
      </CollapsibleSection>

      {/* 2. Professional Summary */}
      <CollapsibleSection
        id="about"
        title="About me"
        expanded={expandedSections.about}
        onToggle={() => toggleSection('about')}
      >
        <TextAreaField
          label="Professional summary"
          value={draft.summary || ''}
          onChange={(v) => onPatch({ summary: v })}
          rows={5}
          placeholder="Tell recruiters about your background, key strengths, and career highlights…"
        />
      </CollapsibleSection>

      {/* 3. Skills */}
      <CollapsibleSection
        id="skills"
        title="Skills"
        icon={<Sparkles size={18} aria-hidden />}
        expanded={expandedSections.skills}
        onToggle={() => toggleSection('skills')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatchSkillEntries([...skillEntries, emptySkill()])}
          >
            <Plus size={14} aria-hidden /> Add skill
          </button>
        }
      >
        {skillEntries.length === 0 ? (
          <p className="cv-gen-empty-hint">Add skills with their proficiency level.</p>
        ) : (
          <div className="cv-gen-entries">
            {skillEntries.map((skill, index) => (
              <ArrayEntryShell
                key={index}
                label={`Skill ${index + 1}`}
                subtitle={skill.name.trim() || undefined}
                onRemove={() => onPatchSkillEntries(skillEntries.filter((_, i) => i !== index))}
              >
                <div className="cset-fields-grid">
                  <Field
                    label="Skill name"
                    value={skill.name}
                    onChange={(v) => {
                      const next = skillEntries.map((item, i) => (i === index ? { ...item, name: v } : item));
                      onPatchSkillEntries(next);
                    }}
                    placeholder="TypeScript"
                  />
                  <SelectField
                    label="Level"
                    value={skill.level ?? 'intermediate'}
                    onChange={(v) => {
                      const next = skillEntries.map((item, i) =>
                        i === index ? { ...item, level: v as CvSkillEntry['level'] } : item,
                      );
                      onPatchSkillEntries(next);
                    }}
                    options={[
                      { value: 'beginner', label: 'Beginner' },
                      { value: 'intermediate', label: 'Intermediate' },
                      { value: 'expert', label: 'Expert' },
                    ]}
                  />
                </div>
              </ArrayEntryShell>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 4. Experience */}
      <CollapsibleSection
        id="experience"
        title="Work experience"
        icon={<Briefcase size={18} aria-hidden />}
        expanded={expandedSections.experience}
        onToggle={() => toggleSection('experience')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatch({ experience: [...draft.experience, emptyExperience()] })}
          >
            <Plus size={14} aria-hidden /> Add role
          </button>
        }
      >
        <div className="cv-gen-entries">
          {draft.experience.map((exp, index) => (
            <ArrayEntryShell
              key={index}
              label={`Role ${index + 1}`}
              subtitle={[exp.title, exp.company].filter(Boolean).join(' · ') || undefined}
              onRemove={
                draft.experience.length > 1
                  ? () => onPatch({ experience: draft.experience.filter((_, i) => i !== index) })
                  : undefined
              }
            >
              <div className="cset-fields-grid">
                <Field
                  label="Job title"
                  value={exp.title}
                  onChange={(v) => updateExperience(draft, index, { title: v }, onPatch)}
                  placeholder="Software Engineer"
                />
                <Field
                  label="Company"
                  value={exp.company}
                  onChange={(v) => updateExperience(draft, index, { company: v }, onPatch)}
                  placeholder="Company name"
                />
                <Field
                  label="Location"
                  value={exp.location || ''}
                  onChange={(v) => updateExperience(draft, index, { location: v }, onPatch)}
                  placeholder="Dhaka, Bangladesh"
                />
                <Field
                  label="Start"
                  value={exp.start_date || ''}
                  onChange={(v) => updateExperience(draft, index, { start_date: v }, onPatch)}
                  placeholder="Jan 2022"
                />
                <Field
                  label="End"
                  value={exp.end_date || ''}
                  onChange={(v) => updateExperience(draft, index, { end_date: v }, onPatch)}
                  placeholder="Present"
                  disabled={exp.current}
                />
              </div>
              <CheckboxField
                label="Currently working here"
                checked={exp.current ?? false}
                onChange={(checked) =>
                  updateExperience(draft, index, { current: checked, end_date: checked ? '' : exp.end_date }, onPatch)
                }
              />
              <TextAreaField
                label="Description"
                value={exp.description || ''}
                onChange={(v) => updateExperience(draft, index, { description: v }, onPatch)}
                rows={3}
              />
              <TextAreaField
                label="Highlights (one bullet per line)"
                value={(exp.highlights || []).join('\n')}
                onChange={(v) =>
                  updateExperience(draft, index, { highlights: v.split('\n') }, onPatch)
                }
                rows={4}
                placeholder={'Designed and scaled microservices\nImproved response time by 40%'}
              />
            </ArrayEntryShell>
          ))}
        </div>
      </CollapsibleSection>

      {/* 5. Education */}
      <CollapsibleSection
        id="education"
        title="Education"
        icon={<GraduationCap size={18} aria-hidden />}
        expanded={expandedSections.education}
        onToggle={() => toggleSection('education')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatch({ education: [...draft.education, emptyEducation()] })}
          >
            <Plus size={14} aria-hidden /> Add education
          </button>
        }
      >
        <div className="cv-gen-entries">
          {draft.education.map((edu, index) => (
            <ArrayEntryShell
              key={index}
              label={`Education ${index + 1}`}
              subtitle={[edu.degree, edu.school].filter(Boolean).join(' · ') || undefined}
              onRemove={
                draft.education.length > 1
                  ? () => onPatch({ education: draft.education.filter((_, i) => i !== index) })
                  : undefined
              }
            >
              <div className="cset-fields-grid">
                <Field
                  label="Degree"
                  value={edu.degree}
                  onChange={(v) => updateEducation(draft, index, { degree: v }, onPatch)}
                  placeholder="BSc in Computer Science"
                />
                <Field
                  label="School / University"
                  value={edu.school}
                  onChange={(v) => updateEducation(draft, index, { school: v }, onPatch)}
                  placeholder="University name"
                />
                <Field
                  label="Field of study"
                  value={edu.field || ''}
                  onChange={(v) => updateEducation(draft, index, { field: v }, onPatch)}
                  placeholder="Computer Science & Engineering"
                />
                <Field
                  label="Grade / GPA"
                  value={edu.grade || ''}
                  onChange={(v) => updateEducation(draft, index, { grade: v }, onPatch)}
                  placeholder="3.85 / 4.00"
                />
                <Field
                  label="Start year"
                  value={edu.start_date || ''}
                  onChange={(v) => updateEducation(draft, index, { start_date: v }, onPatch)}
                  placeholder="2018"
                />
                <Field
                  label="End year"
                  value={edu.end_date || ''}
                  onChange={(v) => updateEducation(draft, index, { end_date: v }, onPatch)}
                  placeholder="2022"
                  disabled={edu.current}
                />
              </div>
              <CheckboxField
                label="Currently studying here"
                checked={edu.current ?? false}
                onChange={(checked) =>
                  updateEducation(draft, index, { current: checked, end_date: checked ? '' : edu.end_date }, onPatch)
                }
              />
              <TextAreaField
                label="Description"
                value={edu.description || ''}
                onChange={(v) => updateEducation(draft, index, { description: v }, onPatch)}
                rows={2}
              />
            </ArrayEntryShell>
          ))}
        </div>
      </CollapsibleSection>

      {/* 6. Projects */}
      <CollapsibleSection
        id="projects"
        title="Projects"
        icon={<FolderKanban size={18} aria-hidden />}
        expanded={expandedSections.projects}
        onToggle={() => toggleSection('projects')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatch({ projects: [...(draft.projects ?? []), emptyProject()] })}
          >
            <Plus size={14} aria-hidden /> Add project
          </button>
        }
      >
        {(draft.projects ?? []).length === 0 ? (
          <p className="cv-gen-empty-hint">Optional — add notable personal or open source projects.</p>
        ) : (
          <div className="cv-gen-entries">
            {(draft.projects ?? []).map((project, index) => (
              <ArrayEntryShell
                key={index}
                label={`Project ${index + 1}`}
                subtitle={project.title.trim() || undefined}
                onRemove={() => onPatch({ projects: (draft.projects ?? []).filter((_, i) => i !== index) })}
              >
                <Field
                  label="Project Title"
                  value={project.title}
                  onChange={(v) => updateProject(draft, index, { title: v }, onPatch)}
                  placeholder="Project name"
                />
                <TextAreaField
                  label="Description"
                  value={project.description || ''}
                  onChange={(v) => updateProject(draft, index, { description: v }, onPatch)}
                  rows={2}
                />
                <div className="cset-fields-grid">
                  <Field
                    label="Live Demo URL"
                    value={project.url || ''}
                    onChange={(v) => updateProject(draft, index, { url: v }, onPatch)}
                    placeholder="https://project.example.com"
                  />
                  <Field
                    label="Repository URL"
                    value={project.repo_url || ''}
                    onChange={(v) => updateProject(draft, index, { repo_url: v }, onPatch)}
                    placeholder="https://github.com/user/project"
                  />
                  <Field
                    label="Start Date"
                    value={project.start_date || ''}
                    onChange={(v) => updateProject(draft, index, { start_date: v }, onPatch)}
                    placeholder="Jan 2024"
                  />
                  <Field
                    label="End Date"
                    value={project.end_date || ''}
                    onChange={(v) => updateProject(draft, index, { end_date: v }, onPatch)}
                    placeholder="Mar 2024"
                  />
                  <div className="cset-col-span-2">
                    <Field
                      label="Technologies (comma-separated)"
                      value={(project.technologies ?? []).join(', ')}
                      onChange={(v) =>
                        updateProject(
                          draft,
                          index,
                          { technologies: v.split(',').map((tag) => tag.trim()).filter(Boolean) },
                          onPatch,
                        )
                      }
                      placeholder="Next.js, TypeScript, PostgreSQL"
                    />
                  </div>
                </div>
              </ArrayEntryShell>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 7. Certifications */}
      <CollapsibleSection
        id="certifications"
        title="Certifications"
        icon={<Award size={18} aria-hidden />}
        expanded={expandedSections.certifications}
        onToggle={() => toggleSection('certifications')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatch({ certifications: [...(draft.certifications ?? []), emptyCertification()] })}
          >
            <Plus size={14} aria-hidden /> Add certification
          </button>
        }
      >
        {(draft.certifications ?? []).length === 0 ? (
          <p className="cv-gen-empty-hint">Add industry certifications if you have them.</p>
        ) : (
          <div className="cv-gen-entries">
            {(draft.certifications ?? []).map((cert, index) => (
              <ArrayEntryShell
                key={index}
                label={`Certification ${index + 1}`}
                subtitle={cert.name.trim() || undefined}
                onRemove={() => onPatch({ certifications: (draft.certifications ?? []).filter((_, i) => i !== index) })}
              >
                <div className="cset-fields-grid">
                  <Field
                    label="Certification Name"
                    value={cert.name}
                    onChange={(v) => updateCertification(draft, index, { name: v }, onPatch)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                  <Field
                    label="Issuing Organization"
                    value={cert.issuer || ''}
                    onChange={(v) => updateCertification(draft, index, { issuer: v }, onPatch)}
                    placeholder="Amazon Web Services"
                  />
                  <Field
                    label="Issue Date"
                    value={cert.issue_date || cert.date || ''}
                    onChange={(v) => updateCertification(draft, index, { issue_date: v, date: v }, onPatch)}
                    placeholder="2024"
                  />
                  <Field
                    label="Expiry Date"
                    value={cert.expiry_date || ''}
                    onChange={(v) => updateCertification(draft, index, { expiry_date: v }, onPatch)}
                    placeholder="2027"
                  />
                  <Field
                    label="Credential URL"
                    value={cert.credential_url || ''}
                    onChange={(v) => updateCertification(draft, index, { credential_url: v }, onPatch)}
                    placeholder="https://credly.com/…"
                  />
                  <Field
                    label="Credential ID"
                    value={cert.credential_id || ''}
                    onChange={(v) => updateCertification(draft, index, { credential_id: v }, onPatch)}
                    placeholder="AWS-12345"
                  />
                </div>
              </ArrayEntryShell>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 8. Achievements */}
      <CollapsibleSection
        id="achievements"
        title="Achievements"
        icon={<Trophy size={18} aria-hidden />}
        expanded={expandedSections.achievements}
        onToggle={() => toggleSection('achievements')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatch({ achievements: [...(draft.achievements ?? []), emptyAchievement()] })}
          >
            <Plus size={14} aria-hidden /> Add achievement
          </button>
        }
      >
        {(draft.achievements ?? []).length === 0 ? (
          <p className="cv-gen-empty-hint">Add awards, contest rankings, or significant achievements.</p>
        ) : (
          <div className="cv-gen-entries">
            {(draft.achievements ?? []).map((item, index) => (
              <ArrayEntryShell
                key={index}
                label={`Achievement ${index + 1}`}
                subtitle={item.title.trim() || undefined}
                onRemove={() => onPatch({ achievements: (draft.achievements ?? []).filter((_, i) => i !== index) })}
              >
                <Field
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateAchievement(draft, index, { title: v }, onPatch)}
                  placeholder="Hackathon Champion 2024"
                />
                <TextAreaField
                  label="Description"
                  value={item.description || ''}
                  onChange={(v) => updateAchievement(draft, index, { description: v }, onPatch)}
                  rows={2}
                />
                <Field
                  label="Date / Year"
                  value={item.date || ''}
                  onChange={(v) => updateAchievement(draft, index, { date: v }, onPatch)}
                  placeholder="2024"
                />
              </ArrayEntryShell>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 9. Languages */}
      <CollapsibleSection
        id="languages"
        title="Languages"
        icon={<Globe size={18} aria-hidden />}
        expanded={expandedSections.languages}
        onToggle={() => toggleSection('languages')}
        actions={
          <button
            type="button"
            className="cv-gen-add"
            onClick={() => onPatch({ languages: [...(draft.languages ?? []), emptyLanguage()] })}
          >
            <Plus size={14} aria-hidden /> Add language
          </button>
        }
      >
        {(draft.languages ?? []).length === 0 ? (
          <p className="cv-gen-empty-hint">Add languages you speak with proficiency.</p>
        ) : (
          <div className="cv-gen-entries">
            {(draft.languages ?? []).map((lang, index) => (
              <ArrayEntryShell
                key={index}
                label={`Language ${index + 1}`}
                subtitle={lang.name.trim() || undefined}
                onRemove={() => onPatch({ languages: (draft.languages ?? []).filter((_, i) => i !== index) })}
              >
                <div className="cset-fields-grid">
                  <Field
                    label="Language"
                    value={lang.name}
                    onChange={(v) => updateLanguage(draft, index, { name: v }, onPatch)}
                    placeholder="English"
                  />
                  <SelectField
                    label="Proficiency"
                    value={lang.proficiency || 'conversational'}
                    onChange={(v) =>
                      updateLanguage(draft, index, { proficiency: v as import('@/types/cv').CvLanguageEntry['proficiency'] }, onPatch)
                    }
                    options={[
                      { value: 'basic', label: 'Basic' },
                      { value: 'conversational', label: 'Conversational' },
                      { value: 'fluent', label: 'Fluent' },
                      { value: 'native', label: 'Native' },
                    ]}
                  />
                </div>
              </ArrayEntryShell>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 10. Links */}
      <CollapsibleSection
        id="links"
        title="Portfolio & social links"
        icon={<Link2 size={18} aria-hidden />}
        expanded={expandedSections.links}
        onToggle={() => toggleSection('links')}
      >
        <div className="cset-fields-grid">
          <Field
            label="Portfolio Website"
            value={draft.website || ''}
            onChange={(v) => onPatch({ website: v })}
            placeholder="https://yoursite.com"
          />
          <Field
            label="GitHub"
            value={draft.github || ''}
            onChange={(v) => onPatch({ github: v })}
            placeholder="https://github.com/username"
          />
          <Field
            label="LinkedIn"
            value={draft.linkedin || ''}
            onChange={(v) => onPatch({ linkedin: v })}
            placeholder="https://linkedin.com/in/username"
          />
          <Field
            label="Twitter / X"
            value={draft.twitter || ''}
            onChange={(v) => onPatch({ twitter: v })}
            placeholder="https://twitter.com/username"
          />
        </div>
      </CollapsibleSection>

      {/* 11. Job Preferences */}
      <CollapsibleSection
        id="preferences"
        title="Job preferences"
        icon={<Target size={18} aria-hidden />}
        expanded={expandedSections.preferences}
        onToggle={() => toggleSection('preferences')}
      >
        <div className="cv-gen-field">
          <span className="cset-label">Preferred job roles</span>
          <TagInput
            tags={jobPrefs.preferred_roles ?? []}
            placeholder="Type role and press Enter (e.g. Frontend Engineer)"
            onAdd={(value) => patchJobPrefs({ preferred_roles: [...(jobPrefs.preferred_roles ?? []), value] })}
            onRemove={(value) =>
              patchJobPrefs({
                preferred_roles: (jobPrefs.preferred_roles ?? []).filter((role) => role !== value),
              })
            }
          />
        </div>
        <div className="cset-fields-grid">
          <SelectField
            label="Work preference"
            value={jobPrefs.work_preference ?? 'any'}
            onChange={(v) => patchJobPrefs({ work_preference: v as NonNullable<typeof jobPrefs.work_preference> })}
            options={[
              { value: 'any', label: 'Any' },
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'On-site' },
            ]}
          />
          <SelectField
            label="Currency"
            value={jobPrefs.expected_salary_currency ?? 'BDT'}
            onChange={(v) => patchJobPrefs({ expected_salary_currency: v })}
            options={CURRENCY_OPTIONS}
          />
          <Field
            label="Salary min"
            type="number"
            value={String(jobPrefs.expected_salary_min ?? 0)}
            onChange={(v) => patchJobPrefs({ expected_salary_min: Number(v) || 0 })}
            placeholder="0"
          />
          <Field
            label="Salary max"
            type="number"
            value={String(jobPrefs.expected_salary_max ?? 0)}
            onChange={(v) => patchJobPrefs({ expected_salary_max: Number(v) || 0 })}
            placeholder="0"
          />
        </div>
        <fieldset className="cv-gen-fieldset">
          <legend className="cset-label">Employment types</legend>
          <div className="cv-gen-check-grid">
            {EMPLOYMENT_OPTIONS.map(({ value, label }) => {
              const checked = (jobPrefs.employment_types ?? []).includes(value);
              return (
                <label key={value} className="cv-gen-check-label">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const types = jobPrefs.employment_types ?? [];
                      patchJobPrefs({
                        employment_types: checked ? types.filter((item) => item !== value) : [...types, value],
                      });
                    }}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  id,
  title,
  icon,
  actions,
  expanded,
  onToggle,
  children,
}: {
  id: CvFormSectionId;
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = `cv-gen-section-${id}`;

  return (
    <section className={`cset-section cv-gen-card cv-gen-collapsible${expanded ? ' is-expanded' : ''}`}>
      <div className="cv-gen-collapsible-head">
        <button
          type="button"
          className="cv-gen-collapsible-toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <ChevronDown size={18} className="cv-gen-collapsible-chevron" aria-hidden />
          <h2 className="cset-section-title">
            {icon}
            {title}
          </h2>
        </button>
        {actions ? <div className="cv-gen-collapsible-actions">{actions}</div> : null}
      </div>
      <div id={panelId} className="cv-gen-collapsible-body" hidden={!expanded}>
        <div className="cv-gen-collapsible-inner">{children}</div>
      </div>
    </section>
  );
}

function ArrayEntryShell({
  label,
  subtitle,
  onRemove,
  children,
  defaultExpanded = true,
}: {
  label: string;
  subtitle?: string;
  onRemove?: () => void;
  children: ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = `cv-gen-entry-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`cv-gen-entry cv-gen-entry-collapsible${expanded ? ' is-expanded' : ''}`}>
      <div className="cv-gen-entry-top">
        <button
          type="button"
          className="cv-gen-entry-toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((open) => !open)}
        >
          <ChevronDown size={16} className="cv-gen-entry-chevron" aria-hidden />
          <span className="cv-gen-entry-label">{label}</span>
          {subtitle ? <span className="cv-gen-entry-subtitle">{subtitle}</span> : null}
        </button>
        {onRemove ? (
          <button type="button" className="cv-gen-remove" aria-label={`Remove ${label}`} onClick={onRemove}>
            <Trash2 size={14} />
          </button>
        ) : null}
      </div>
      <div id={panelId} className="cv-gen-entry-body" hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}

function TagInput({
  tags,
  placeholder,
  onAdd,
  onRemove,
}: {
  tags: string[];
  placeholder: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
        setInputVal('');
      }
    }
  };

  return (
    <div className="cv-gen-tag-box">
      {tags.map((tag) => (
        <span key={tag} className="cv-gen-tag-badge">
          {tag}
          <button
            type="button"
            className="cv-gen-tag-remove"
            onClick={() => onRemove(tag)}
            aria-label={`Remove ${tag}`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        className="cv-gen-tag-input"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  const id = useId();

  return (
    <div className="cv-gen-field">
      <label className="cset-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="cset-input"
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const id = useId();

  return (
    <div className="cv-gen-field cv-gen-field--textarea">
      <label className="cset-label" htmlFor={id}>
        {label}
      </label>
      <div className="cset-bio-box">
        <textarea
          id={id}
          className="cset-textarea"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = useId();

  return (
    <div className="cv-gen-field">
      <label className="cset-label" htmlFor={id}>
        {label}
      </label>
      <select id={id} className="cset-input cset-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="cv-gen-check-label cv-gen-check-label--inline">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function updateExperience(
  draft: BuiltCvProfile,
  index: number,
  patch: Partial<BuiltCvProfile['experience'][number]>,
  onPatch: CvFormProps['onPatch'],
) {
  const experience = draft.experience.map((item, i) =>
    i === index ? syncExperienceEntry({ ...item, ...patch }) : item,
  );
  onPatch({ experience });
}

function updateEducation(
  draft: BuiltCvProfile,
  index: number,
  patch: Partial<BuiltCvProfile['education'][number]>,
  onPatch: CvFormProps['onPatch'],
) {
  const education = draft.education.map((item, i) =>
    i === index ? syncEducationEntry({ ...item, ...patch }) : item,
  );
  onPatch({ education });
}

function updateProject(
  draft: BuiltCvProfile,
  index: number,
  patch: Partial<NonNullable<BuiltCvProfile['projects']>[number]>,
  onPatch: CvFormProps['onPatch'],
) {
  const projects = (draft.projects ?? []).map((item, i) => (i === index ? { ...item, ...patch } : item));
  onPatch({ projects });
}

function updateCertification(
  draft: BuiltCvProfile,
  index: number,
  patch: Partial<NonNullable<BuiltCvProfile['certifications']>[number]>,
  onPatch: CvFormProps['onPatch'],
) {
  const certifications = (draft.certifications ?? []).map((item, i) => (i === index ? { ...item, ...patch } : item));
  onPatch({ certifications });
}

function updateAchievement(
  draft: BuiltCvProfile,
  index: number,
  patch: Partial<NonNullable<BuiltCvProfile['achievements']>[number]>,
  onPatch: CvFormProps['onPatch'],
) {
  const achievements = (draft.achievements ?? []).map((item, i) => (i === index ? { ...item, ...patch } : item));
  onPatch({ achievements });
}

function updateLanguage(
  draft: BuiltCvProfile,
  index: number,
  patch: Partial<NonNullable<BuiltCvProfile['languages']>[number]>,
  onPatch: CvFormProps['onPatch'],
) {
  const languages = (draft.languages ?? []).map((item, i) => (i === index ? { ...item, ...patch } : item));
  onPatch({ languages });
}
