import type { AuthUser, NextStep, UserRole } from '@/types/auth';

export const SEEKER_STEPS = ['phone', 'photo', 'username', 'cv', 'career'] as const;
export const RECRUITER_STEPS = ['phone', 'photo', 'company', 'username'] as const;

export type OnboardingStep = (typeof SEEKER_STEPS)[number] | (typeof RECRUITER_STEPS)[number];

function stepsFor(role: UserRole): readonly OnboardingStep[] {
  return role === 'RECRUITER' ? RECRUITER_STEPS : SEEKER_STEPS;
}

export function dashboardPath(role: UserRole | null) {
  return role === 'RECRUITER' ? '/dashboard/recruiter' : '/dashboard/seeker';
}

function onboardingPath(role: UserRole, step: OnboardingStep) {
  return `/onboarding/${role.toLowerCase()}/${step}`;
}

export function pathForUser(user: Pick<AuthUser, 'email' | 'role' | 'nextStep'>): string {
  const { email, role, nextStep } = user;

  if (nextStep === 'verify-email') {
    return `/auth/verify-otp?email=${encodeURIComponent(email)}&type=login`;
  }
  if (nextStep === 'role' || !role) return '/onboarding/role';
  if (nextStep === 'done') return dashboardPath(role);
  return onboardingPath(role, nextStep);
}

const SEEKER_PROGRESS = ['phone', 'verify', 'photo', 'username', 'cv', 'career'] as const;
const RECRUITER_PROGRESS = ['phone', 'verify', 'photo', 'company', 'username'] as const;

export type ProgressStep = OnboardingStep | 'verify';

export function stepProgress(role: UserRole, step: ProgressStep) {
  const steps: readonly ProgressStep[] = role === 'RECRUITER' ? RECRUITER_PROGRESS : SEEKER_PROGRESS;
  const current = steps.indexOf(step) + 1;
  const total = steps.length;
  return { current, total, percent: Math.round((current / total) * 100), isLast: current === total };
}

export function isStepReachable(role: UserRole, step: OnboardingStep, nextStep: NextStep) {
  const steps = stepsFor(role);
  return steps.indexOf(step) <= steps.indexOf(nextStep as OnboardingStep);
}

export function pathAfterStep(user: Pick<AuthUser, 'email' | 'role' | 'nextStep'>, step: OnboardingStep): string {
  const { role, nextStep } = user;
  if (!role || nextStep === 'verify-email' || nextStep === 'role' || nextStep === 'done') return pathForUser(user);

  const steps = stepsFor(role);
  const following = steps[steps.indexOf(step) + 1];
  if (!following || !isStepReachable(role, following, nextStep)) return pathForUser(user);

  return onboardingPath(role, following);
}

export const RECRUITER_CANDIDATES_PATH = '/dashboard/recruiter/candidates';

export function candidateProfilePath(username: string | null) {
  return username ? `/${encodeURIComponent(username)}` : RECRUITER_CANDIDATES_PATH;
}

export const RECRUITER_MESSAGES_PATH = '/dashboard/recruiter/messages';

export const SEEKER_MESSAGES_PATH = '/dashboard/seeker/inbox';

export function messagesPath(role: UserRole | null) {
  return role === 'RECRUITER' ? RECRUITER_MESSAGES_PATH : SEEKER_MESSAGES_PATH;
}

export function chatPath(role: UserRole | null, handle: string) {
  return `${messagesPath(role)}/${encodeURIComponent(handle)}`;
}

export function messageUserPath(handle: string) {
  return `/messages/${encodeURIComponent(handle)}`;
}

export const RECRUITER_POST_JOB_PATH = '/dashboard/recruiter/post';

export const RECRUITER_MY_POSTS_PATH = '/dashboard/recruiter/my-posts';

export function myPostsPath({ status, search, page }: { status?: string; search?: string; page?: number }) {
  const params = new URLSearchParams();
  if (status) params.set('status', status.toLowerCase());
  if (search) params.set('q', search);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${RECRUITER_MY_POSTS_PATH}?${query}` : RECRUITER_MY_POSTS_PATH;
}

export function editJobPath(jobId: string) {
  return `${RECRUITER_MY_POSTS_PATH}/${encodeURIComponent(jobId)}/edit`;
}

export function jobApplicantsPath(jobId: string, { status, q, page }: { status?: string; q?: string; page?: number } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  if (page && page > 1) params.set('page', String(page));
  const query = params.toString();
  return `${RECRUITER_MY_POSTS_PATH}/${encodeURIComponent(jobId)}${query ? `?${query}` : ''}`;
}

export function jobDetailPath(jobId: string) {
  return `/jobs/${encodeURIComponent(jobId)}`;
}

export function companyProfilePath(username: string) {
  return `/company/${encodeURIComponent(username)}`;
}

export function govtJobDetailPath(jobId: string) {
  return `/jobs/govt/${encodeURIComponent(jobId)}`;
}

export const SEEKER_AI_INTERVIEW_PATH = '/dashboard/seeker/ai-interview';

export function aiInterviewPath(interviewId: string) {
  return `${SEEKER_AI_INTERVIEW_PATH}/${encodeURIComponent(interviewId)}`;
}

export function interviewLobbyPath(interviewId: string) {
  return `/interview/${encodeURIComponent(interviewId)}`;
}

export function interviewRoomPath(interviewId: string) {
  return `${interviewLobbyPath(interviewId)}/room`;
}

export function interviewReportPath(interviewId: string) {
  return `${interviewLobbyPath(interviewId)}/report`;
}
