'use server';

import { refresh } from 'next/cache';
import { errorMessage } from '@/lib/client';
import { jobsApi } from '@/lib/jobs';
import { getCurrentUser } from '@/utils/session';
import type { ApplyJobState, MatchExplanationState, MatchScoresState } from '@/types/jobs';

const SEEKER_ONLY = 'Please sign in as a job seeker to view match details.';

async function isSeeker() {
  const user = await getCurrentUser().catch(() => null);
  return user?.role === 'SEEKER';
}

export async function getMatchExplanationAction(opportunityId: string): Promise<MatchExplanationState> {
  if (!(await isSeeker())) return { error: SEEKER_ONLY };

  try {
    return { data: await jobsApi.matchExplanation(opportunityId) };
  } catch (err) {
    return { error: errorMessage(err, 'Could not load match explanation') };
  }
}

export async function getMatchScoresAction(ids: string[]): Promise<MatchScoresState> {
  if (!(await isSeeker())) return { error: SEEKER_ONLY };

  try {
    return { data: await jobsApi.matchScores(ids) };
  } catch (err) {
    return { error: errorMessage(err, 'Could not load match scores') };
  }
}

export async function toggleSaveJobAction(
  jobId: string,
  jobType?: 'private' | 'govt',
): Promise<{ saved?: boolean; message?: string; error?: string }> {
  if (!(await isSeeker())) return { error: 'Please sign in as a job seeker to save jobs.' };

  try {
    const res = await jobsApi.toggleSave(jobId, jobType);
    return { saved: res.saved, message: res.message };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to update saved job') };
  }
}

export async function applyJobAction(jobId: string, _prev: ApplyJobState, formData: FormData): Promise<ApplyJobState> {
  if (!(await isSeeker())) return { error: 'Please sign in as a job seeker to apply.' };

  try {
    const data = await jobsApi.apply(jobId, formData);
    refresh();
    return { data };
  } catch (err) {
    return { error: errorMessage(err, 'Could not submit your application. Please try again.') };
  }
}
