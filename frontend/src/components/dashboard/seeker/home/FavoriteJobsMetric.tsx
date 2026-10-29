'use client';

import { useSyncExternalStore } from 'react';
import { getSavedJobIds, getServerSavedJobIds, subscribeSavedJobs } from '@/utils/saved-jobs';

export function FavoriteJobsMetric() {
  const saved = useSyncExternalStore(subscribeSavedJobs, getSavedJobIds, getServerSavedJobIds);

  return saved.length;
}
