import type { InterviewLanguage, InterviewSession, InterviewStatus } from '@/types/interviews';

const DAY_MS = 86_400_000;

export const MAX_INTERVIEW_WARNINGS = 3;
export const QUESTIONS_PER_SKILL = 3;

export const INTERVIEWER = {
  name: 'Zayn',
  label: 'Zayn — Male',
  role: 'AI Recruiter',
  description: 'Clear, upbeat male voice.',
  image: '/interview/interviewer.jpg',
  silentVideo: '/interview/silent_male.mp4',
  speakingVideo: '/interview/speaking_male.mp4',
} as const;

export const INTERVIEW_LANGUAGES: { id: InterviewLanguage; title: string; subtitle: string }[] = [
  { id: 'english', title: 'English', subtitle: 'Clear, natural English' },
  { id: 'bangla', title: 'Bangla + English', subtitle: 'Natural Bangla' },
];

export const STATUS_LABELS: Record<InterviewStatus, string> = {
  INVITED: 'Invited',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
};

export const VERDICT_LABELS: Record<string, string> = {
  strong_hire: 'Strongly recommended',
  hire: 'Recommended',
  borderline: 'Borderline',
  no_hire: 'Not recommended',
};

export function daysLeft(expiresAt: string, now: number) {
  return Math.ceil((new Date(expiresAt).getTime() - now) / DAY_MS);
}

export function canTakeInterview({ status }: Pick<InterviewSession, 'status'>) {
  return status === 'INVITED' || status === 'IN_PROGRESS';
}

export function formatDuration(seconds: number | null) {
  if (!seconds) return '—';
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? `${seconds} sec` : `${minutes} min`;
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function scoreTone(score: number) {
  if (score >= 75) return '#28a745';
  if (score >= 50) return '#d97706';
  return '#e05151';
}
