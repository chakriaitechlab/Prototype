import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Award, CircleCheck, CodeXml, FileText, Gift, ListChecks, type LucideIcon } from 'lucide-react';
import type { JobDetail } from '@/types/jobs';
import { companyName, descriptionSections, jobsSearchPath } from '@/utils/job-detail';

const SECTION_ICONS: { pattern: RegExp; icon: LucideIcon }[] = [
  { pattern: /responsib|you will do|you'll do/i, icon: ListChecks },
  { pattern: /requir|qualif|need|nice to have/i, icon: Award },
  { pattern: /benefit|perk|offer/i, icon: Gift },
];

const ICON_PROPS = { size: 20, 'aria-hidden': true } as const;

function sectionIcon(title: string) {
  return SECTION_ICONS.find(({ pattern }) => pattern.test(title))?.icon ?? FileText;
}

export function JobDescription({ job }: { job: JobDetail }) {
  const description = job.description?.trim();
  const sections = description
    ? descriptionSections(description)
    : [
        {
          title: 'Job description',
          body: `Join ${companyName(job)} as a ${job.title}. This role is listed on Chakri.ai with AI-assisted matching for Bangladesh talent.`,
        },
      ];

  return (
    <article className="jp-jd-main">
      {sections.map(({ title, body }, index) => {
        const Icon = sectionIcon(title);
        return (
          <section key={`${title}-${index}`} className="jp-jd-section">
            <h2>
              <Icon {...ICON_PROPS} /> {title}
            </h2>
            <div className="jp-jd-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          </section>
        );
      })}

      {job.skills.length > 0 && (
        <section className="jp-jd-section">
          <h2>
            <CodeXml {...ICON_PROPS} /> Skills
          </h2>
          <div className="jp-jd-skills">
            {job.skills.map((skill) => (
              <Link key={skill} href={jobsSearchPath(skill)}>
                {skill}
              </Link>
            ))}
          </div>
        </section>
      )}

      {job.benefits.length > 0 && (
        <section className="jp-jd-section">
          <h2>
            <Gift {...ICON_PROPS} /> Benefits
          </h2>
          <ul className="jp-jd-benefits">
            {job.benefits.map((benefit) => (
              <li key={benefit}>
                <CircleCheck size={18} aria-hidden /> {benefit}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
