import type { ReactNode } from 'react';
import type { BuiltCvProfile, CvSkillEntry } from '@/types/cv';
import { skillEntriesFromDraft } from '@/utils/cv';

interface Props {
  profile: BuiltCvProfile;
  className?: string;
}

function ensureUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) return trimmed;
  if (trimmed.includes('@') && !trimmed.startsWith('mailto:')) return `mailto:${trimmed}`;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function linkLabel(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.includes('@')) return 'Email';
  if (/linkedin/i.test(trimmed)) return 'LinkedIn';
  if (/github/i.test(trimmed)) return 'GitHub';
  if (/twitter|x\.com/i.test(trimmed)) return 'Twitter';
  try {
    const host = new URL(ensureUrl(trimmed)).hostname.replace(/^www\./, '');
    return host || fallback;
  } catch {
    return fallback;
  }
}

function formatSkillLabel(entry: CvSkillEntry): string {
  const name = entry.name.trim();
  if (!name) return '';
  if (!entry.level) return name;
  const level = entry.level.charAt(0).toUpperCase() + entry.level.slice(1);
  return `${name} (${level})`;
}

function ContactSeparator() {
  return <span className="cv-template-contact-sep" aria-hidden>|</span>;
}

function ContactLine({ profile }: { profile: BuiltCvProfile }) {
  const items: ReactNode[] = [];

  const pushText = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    items.push(<span key={`text-${items.length}`}>{trimmed}</span>);
  };

  const pushLink = (value: string | undefined, fallback: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    items.push(
      <a
        key={`link-${items.length}`}
        href={ensureUrl(trimmed)}
        className="cv-template-link"
        target="_blank"
        rel="noreferrer noopener"
      >
        {linkLabel(trimmed, fallback)}
      </a>,
    );
  };

  pushText(profile.location);
  pushText(profile.phone);
  pushLink(profile.email, 'Email');
  pushLink(profile.linkedin, 'LinkedIn');
  pushLink(profile.github, 'GitHub');
  pushLink(profile.website, 'Website');
  pushLink(profile.twitter, 'Twitter');

  if (!items.length) {
    return (
      <p className="cv-template-contact cv-template-placeholder">
        location | phone | email | LinkedIn | GitHub
      </p>
    );
  }

  return (
    <p className="cv-template-contact">
      {items.map((item, index) => (
        <span key={index} className="cv-template-contact-item">
          {index > 0 ? <ContactSeparator /> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

function SectionBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="cv-template-section">
      <h2 className="cv-template-section-title">{title}</h2>
      <div className="cv-template-section-body">{children}</div>
    </section>
  );
}

/** Standard A4 CV Document Preview & Print */
export function CvPreview({ profile, className = '' }: Props) {
  const name = profile.fullName || profile.name || 'Your Name';
  const skillEntries = skillEntriesFromDraft(profile).filter((entry) => entry.name.trim());
  const experience = (profile.experience ?? []).filter((e) => e.title || e.company);
  const education = (profile.education ?? []).filter((e) => e.degree || e.school);
  const projects = (profile.projects ?? []).filter((p) => p.title);
  const certifications = (profile.certifications ?? []).filter((c) => c.name);
  const achievements = (profile.achievements ?? []).filter((a) => a.title);
  const languages = (profile.languages ?? []).filter((l) => l.name);

  return (
    <article className={`cv-template ${className}`.trim()} data-cv-template>
      <header className="cv-template-header">
        <h1 className="cv-template-name">{name}</h1>
        {profile.headline?.trim() ? (
          <p className="cv-template-headline">{profile.headline.trim()}</p>
        ) : null}
        <ContactLine profile={profile} />
      </header>

      {profile.summary?.trim() ? (
        <p className="cv-template-summary">{profile.summary.trim()}</p>
      ) : null}

      {skillEntries.length > 0 ? (
        <p className="cv-template-skills-line">
          <strong>Skills:</strong> {skillEntries.map(formatSkillLabel).filter(Boolean).join(', ')}
        </p>
      ) : null}

      {experience.length > 0 ? (
        <SectionBox title="Work Experience">
          <div className="cv-template-entries">
            {experience.map((exp, i) => (
              <div key={i} className="cv-template-entry">
                <div className="cv-template-entry-row">
                  <p className="cv-template-entry-primary">
                    <strong>{exp.title || 'Role'}</strong>
                    {exp.company ? (
                      <>
                        {' '}
                        at <em>{exp.company}</em>
                      </>
                    ) : null}
                    {exp.location ? <> · {exp.location}</> : null}
                  </p>
                  {exp.duration ? (
                    <span className="cv-template-entry-date">
                      <strong>{exp.duration}</strong>
                    </span>
                  ) : null}
                </div>
                {exp.description?.trim() ? (
                  <p className="cv-template-entry-detail">{exp.description.trim()}</p>
                ) : null}
                {exp.highlights?.filter(Boolean).length > 0 ? (
                  <ul className="cv-template-bullets">
                    {exp.highlights.filter(Boolean).map((highlight, j) => (
                      <li key={j}>{highlight}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </SectionBox>
      ) : null}

      {education.length > 0 ? (
        <SectionBox title="Education">
          <div className="cv-template-entries">
            {education.map((edu, i) => (
              <div key={i} className="cv-template-entry">
                <div className="cv-template-entry-row">
                  <p className="cv-template-entry-primary">
                    <strong>{edu.degree || 'Degree'}</strong>
                    {edu.field ? ` in ${edu.field}` : ''}
                    {edu.school ? `, ${edu.school}` : ''}
                    {edu.grade ? <> · {edu.grade}</> : null}
                  </p>
                  {edu.year ? (
                    <span className="cv-template-entry-date">
                      <strong>{edu.year}</strong>
                    </span>
                  ) : null}
                </div>
                {edu.description?.trim() ? (
                  <p className="cv-template-entry-detail">{edu.description.trim()}</p>
                ) : null}
              </div>
            ))}
          </div>
        </SectionBox>
      ) : null}

      {projects.length > 0 ? (
        <SectionBox title="Projects">
          <div className="cv-template-entries">
            {projects.map((project, i) => {
              const projectDates = [project.start_date, project.end_date].filter(Boolean).join(' – ');
              const projectLink = project.url || project.repo_url;
              return (
                <div key={i} className="cv-template-entry">
                  <div className="cv-template-entry-row">
                    <p className="cv-template-entry-primary">
                      <strong>{project.title}</strong>
                    </p>
                    {projectDates ? (
                      <span className="cv-template-entry-date">
                        <strong>{projectDates}</strong>
                      </span>
                    ) : projectLink ? (
                      <a
                        href={ensureUrl(projectLink)}
                        className="cv-template-entry-date cv-template-link"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Link
                      </a>
                    ) : null}
                  </div>
                  {project.description ? (
                    <p className="cv-template-entry-detail">{project.description}</p>
                  ) : null}
                  {(project.technologies ?? []).filter(Boolean).length > 0 ? (
                    <p className="cv-template-entry-detail">
                      <em>{(project.technologies ?? []).join(', ')}</em>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </SectionBox>
      ) : null}

      {achievements.length > 0 ? (
        <SectionBox title="Achievements">
          <ul className="cv-template-bullets cv-template-bullets--tight">
            {achievements.map((item, i) => (
              <li key={i}>
                <strong>{item.title}</strong>
                {item.date ? ` (${item.date})` : ''}
                {item.description ? ` — ${item.description}` : ''}
              </li>
            ))}
          </ul>
        </SectionBox>
      ) : null}

      {certifications.length > 0 ? (
        <SectionBox title="Certifications">
          <ul className="cv-template-bullets cv-template-bullets--tight">
            {certifications.map((cert, i) => (
              <li key={i}>
                <strong>{cert.name}</strong>
                {[cert.issuer, cert.issue_date || cert.date, cert.expiry_date ? `Exp. ${cert.expiry_date}` : '']
                  .filter(Boolean)
                  .length
                  ? ` — ${[cert.issuer, cert.issue_date || cert.date, cert.expiry_date ? `Exp. ${cert.expiry_date}` : '']
                      .filter(Boolean)
                      .join(', ')}`
                  : ''}
              </li>
            ))}
          </ul>
        </SectionBox>
      ) : null}

      {languages.length > 0 ? (
        <SectionBox title="Languages">
          <p className="cv-template-inline-text">
            {languages
              .map((lang) => (lang.proficiency ? `${lang.name} (${lang.proficiency})` : lang.name))
              .join(', ')}
          </p>
        </SectionBox>
      ) : null}
    </article>
  );
}
