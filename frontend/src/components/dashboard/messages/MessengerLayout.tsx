import { messagesApi } from '@/lib/messages';
import type { UserRole } from '@/types/auth';
import { requireDashboard } from '@/utils/session';
import { messagesPath } from '@/utils/routes';
import { MessengerShell } from './MessengerShell';
import type { AuthUser } from '@/types/auth';

const chatHandle = (user: AuthUser) => (user.role === 'RECRUITER' ? (user.company?.username ?? null) : user.username);

export async function MessengerLayout({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const user = await requireDashboard(role);
  const initial = await messagesApi.conversations().catch(() => null);

  return (
    <MessengerShell me={{ id: user.id, role, username: chatHandle(user) }} basePath={messagesPath(role)} initial={initial}>
      {children}
    </MessengerShell>
  );
}
