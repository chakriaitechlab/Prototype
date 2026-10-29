import 'server-only';
import { apiFetch } from './client';
import type { AgentConnector, AgentSession, AgentSessionDetail, AgentSocketToken } from '@/types/agent';

const sessionPath = (id: string) => `/api/agent/sessions/${encodeURIComponent(id)}`;

export const agentApi = {
  socketToken: (): Promise<AgentSocketToken> => apiFetch('/api/agent/socket-token', { method: 'POST' }),

  list: (): Promise<AgentSession[]> => apiFetch('/api/agent/sessions'),

  start: (message: string): Promise<AgentSessionDetail> => apiFetch('/api/agent/sessions', { method: 'POST', body: { message } }),

  get: (id: string): Promise<AgentSessionDetail> => apiFetch(sessionPath(id)),

  send: (id: string, message: string): Promise<{ ok: boolean }> =>
    apiFetch(`${sessionPath(id)}/messages`, { method: 'POST', body: { message } }),

  stop: (id: string): Promise<AgentSessionDetail> => apiFetch(`${sessionPath(id)}/stop`, { method: 'POST' }),

  remove: (id: string): Promise<{ message: string }> => apiFetch(sessionPath(id), { method: 'DELETE' }),

  connectors: (): Promise<AgentConnector[]> => apiFetch('/api/agent/connectors'),

  gmailAuthUrl: (): Promise<{ url: string }> => apiFetch('/api/agent/connectors/gmail/auth-url', { method: 'POST' }),

  connectGmail: (code: string, state: string): Promise<AgentConnector> =>
    apiFetch('/api/agent/connectors/gmail', { method: 'POST', body: { code, state } }),

  disconnectGmail: (): Promise<{ message: string }> => apiFetch('/api/agent/connectors/gmail', { method: 'DELETE' }),
};
