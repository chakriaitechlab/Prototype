'use client';

import { useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Award, Briefcase, ExternalLink, GraduationCap, MapPin, MessageSquare, Trophy, User } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { PublicProfile } from '@/types/profile';
import { fluencyLabel, formatDateRange, yearOf } from '@/utils/public-profile';
import type { PublicProfileSummary } from '@/utils/public-profile';
import { ContactButton } from './ContactCard';
import { BottomSheet } from './ProjectDetailsModal';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

const DEFAULT_LANGUAGES = [
  { name: 'English', label: 'Fluent' },
  { name: 'Bengali', label: 'Native/Bilingual' },
];

interface MoreAboutMeProps {
  profile: PublicProfile;
  summary: PublicProfileSummary;
}

function TimelineSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-bold text-[#222325] mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TimelineItem({ icon: Icon, children }: { icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="w-10 h-10 rounded-full bg-[#f0f2f5] flex items-center justify-center shrink-0 text-[#74767e]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MoreAboutMeModal({ profile, summary, onClose }: MoreAboutMeProps & { onClose: () => void }) {
  const { displayName, username, avatarUrl, headline, skills, education, certifications, achievements, experience, languages } =
    profile;
  const about = profile.about.trim();

  return (
    <BottomSheet onClose={onClose} width="max-w-6xl" sheetClassName="max-h-[88vh] sm:max-h-[90vh]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-8 border-b border-[#dadbdd]">
          <div className="flex items-start gap-4 sm:gap-6 min-w-0">
            <UserAvatar
              src={avatarUrl}
              name={displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#dadbdd] shadow-2xs text-2xl"
              fallbackClassName="bg-[#e7f0fa] text-[#0a65cc] font-bold"
            />
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[#222325]">{displayName}</h2>
                <span className="text-sm sm:text-base text-[#74767e] font-normal">@{username}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#222325]">
                <VerifiedBadge size={16} title="Verified" />
                <span>Chakri AI Verified</span>
              </div>
              {headline.trim() && <p className="text-sm sm:text-base text-[#404145] font-normal leading-snug">{headline}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#74767e] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#74767e] shrink-0" />
                  <span>{summary.location}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#74767e] shrink-0" />
                  <span>{summary.languagesText}</span>
                </span>
              </div>
            </div>
          </div>

          <ContactButton href={summary.contactHref} className="w-full sm:w-auto shrink-0 px-6 py-2.5 rounded-[6px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8">
          <div className="lg:col-span-8 space-y-8">
            {about && (
              <section>
                <h3 className="text-base font-bold text-[#222325] mb-2.5">About me</h3>
                <p className="text-sm text-[#404145] leading-relaxed whitespace-pre-line">{about}</p>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h3 className="text-base font-bold text-[#222325] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(({ id, name }) => (
                    <span
                      key={id}
                      className="px-3.5 py-1.5 rounded-full border border-[#dadbdd] bg-white text-[#404145] text-xs sm:text-sm font-medium hover:border-[#222325] transition-colors"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <TimelineSection title="Education">
                {education.map((edu) => {
                  const year = yearOf(edu.end_date);
                  return (
                    <TimelineItem key={edu.id} icon={GraduationCap}>
                      <h4 className="text-sm font-bold text-[#222325]">{edu.school}</h4>
                      <p className="text-xs sm:text-sm text-[#62646a]">
                        {edu.degree}
                        {edu.field ? `, ${edu.field}` : ''}
                      </p>
                      <p className="text-xs text-[#95979d]">
                        {edu.current ? 'Currently Studying' : year ? `Graduated ${year}` : ''}
                      </p>
                    </TimelineItem>
                  );
                })}
              </TimelineSection>
            )}

            {certifications.length > 0 && (
              <TimelineSection title="Certifications">
                {certifications.map((cert) => {
                  const year = yearOf(cert.issue_date);
                  return (
                    <TimelineItem key={cert.id} icon={Award}>
                      <h4 className="text-sm font-bold text-[#222325]">{cert.name}</h4>
                      <p className="text-xs text-[#95979d]">{[cert.issuer, year && `Issued ${year}`].filter(Boolean).join(' • ')}</p>
                    </TimelineItem>
                  );
                })}
              </TimelineSection>
            )}

            {achievements.length > 0 && (
              <TimelineSection title="Honors & Achievements">
                {achievements.map((item) => {
                  const year = yearOf(item.date);
                  return (
                    <TimelineItem key={item.id} icon={Trophy}>
                      <h4 className="text-sm font-bold text-[#222325]">{item.title}</h4>
                      {year && <p className="text-xs text-[#95979d]">{year}</p>}
                      {item.description && (
                        <p className="text-xs sm:text-sm text-[#62646a] mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </TimelineItem>
                  );
                })}
              </TimelineSection>
            )}

            {experience.length > 0 && (
              <TimelineSection title="Experience">
                {experience.map((exp) => (
                  <TimelineItem key={exp.id} icon={Briefcase}>
                    <h4 className="text-sm font-bold text-[#222325]">{exp.title}</h4>
                    <p className="text-xs sm:text-sm text-[#62646a]">
                      {exp.company}
                      {exp.location ? ` • ${exp.location}` : ''}
                    </p>
                    <p className="text-xs text-[#95979d]">{formatDateRange(exp.start_date, exp.end_date, exp.current)}</p>
                    {exp.description && <p className="text-xs text-[#62646a] mt-1 leading-relaxed">{exp.description}</p>}
                  </TimelineItem>
                ))}
              </TimelineSection>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-[10px] border border-[#dadbdd] bg-white p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#222325]">
                <User className="w-4 h-4 text-[#74767e] shrink-0" />
                <span>On Chakri AI since {summary.memberSince}</span>
              </div>

              <div className="border-t border-[#dadbdd]" />

              <div>
                <h4 className="text-sm font-bold text-[#222325] mb-3">I speak</h4>
                <div className="space-y-2.5">
                  {(languages.length > 0
                    ? languages.map(({ id, name, proficiency }) => ({ key: id, name, label: fluencyLabel(proficiency) }))
                    : DEFAULT_LANGUAGES.map((lang) => ({ key: lang.name, ...lang }))
                  ).map(({ key, name, label }) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-[#222325] font-medium">{name}</span>
                      <span className="text-[#74767e]">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {summary.links.length > 0 && (
                <div className="border-t border-[#dadbdd] pt-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#74767e]">Links &amp; Social</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {summary.links.map(({ platform, label, href }) => (
                      <a
                        key={platform}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full border border-[#dadbdd] text-xs font-medium text-[#404145] hover:border-[#222325] hover:text-[#222325] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{label}</span>
                        <ExternalLink className="w-3 h-3 text-[#74767e]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

export function MoreAboutMeButton({ profile, summary, className }: MoreAboutMeProps & { className: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        More about me
      </button>
      {open && <MoreAboutMeModal profile={profile} summary={summary} onClose={() => setOpen(false)} />}
    </>
  );
}
