import { ApiError } from '@/lib/client';
import { messagesApi } from '@/lib/messages';
import type { UserRole } from '@/types/auth';
import { requireDashboard } from '@/utils/session';
import { messagesPath } from '@/utils/routes';
import { ChatNotFound } from './ChatNotFound';
import { ChatWindow } from './ChatWindow';

const EMPTY_PAGE = { items: [], hasMore: false };

export async function ChatRoute({ role, params }: { role: UserRole; params: Promise<{ handle: string }> }) {
  await requireDashboard(role);
  const { handle } = await params;

  const thread = await messagesApi.peer(handle).catch((err: unknown) => {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  });
  if (!thread) return <ChatNotFound backHref={messagesPath(role)} />;

  const page = thread.id ? await messagesApi.messages(thread.id).catch(() => null) : EMPTY_PAGE;

  return <ChatWindow key={thread.peer.id} initialThread={thread} initialPage={page} />;
}
