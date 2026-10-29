import 'server-only';
import { apiFetch } from './client';
import type { UnreadCount } from '@/types/notifications';

export const notificationsApi = {
  unreadCount: () => apiFetch<UnreadCount>('/api/notifications/unread-count'),
};
