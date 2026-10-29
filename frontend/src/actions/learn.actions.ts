'use server';

import { errorMessage } from '@/lib/client';
import { learnApi } from '@/lib/learn';
import { getCurrentUser } from '@/utils/session';
import type { LearnActionResult, LearnChat } from '@/types/learn';

const SIGNED_OUT = 'Your session has expired. Please sign in again.';

async function withSeeker<T>(request: () => Promise<T>, fallback: string): Promise<LearnActionResult<T>> {
  const user = await getCurrentUser().catch(() => null);
  if (user?.role !== 'SEEKER' || user.nextStep !== 'done') return { error: SIGNED_OUT };

  try {
    return { data: await request() };
  } catch (err) {
    return { error: errorMessage(err, fallback) };
  }
}

export async function createChatAction(): Promise<LearnActionResult<LearnChat>> {
  return withSeeker(() => learnApi.create(), 'Could not start a new chat');
}

export async function renameChatAction(id: string, title: string): Promise<LearnActionResult<LearnChat>> {
  return withSeeker(() => learnApi.rename(id, title), 'Could not rename chat');
}

export async function deleteChatAction(id: string): Promise<LearnActionResult<{ message: string }>> {
  return withSeeker(() => learnApi.remove(id), 'Could not delete chat');
}
