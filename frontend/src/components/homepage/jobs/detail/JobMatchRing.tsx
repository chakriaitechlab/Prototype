'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
import { MatchScoreModal } from '@/components/jobs/MatchScoreModal';
import { useMatchScores } from '@/hooks/useMatchScores';

const TIERS = [
  { min: 80, label: 'Strong match' },
  { min: 65, label: 'Good match' },
  { min: 50, label: 'Fair match' },
  { min: 0, label: 'Low match' },
];

export function JobMatchRing({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const matchScore = useMatchScores([jobId])[jobId];
  const pending = matchScore?.status !== 'COMPLETED';
  const value = Math.round(Math.min(Math.max(matchScore?.score ?? 0, 0), 100));
  const tier = TIERS.find(({ min }) => value >= min) ?? TIERS[TIERS.length - 1];

  return (
    <>
      <button
        type="button"
        className="jp-jd-match jp-jd-match--button"
        onClick={() => setOpen(true)}
        title="Click to view AI Match explanation"
      >
        <span className="jp-jd-match-ring" style={{ '--score': `${pending ? 0 : value}%` } as CSSProperties} aria-hidden>
          <span>{pending ? <Loader2 size={15} className="animate-spin" /> : `${value}%`}</span>
        </span>
        <div>
          <strong>{pending ? 'Calculating match…' : tier.label}</strong>
          <small>Based on your profile</small>
        </div>
        <span className="jp-jd-match-action">View details</span>
      </button>
      {open && <MatchScoreModal opportunityId={jobId} onClose={() => setOpen(false)} />}
    </>
  );
}

export function JobMatchLoginPrompt({ href }: { href: string }) {
  return (
    <Link href={href} className="jp-jd-match jp-jd-match--locked">
      <span className="jp-jd-match-ring" aria-hidden>
        <span>
          <Lock size={15} />
        </span>
      </span>
      <div>
        <strong>See your match score</strong>
        <small>Log in to check how well you fit this job</small>
      </div>
      <span className="jp-jd-match-action">Log in</span>
    </Link>
  );
}
