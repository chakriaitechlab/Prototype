'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin } from 'lucide-react';
import { MatchScoreButton } from '@/components/jobs/MatchScoreButton';
import type { JobBadge, MatchScore, PrivateJobItem } from '@/types/jobs';
import { SaveJobButton } from './SaveJobButton';

const BADGE_CLASS: Record<JobBadge, string> = {
  'FULL-TIME': 'jp-badge jp-badge--full',
  'PART-TIME': 'jp-badge jp-badge--part',
  INTERNSHIP: 'jp-badge jp-badge--intern',
  TEMPORARY: 'jp-badge jp-badge--contract',
  CONTRACT: 'jp-badge jp-badge--contract',
};

type PrivateJobCardProps = {
  job: PrivateJobItem;
  seekerTools?: boolean;
  matchScore?: MatchScore;
};

export function PrivateJobCard({ job, seekerTools = false, matchScore }: PrivateJobCardProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <article className={`jp-fcard${job.featured ? ' jp-fcard--featured' : ''}`}>
      {job.featured && (
        <>
          <span className="jp-job-featured-sheen-wrap" aria-hidden>
            <span className="jp-job-featured-sheen" />
          </span>
          <span className="jp-job-featured-badge" title="Featured">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jobpilot/featured-badge.png" alt="Featured" width={28} height={28} />
          </span>
        </>
      )}
      <div>
        <h3>
          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
        </h3>
        <div className="jp-fcard-meta">
          <span className={BADGE_CLASS[job.type]}>{job.type}</span>
          <span>{job.salary}</span>
          {seekerTools && <MatchScoreButton opportunityId={job.id} matchScore={matchScore} size="xs" />}
        </div>
      </div>
      <div className="jp-fcard-bottom">
        <div className="jp-card-logo" aria-hidden>
          {job.logoUrl && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={job.logoUrl} alt="" onError={() => setLogoError(true)} loading="lazy" />
          ) : (
            <div className="jp-card-logo-fallback">
              <Building2 size={20} />
            </div>
          )}
        </div>
        <div>
          <strong>{job.company}</strong>
          <span>
            <MapPin size={12} className="jp-fcard-pin" /> {job.location}
          </span>
        </div>
        {seekerTools && <SaveJobButton jobId={job.id} variant="icon" />}
      </div>
    </article>
  );
}
