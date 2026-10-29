'use client';

import { useEffect, useState } from 'react';
import { getMatchScoresAction } from '@/actions/jobs.actions';
import type { MatchScore } from '@/types/jobs';

const MATCH_POLL_MS = 5000;

/** Loads match scores for the given jobs and polls while any is still pending. */
export function useMatchScores(ids: string[], enabled = true) {
  const [scores, setScores] = useState<Record<string, MatchScore>>({});
  const idsKey = [...new Set(ids)].join(',');

  useEffect(() => {
    if (!enabled || !idsKey) return;
    const wanted = idsKey.split(',').filter((id) => scores[id]?.status !== 'COMPLETED');
    if (wanted.length === 0) return;

    const onlyPending = wanted.every((id) => scores[id]);
    let active = true;
    const timer = setTimeout(async () => {
      const result = await getMatchScoresAction(wanted);
      if (!active || 'error' in result) return;
      setScores((prev) => ({ ...prev, ...Object.fromEntries(result.data.map((score) => [score.opportunityId, score])) }));
    }, onlyPending ? MATCH_POLL_MS : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [enabled, idsKey, scores]);

  return scores;
}
