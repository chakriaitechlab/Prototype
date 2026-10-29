import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { CompanyMark } from '@/components/ui/CompanyMark';
import type { PrivateJobItem } from '@/types/jobs';

function badgeClass(type: string) {
  switch (type?.toUpperCase()) {
    case 'FULL-TIME':
      return 'jp-badge jp-badge--full';
    case 'PART-TIME':
      return 'jp-badge jp-badge--part';
    case 'INTERNSHIP':
      return 'jp-badge jp-badge--intern';
    case 'REMOTE':
    default:
      return 'jp-badge jp-badge--contract';
  }
}

export function FeaturedJobsSection({ jobs }: { jobs: PrivateJobItem[] }) {
  if (jobs.length === 0) return null;

  return (
    <section className="jp-section jp-section--muted">
      <div className="jp-container">
        <div className="jp-section-head">
          <h2 className="jp-section-title">Featured job</h2>
          <Link href="/jobs" className="jp-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="jp-find-grid">
          {jobs.map((job) => (
            <article
              key={job.id}
              className={`jp-fcard${job.featured ? ' jp-fcard--featured' : ''}`}
            >
              {job.featured ? (
                <>
                  <span className="jp-job-featured-sheen-wrap" aria-hidden>
                    <span className="jp-job-featured-sheen" />
                  </span>
                  <span className="jp-job-featured-badge" title="Featured">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/jobpilot/featured-badge.png" alt="Featured" width={28} height={28} />
                  </span>
                </>
              ) : null}

              <div>
                <h3>
                  <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
                <div className="jp-fcard-meta">
                  <span className={badgeClass(job.type)}>{job.type}</span>
                  <span>{job.salary}</span>
                </div>
              </div>

              <div className="jp-fcard-bottom">
                <CompanyMark
                  company={job.company}
                  logoUrl={job.logoUrl}
                  className="jp-job-logo"
                />
                <div>
                  <strong>{job.company}</strong>
                  <span>
                    <MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {job.location}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
