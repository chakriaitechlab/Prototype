'use client';

import { useState } from 'react';
import type { MatchScore } from '@/types/jobs';
import { MatchScoreBadge } from './MatchScoreBadge';
import { MatchScoreModal } from './MatchScoreModal';

type MatchScoreButtonProps = {
  opportunityId: string;
  matchScore?: MatchScore;
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

export function MatchScoreButton({ opportunityId, matchScore, size = 'sm' }: MatchScoreButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MatchScoreBadge
        score={matchScore?.score ?? 0}
        pending={matchScore?.status !== 'COMPLETED'}
        size={size}
        onClick={() => setOpen(true)}
      />
      {open && <MatchScoreModal opportunityId={opportunityId} onClose={() => setOpen(false)} />}
    </>
  );
}
