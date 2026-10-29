'use server';

import { errorMessage } from '@/lib/client';
import { agentApi } from '@/lib/agent';
import { getCurrentUser } from '@/utils/session';
import type { AgentActionResult, AgentSessionDetail, AgentSocketToken } from '@/types/agent';

const SIGNED_OUT = 'Your session has expired. Please sign in again.';

async function withAgentUser<T>(request: () => Promise<T>, fallback: string): Promise<AgentActionResult<T>> {
  const user = await getCurrentUser().catch(() => null);
  if ((user?.role !== 'SEEKER' && user?.role !== 'RECRUITER') || user.nextStep !== 'done') return { error: SIGNED_OUT };

  try {
    return { data: await request() };
  } catch (err) {
    return { error: errorMessage(err, fallback) };
  }
}

export async function getAgentSocketTokenAction(): Promise<AgentActionResult<AgentSocketToken>> {
  return withAgentUser(() => agentApi.socketToken(), 'Could not connect to the agent');
}

export async function startAgentAction(message: string): Promise<AgentActionResult<AgentSessionDetail>> {
  return withAgentUser(() => agentApi.start(message), 'Could not start the agent');
}

export async function sendAgentMessageAction(id: string, message: string): Promise<AgentActionResult<{ ok: boolean }>> {
  return withAgentUser(() => agentApi.send(id, message), 'Could not send your message');
}

export async function stopAgentAction(id: string): Promise<AgentActionResult<AgentSessionDetail>> {
  return withAgentUser(() => agentApi.stop(id), 'Could not stop the agent');
}

export async function deleteAgentSessionAction(id: string): Promise<AgentActionResult<{ message: string }>> {
  return withAgentUser(() => agentApi.remove(id), 'Could not delete this chat');
}

export async function getGmailAuthUrlAction(): Promise<AgentActionResult<{ url: string }>> {
  return withAgentUser(() => agentApi.gmailAuthUrl(), 'Could not start Gmail connection');
}

export async function disconnectGmailAction(): Promise<AgentActionResult<{ message: string }>> {
  return withAgentUser(() => agentApi.disconnectGmail(), 'Could not disconnect Gmail');
}
