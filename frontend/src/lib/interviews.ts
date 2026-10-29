import 'server-only';
import { cache } from 'react';
import { apiFetch, apiStream } from './client';
import type {
  InterviewLanguage,
  InterviewNextStep,
  InterviewReport,
  InterviewSession,
  InterviewStart,
  SpeechKind,
  ViolationResult,
  ViolationType,
} from '@/types/interviews';

const interviewPath = (id: string) => `/api/interviews/${encodeURIComponent(id)}`;

export const interviewsApi = {
  list: cache(() => apiFetch<InterviewSession[]>('/api/interviews')),

  get: cache((id: string) => apiFetch<InterviewSession>(interviewPath(id))),

  start: (id: string, language: InterviewLanguage) =>
    apiFetch<InterviewStart>(`${interviewPath(id)}/start`, { method: 'POST', body: { language } }),

  answer: (id: string, answer: string) =>
    apiFetch<InterviewNextStep>(`${interviewPath(id)}/answer`, { method: 'POST', body: { answer } }),

  violation: (id: string, type: ViolationType) =>
    apiFetch<ViolationResult>(`${interviewPath(id)}/violations`, { method: 'POST', body: { type } }),

  complete: (id: string, reason: 'finished' | 'left') =>
    apiFetch<{ status: string }>(`${interviewPath(id)}/complete`, { method: 'POST', body: { reason } }),

  reset: (id: string) => apiFetch<InterviewSession>(`${interviewPath(id)}/reset`, { method: 'POST' }),

  report: cache((id: string) => apiFetch<InterviewReport>(`${interviewPath(id)}/report`)),

  socketToken: () => apiFetch<{ token: string; expiresIn: number }>('/api/interviews/socket-token', { method: 'POST' }),

  streamSpeech: (id: string, body: { kind: SpeechKind; language?: InterviewLanguage }, signal: AbortSignal) =>
    apiStream(`${interviewPath(id)}/speech`, { method: 'POST', body, signal }),
};
