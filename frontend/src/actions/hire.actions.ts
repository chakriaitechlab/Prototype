'use server';

import { updateTag } from 'next/cache';
import { errorMessage } from '@/lib/client';
import { hireApi } from '@/lib/hire';
import { getCurrentUser } from '@/utils/session';
import type { ActionState } from '@/types/auth';
import type { ApplicantDecision, HireJobCreate, PostJobState } from '@/types/hire';
import { jobDetailTag } from '@/utils/job-detail';

const RECRUITER_ONLY = 'Please sign in as a recruiter to manage jobs.';

async function isRecruiter() {
  const user = await getCurrentUser().catch(() => null);
  return user?.role === 'RECRUITER';
}

export async function postJobAction(job: HireJobCreate): Promise<PostJobState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    return { job: await hireApi.create(job) };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to post job') };
  }
}

export async function updateJobAction(jobId: string, job: HireJobCreate): Promise<PostJobState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    const updated = await hireApi.update(jobId, job);
    updateTag(jobDetailTag(jobId));
    return { job: updated };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to update job') };
  }
}

export async function expireJobAction(jobId: string): Promise<ActionState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    await hireApi.updateStatus(jobId, 'CLOSED');
    updateTag(jobDetailTag(jobId));
    return { message: 'Job marked as expired' };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to expire job') };
  }
}

export async function resumeJobAction(jobId: string): Promise<ActionState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    await hireApi.updateStatus(jobId, 'ACTIVE');
    updateTag(jobDetailTag(jobId));
    return { message: 'Job resumed' };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to resume job') };
  }
}

export async function deleteJobAction(jobId: string): Promise<ActionState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    await hireApi.remove(jobId);
    updateTag(jobDetailTag(jobId));
    return { message: 'Post deleted' };
  } catch (err) {
    return { error: errorMessage(err, 'Failed to delete post') };
  }
}

const DECISION_MESSAGES: Record<ApplicantDecision, { success: string; failure: string }> = {
  invite: { success: 'Interview invite sent', failure: 'Failed to send the interview invite' },
  reject: { success: 'Applicant rejected', failure: 'Failed to reject the applicant' },
};

export async function decideApplicantAction(
  jobId: string,
  applicationId: string,
  decision: ApplicantDecision,
  note: string,
): Promise<ActionState> {
  if (!(await isRecruiter())) return { error: RECRUITER_ONLY };

  try {
    await hireApi.decide(jobId, applicationId, decision, note.trim() || undefined);
    return { message: DECISION_MESSAGES[decision].success };
  } catch (err) {
    return { error: errorMessage(err, DECISION_MESSAGES[decision].failure) };
  }
}
