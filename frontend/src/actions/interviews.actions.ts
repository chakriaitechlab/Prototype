'use server';

import { errorMessage } from '@/lib/client';
import { interviewsApi } from '@/lib/interviews';
import { getCurrentUser } from '@/utils/session';
import type {
  InterviewActionResult,
  InterviewLanguage,
  InterviewNextStep,
  InterviewSession,
  InterviewStart,
  ViolationResult,
  ViolationType,
} from '@/types/interviews';

const SEEKER_ONLY = 'Please sign in as a job seeker to take this interview.';

async function asSeeker<T>(run: () => Promise<T>, fallback: string): Promise<InterviewActionResult<T>> {
  const user = await getCurrentUser().catch(() => null);
  if (user?.role !== 'SEEKER') return { error: SEEKER_ONLY };

  try {
    return { data: await run() };
  } catch (err) {
    return { error: errorMessage(err, fallback) };
  }
}

export async function startInterviewAction(interviewId: string, language: InterviewLanguage): Promise<InterviewActionResult<InterviewStart>> {
  return asSeeker(() => interviewsApi.start(interviewId, language), 'Could not start the interview. Please try again.');
}

export async function submitAnswerAction(interviewId: string, answer: string): Promise<InterviewActionResult<InterviewNextStep>> {
  return asSeeker(() => interviewsApi.answer(interviewId, answer), 'Could not save your answer. Please try again.');
}

export async function reportViolationAction(interviewId: string, type: ViolationType): Promise<InterviewActionResult<ViolationResult>> {
  return asSeeker(() => interviewsApi.violation(interviewId, type), 'Could not record the warning.');
}

export async function completeInterviewAction(interviewId: string, reason: 'finished' | 'left'): Promise<InterviewActionResult<{ status: string }>> {
  return asSeeker(() => interviewsApi.complete(interviewId, reason), 'Could not finish the interview. Please try again.');
}

export async function getInterviewSocketTokenAction(): Promise<InterviewActionResult<{ token: string; expiresIn: number }>> {
  return asSeeker(() => interviewsApi.socketToken(), 'Could not connect to the interview.');
}

export async function resetInterviewAction(interviewId: string): Promise<InterviewActionResult<InterviewSession>> {
  return asSeeker(() => interviewsApi.reset(interviewId), 'Could not reset the interview. Please try again.');
}
